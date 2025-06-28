
import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  currentDevice: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  currentDevice: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDevice, setCurrentDevice] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Create user profile if it doesn't exist
          setTimeout(async () => {
            await createUserProfile(session.user);
            await createOrUpdateDevice(session.user.id);
          }, 0);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          await createOrUpdateDevice(session.user.id);
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          role: 'developer',
          updated_at: new Date().toISOString(),
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const createOrUpdateDevice = async (userId: string) => {
    try {
      // Generate a device fingerprint
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      const deviceFingerprint = btoa(JSON.stringify(deviceInfo));
      const deviceName = `${navigator.platform} Browser`;
      
      // Generate a simple public key for demo purposes
      const publicKey = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );
      
      const exportedKey = await crypto.subtle.exportKey("spki", publicKey.publicKey);
      const publicKeyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

      const { data, error } = await supabase
        .from('devices')
        .upsert({
          user_id: userId,
          device_name: deviceName,
          device_type: 'browser',
          public_key: publicKeyString,
          last_active: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating device:', error);
      } else {
        setCurrentDevice(data.id);
      }
    } catch (error) {
      console.error('Error creating/updating device:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCurrentDevice(null);
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, currentDevice }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
