'use client'

import { use, useEffect, useState } from 'react'
import { useUser } from '@/utils/context/UserContext'
import { supabase } from '@/utils/supabase/client'

export default function WalletHolder() {

    const user = useUser()
    const [ data, setData ] = useState(null)
    const [ error, setErr ] = useState(null)

    const fetchData = async () => {
        try {
            const {data, error } = await supabase   
                .from('profiles')
                .select('*')
                .eq('user_id', user.userId )

            if(error) {
                setErr(error)
                setData(null)
                console.err(`Error: `, error)
            } else {
                console.log(`Results retrieved, currently has: `, data[0])
                user.setBalance(data[0].balance) 
                setData(data[0])
                setErr(null)
            }

            // TODO: deal with user not found error
            // if(!data){
            //     return <div>No profile data found for user {user.userId}</div>
            // }
        
        } catch (err) {
            setErr(err);
            setData(null);
        }
    }


    useEffect(() => {
        // Fetch once when the page is initially loaded
        fetchData();

        // Fetch data every 5 seconds
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000)

        // Clean up
        return () => clearInterval(intervalId);
    }, [])

    if(error){
        return(
            <div>Error encountered: {error.message}</div>
        )
    }

    if(!data){
        return(
            <div>Loading...</div>
        )
    }

    return(
        <div>
            <h1>User data from Supabase:</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )

    // return (
    //     <div>
    //         Found data for username: {data.username}
    //         <br />
    //         Current balance: {data.balance}
    //     </div>
    // )
}