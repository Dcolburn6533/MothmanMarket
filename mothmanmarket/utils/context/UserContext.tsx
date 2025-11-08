'use client'

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from "react";
import { createClient } from '@supabase/supabase-js'

interface UserContextType {
    userId: string | null;
    setUserId:  Dispatch<SetStateAction<string | null>>;
    balance: number | null;
    setBalance: Dispatch<SetStateAction<number | null>>;
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);

    console.log(userId)
    return (
        <UserContext.Provider value={{ userId, setUserId, balance, setBalance }}>
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
