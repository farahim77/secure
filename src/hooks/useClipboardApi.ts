
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface DomainRule {
  id: string;
  domain: string;
  rule_type: 'whitelist' | 'blacklist';
  is_active: boolean;
  created_at: string;
}

interface ApplicationRule {
  id: string;
  application_name: string;
  rule_type: 'whitelist' | 'blacklist';
  is_active: boolean;
  created_at: string;
}

interface PasteValidation {
  allowed: boolean;
  reason: string;
}

export function useClipboardApi() {
  const { toast } = useToast();
  const { session, currentDevice } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const { data: entry, error } = await supabase
        .from('clipboard_entries')
        .insert({
          user_id: session.user.id,
          device_id: currentDevice,
          encrypted_content: data.encrypted_content,
          content_type: data.content_type,
          encryption_metadata: data.encryption_metadata,
          expires_at: data.expires_at,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create audit log
      await createAuditLog({
        user_id: session.user.id,
        device_id: currentDevice,
        action: 'copy',
        content_hash: await generateContentHash(data.encrypted_content),
        status: 'success',
        metadata: { content_type: data.content_type }
      });

      toast({
        title: "Clipboard synced",
        description: "Your clipboard data has been securely uploaded",
      });

      return entry;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to sync clipboard data",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestClipboard = async (): Promise<ClipboardEntry | null> => {
    if (!session?.user) return null;

    setIsLoading(true);
    try {
      const { data: entry, error } = await supabase
        .from('clipboard_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return entry;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getClipboardHistory = async (limit = 20, offset = 0): Promise<ClipboardEntry[]> => {
    if (!session?.user) return [];

    setIsLoading(true);
    try {
      const { data: entries, error } = await supabase
        .from('clipboard_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return entries || [];
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

    try {
      // Get user's organization
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (!userData?.organization_id) {
        // Create audit log for validation
        await createAuditLog({
          user_id: session.user.id,
          device_id: currentDevice,
          action: 'allow',
          target_domain: data.domain,
          target_application: data.application,
          content_hash: data.content_hash,
          status: 'success',
          metadata: { reason: 'No organization rules' }
        });
        return { allowed: true, reason: 'No organization rules' };
      }

      let allowed = true;
      let reason = 'Default allow';

      // Check domain rules if domain is provided
      if (data.domain) {
        const { data: domainRules } = await supabase
          .from('domain_rules')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .eq('is_active', true);

        if (domainRules) {
          const blacklistRule = domainRules.find(rule => 
            rule.rule_type === 'blacklist' && 
            (rule.domain === data.domain || data.domain.includes(rule.domain))
          );

          const whitelistRule = domainRules.find(rule => 
            rule.rule_type === 'whitelist' && 
            (rule.domain === data.domain || data.domain.includes(rule.domain))
          );

          if (blacklistRule) {
            allowed = false;
            reason = 'Domain blacklisted';
          } else if (domainRules.some(rule => rule.rule_type === 'whitelist') && !whitelistRule) {
            allowed = false;
            reason = 'Domain not whitelisted';
          }
        }
      }

      // Check application rules if application is provided
      if (data.application && allowed) {
        const { data: appRules } = await supabase
          .from('application_rules')
          .select('*')
          .eq('organization_id', userData.organization_id)
          .eq('is_active', true);

        if (appRules) {
          const blacklistRule = appRules.find(rule => 
            rule.rule_type === 'blacklist' && 
            data.application!.toLowerCase().includes(rule.application_name.toLowerCase())
          );

          const whitelistRule = appRules.find(rule => 
            rule.rule_type === 'whitelist' && 
            data.application!.toLowerCase().includes(rule.application_name.toLowerCase())
          );

          if (blacklistRule) {
            allowed = false;
            reason = 'Application blacklisted';
          } else if (appRules.some(rule => rule.rule_type === 'whitelist') && !whitelistRule) {
            allowed = false;
            reason = 'Application not whitelisted';
          }
        }
      }

      // Create audit log
      await createAuditLog({
        user_id: session.user.id,
        device_id: currentDevice,
        action: allowed ? 'allow' : 'block',
        target_domain: data.domain,
        target_application: data.application,
        content_hash: data.content_hash,
        status: allowed ? 'success' : 'blocked',
        metadata: { reason }
      });

      return { allowed, reason };
    } catch (error) {
      console.error('Validation error:', error);
      return { allowed: false, reason: 'Validation error' };
    }
  };

  const getDomainRules = async (): Promise<{
    domain_rules: DomainRule[];
    application_rules: ApplicationRule[];
  }> => {
    if (!session?.user) return { domain_rules: [], application_rules: [] };

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      if (!userData?.organization_id) {
        return { domain_rules: [], application_rules: [] };
      }

      const { data: domainRules } = await supabase
        .from('domain_rules')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .eq('is_active', true);

      const { data: applicationRules } = await supabase
        .from('application_rules')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .eq('is_active', true);

      return {
        domain_rules: (domainRules || []).map(rule => ({
          id: rule.id,
          domain: rule.domain,
          rule_type: rule.rule_type as 'whitelist' | 'blacklist',
          is_active: rule.is_active,
          created_at: rule.created_at
        })),
        application_rules: (applicationRules || []).map(rule => ({
          id: rule.id,
          application_name: rule.application_name,
          rule_type: rule.rule_type as 'whitelist' | 'blacklist',
          is_active: rule.is_active,
          created_at: rule.created_at
        }))
      };
    } catch (error) {
      console.error('Rules fetch error:', error);
      return { domain_rules: [], application_rules: [] };
    }
  };

  const createAuditLog = async (logData: {
    user_id: string;
    device_id: string;
    action: string;
    target_domain?: string;
    target_application?: string;
    content_hash: string;
    status: string;
    metadata?: any;
  }) => {
    try {
      // Get the previous log hash for chaining
      const { data: previousLog } = await supabase
        .from('audit_logs')
        .select('hmac_signature')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const previousLogHash = previousLog?.hmac_signature || 'genesis';

      // Create HMAC signature for tamper-proofing
      const logString = JSON.stringify({
        ...logData,
        previous_log_hash: previousLogHash,
        timestamp: new Date().toISOString()
      });

      const hmacSignature = await generateHMAC(logString);

      // Insert the audit log
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          ...logData,
          hmac_signature: hmacSignature,
          previous_log_hash: previousLogHash
        });

      if (error) {
        console.error('Failed to create audit log:', error);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  };

  const generateHMAC = async (data: string): Promise<string> => {
    const secret = 'default-secret-key'; // In production, this should come from environment
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateContentHash = async (content: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return {
    isLoading,
    uploadClipboard,
    getLatestClipboard,
    getClipboardHistory,
    validatePaste,
    getDomainRules,
    generateContentHash,
    isAuthenticated: !!session?.user
  };
}
