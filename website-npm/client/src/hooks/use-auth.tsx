import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { apiRequest, queryClient, setAuthToken, clearAuthToken, getAuthToken } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the user structure based on your external API
export interface ExternalUser {
  id: number;
  username: string;
  email: string;
  role?: string;
}

// Define the registration data structure
export interface RegisterData extends Pick<InsertUser, "username" | "password"> {
  email: string;
}

type AuthContextType = {
  user: ExternalUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Since there is no /users/me endpoint, we'll use the token's user information
  // instead of making an additional API call
  const [currentUser, setCurrentUser] = useState<ExternalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to decode JWT token and extract user info
  const decodeToken = (token: string) => {
    try {
      // For JWT tokens, you would typically decode and verify here
      // Since we can't verify without the secret, we'll just extract the payload
      // This is a simple approach - in production, you would use a proper JWT library
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        // Try to decode the payload part of the JWT
        const payload = JSON.parse(atob(tokenParts[1]));
        return {
          id: payload.id || payload.userId || 0,
          username: payload.username || payload.name || 'User',
          email: payload.email || '',
          role: payload.role || 'user'
        };
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Use an effect to decode the token and extract user information when the component mounts
  useEffect(() => {
    const token = getAuthToken();
    setIsLoading(true);
    
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setCurrentUser(decodedUser);
      } else {
        // If token couldn't be decoded, create a minimal user object
        // This is a fallback for non-JWT tokens
        setCurrentUser({
          id: 1, // Placeholder ID
          username: 'User',
          email: '',
          role: 'user'
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error processing auth token:', err);
      setError(err instanceof Error ? err : new Error('Failed to process authentication'));
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login mutation - authenticate and get token
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const data = await res.json();
      
      // Save token from response
      if (data.token) {
        setAuthToken(data.token);
        const decodedUser = decodeToken(data.token);
        if (decodedUser) {
          setCurrentUser(decodedUser);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/login/register", userData);
      const data = await res.json();
      
      // Save token if returned in the response
      if (data.token) {
        setAuthToken(data.token);
        const decodedUser = decodeToken(data.token);
        if (decodedUser) {
          setCurrentUser(decodedUser);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Just clear token - no server call needed for token-based auth
      clearAuthToken();
      setCurrentUser(null);
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
