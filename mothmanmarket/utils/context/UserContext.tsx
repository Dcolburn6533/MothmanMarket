'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { createClient } from '@supabase/supabase-js'

interface UserContextType {
    userId: string | null | undefined; // undefined while initializing
    setUserId: (id: string | null) => void;
    balance: number | null;
    setBalance: (balance: number | null) => void;
    initialized: boolean;
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
        const [userId, setUserId] = useState<string | null>(null);
        const [balance, setBalance] = useState<number | null>(null);
        const [initialized, setInitialized] = useState<boolean>(false);

        useEffect(() => {
            try {
                const stored = localStorage.getItem('user_id');
                if (stored) setUserId(stored);
            } catch {
                // ignore in non-browser environments
            } finally {
                setInitialized(true);
            }
        }, []);

        return (
                <UserContext.Provider value={{ userId, setUserId, balance, setBalance, initialized }}>
                        { children }
                </UserContext.Provider>
        );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);

    if(context === undefined){
        throw new Error('useUser must be used within a UserProvider')
    }

    return context;
}
    
//export default UserContext;
