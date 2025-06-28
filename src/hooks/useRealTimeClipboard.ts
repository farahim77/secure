
import { useState, useEffect, useCallback } from 'react';
import { useClipboardApi } from './useClipboardApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ClipboardState {
  content: string;
  contentType: string;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
}

export function useRealTimeClipboard() {
  const { toast } = useToast();
  const { currentDevice, session } = useAuth();
  const { 
    uploadClipboard, 
    getLatestClipboard, 
    validatePaste, 
    generateContentHash,
    isAuthenticated 
  } = useClipboardApi();

  const [clipboardState, setClipboardState] = useState<ClipboardState>({
    content: '',
    contentType: 'text',
    lastSync: null,
    syncStatus: 'idle'
  });

  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  // Initialize encryption key
  useEffect(() => {
    generateEncryptionKey();
  }, []);

  const generateEncryptionKey = async () => {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
      setEncryptionKey(key);
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
    }
  };

  const encryptContent = async (content: string): Promise<{
    encrypted: string;
    iv: string;
  } | null> => {
    if (!encryptionKey) return null;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        data
      );

      return {
        encrypted: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  const decryptContent = async (encryptedHex: string, ivHex: string): Promise<string | null> => {
    if (!encryptionKey) return null;

    try {
      const encrypted = new Uint8Array(encryptedHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  const syncToCloud = useCallback(async (content: string, contentType = 'text') => {
    if (!isAuthenticated || !currentDevice) return;

    setClipboardState(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      const encrypted = await encryptContent(content);
      if (!encrypted) {
        throw new Error('Encryption failed');
      }

      const clipboardEntry = await uploadClipboard({
        encrypted_content: encrypted.encrypted,
        content_type: contentType,
        encryption_metadata: {
          iv: encrypted.iv,
          algorithm: 'AES-GCM',
          keyLength: 256
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

      if (clipboardEntry) {
        setClipboardState(prev => ({
          ...prev,
          content,
          contentType,
          lastSync: new Date(),
          syncStatus: 'idle'
        }));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setClipboardState(prev => ({ ...prev, syncStatus: 'error' }));
      
      toast({
        title: "Sync failed",
        description: "Failed to sync clipboard to cloud",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, currentDevice, uploadClipboard, encryptContent, toast]);

  const syncFromCloud = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const latestEntry = await getLatestClipboard();
      if (!latestEntry) return;

      const decrypted = await decryptContent(
        latestEntry.encrypted_content,
        latestEntry.encryption_metadata.iv
      );

      if (decrypted) {
        setClipboardState(prev => ({
          ...prev,
          content: decrypted,
          contentType: latestEntry.content_type,
          lastSync: new Date(latestEntry.created_at),
          syncStatus: 'idle'
        }));

        // Copy to system clipboard
        await navigator.clipboard.writeText(decrypted);
        
        toast({
          title: "Clipboard updated",
          description: "Latest clipboard content synchronized",
        });
      }
    } catch (error) {
      console.error('Sync from cloud failed:', error);
    }
  }, [isAuthenticated, getLatestClipboard, decryptContent, toast]);

  const validateClipboardPaste = useCallback(async (
    targetDomain?: string,
    targetApplication?: string
  ) => {
    if (!clipboardState.content) return { allowed: true, reason: 'No content' };

    const contentHash = await generateContentHash(clipboardState.content);
    
    return await validatePaste({
      domain: targetDomain,
      application: targetApplication,
      content_hash: contentHash
    });
  }, [clipboardState.content, validatePaste, generateContentHash]);

  // Monitor system clipboard changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text !== clipboardState.content) {
          await syncToCloud(text);
        }
      } catch (error) {
        // Clipboard access denied or not available
      }
    };

    // Check clipboard every 5 seconds
    const interval = setInterval(checkClipboard, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, clipboardState.content, syncToCloud]);

  // Sync from cloud every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(syncFromCloud, 30000);
    
    // Initial sync
    syncFromCloud();

    return () => clearInterval(interval);
  }, [isAuthenticated, syncFromCloud]);

  return {
    clipboardState,
    syncToCloud,
    syncFromCloud,
    validateClipboardPaste,
    isAuthenticated
  };
}
