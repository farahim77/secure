
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { flaskApi } from '@/services/flaskApi';

interface ClipboardEntry {
  id: string;
  user_id: string;
  device_id: string;
  encrypted_content: string;
  content_type: string;
  encryption_metadata: any;
  shared_with: string[];
  expires_at?: string;
  created_at: string;
}

interface PasteValidation {
  allowed: boolean;
  reason: string;
}

export function useFlaskClipboardApi() {
  const { toast } = useToast();
  const { session, currentDevice } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if Flask API is available
  const checkFlaskConnection = async (): Promise<boolean> => {
    try {
      const response = await flaskApi.healthCheck();
      return response.success;
    } catch {
      return false;
    }
  };

  const uploadClipboard = async (data: {
    encrypted_content: string;
    content_type: string;
    encryption_metadata: any;
    expires_at?: string;
  }): Promise<ClipboardEntry | null> => {
    if (!session?.user || !currentDevice) {
      toast({
        title: "Authentication required",
        description: "Please login to sync clipboard data",
        variant: "destructive"
      });
      return null;
    }

    // Check Flask connection
    const isConnected = await checkFlaskConnection();
    if (!isConnected) {
      toast({
        title: "Flask API not available",
        description: "Make sure Flask backend is running on localhost:5000",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      if (session?.access_token) {
        flaskApi.setToken(session.access_token);
      }

      const response = await flaskApi.uploadClipboard({
        user_id: session.user.id,
        device_id: currentDevice,
        encrypted_content: data.encrypted_content,
        content_type: data.content_type,
        encryption_metadata: data.encryption_metadata,
        expires_at: data.expires_at,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Upload failed');
      }

      // Create audit log
      const contentHash = await generateContentHash(data.encrypted_content);
      await flaskApi.createAuditLog({
        user_id: session.user.id,
        device_id: currentDevice,
        action: 'copy',
        content_hash: contentHash,
        status: 'success',
        metadata: { content_type: data.content_type }
      });

      toast({
        title: "Clipboard synced",
        description: "Your clipboard data has been securely uploaded",
      });

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to sync clipboard data",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestClipboard = async (): Promise<ClipboardEntry | null> => {
    if (!session?.user) return null;

    const isConnected = await checkFlaskConnection();
    if (!isConnected) {
      toast({
        title: "Flask API not available",
        description: "Make sure Flask backend is running on localhost:5000",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      if (session?.access_token) {
        flaskApi.setToken(session.access_token);
      }

      const response = await flaskApi.getLatestClipboard(session.user.id);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data || null;
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Fetch failed",
        description: error instanceof Error ? error.message : "Failed to fetch clipboard",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getClipboardHistory = async (limit = 20, offset = 0): Promise<ClipboardEntry[]> => {
    if (!session?.user) return [];

    const isConnected = await checkFlaskConnection();
    if (!isConnected) return [];

    setIsLoading(true);
    try {
      if (session?.access_token) {
        flaskApi.setToken(session.access_token);
      }

      const response = await flaskApi.getClipboardHistory(session.user.id, limit, offset);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data || [];
    } catch (error) {
      console.error('History fetch error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const validatePaste = async (data: {
    domain?: string;
    application?: string;
    content_hash: string;
  }): Promise<PasteValidation> => {
    if (!session?.user || !currentDevice) {
      return { allowed: false, reason: 'Not authenticated' };
    }

    const isConnected = await checkFlaskConnection();
    if (!isConnected) {
      return { allowed: false, reason: 'Flask API not available' };
    }

    try {
      if (session?.access_token) {
        flaskApi.setToken(session.access_token);
      }

      const response = await flaskApi.validatePaste({
        user_id: session.user.id,
        device_id: currentDevice,
        domain: data.domain,
        application: data.application,
        content_hash: data.content_hash,
      });

      if (!response.success || !response.data) {
        return { allowed: false, reason: response.error || 'Validation failed' };
      }

      return response.data;
    } catch (error) {
      console.error('Validation error:', error);
      return { allowed: false, reason: 'Validation error' };
    }
  };

  const generateContentHash = async (content: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const analyzeContent = async (content: string) => {
    const isConnected = await checkFlaskConnection();
    if (!isConnected) {
      toast({
        title: "Flask API not available",
        description: "Make sure Flask backend is running on localhost:5000",
        variant: "destructive"
      });
      return null;
    }

    try {
      if (session?.access_token) {
        flaskApi.setToken(session.access_token);
      }

      const response = await flaskApi.analyzeContent(content);
      
      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }

      return response.data;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze content",
        variant: "destructive"
      });
      return null;
    }
  };

  const scanContent = async (content: string) => {
    const isConnected = await checkFlaskConnection();
    if (!isConnected) {
      toast({
        title: "Flask API not available",
        description: "Make sure Flask backend is running on localhost:5000",
        variant: "destructive"
      });
      return null;
    }

    try {
      if (session?.access_token) {
        flaskApi.setToken(session.access_token);
      }

      const response = await flaskApi.scanContent(content);
      
      if (!response.success) {
        throw new Error(response.error || 'Scan failed');
      }

      return response.data;
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Failed to scan content",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    isLoading,
    uploadClipboard,
    getLatestClipboard,
    getClipboardHistory,
    validatePaste,
    generateContentHash,
    analyzeContent,
    scanContent,
    checkFlaskConnection,
    isAuthenticated: !!session?.user
  };
}
