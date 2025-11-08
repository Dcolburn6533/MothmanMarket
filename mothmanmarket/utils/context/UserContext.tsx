'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { createClient } from '@supabase/supabase-js'

interface UserContextType {
    userId: string | null | undefined; // undefined while initializing
    setUserId: (id: string | null) => void;
    initialized: boolean;
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    // userId: undefined = not yet initialized, null = no logged-in user, string = user id
    const [userId, setUserIdState] = useState<string | null | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);

    // initialize from localStorage on client mount so context persists across reloads
    useEffect(() => {
        try {
            const saved = localStorage.getItem('user_id');
            if (saved) {
                setUserIdState(saved);
            } else {
                setUserIdState(null);
            }
        } catch {
            setUserIdState(null);
        } finally {
            setInitialized(true);
        }
    }, []);

    // wrapper setter that persists to localStorage and updates state
    const setUserId = (id: string | null) => {
        try {
            if (id) {
                localStorage.setItem('user_id', id);
            } else {
                localStorage.removeItem('user_id');
            }
        } catch {
            // ignore localStorage errors
        }
        setUserIdState(id);
    };

    return (
        <UserContext.Provider value={{ userId, setUserId, initialized }}>
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