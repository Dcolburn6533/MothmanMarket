'use client'

import { use, useEffect, useState } from 'react'
import { useUser } from '@/utils/context/UserContext'
import { supabase } from '@/utils/supabase/client'

export default function WalletHolder() {

    const user = useUser()
    const [ data, setData ] = useState(null)
    const [ error, setErr ] = useState(null)
    const [ currentHoldings, setCurrentHoldings ] = useState(null)
    const [ isEmpty, setIsEmpty ] = useState(false)

    const fetchUserData = async () => {
        try {
            const {data, error } = await supabase   
                .from('profiles')
                .select('*')
                //.eq('user_id', 'b1e98c85-6232-4a9c-945d-5aee59061054')
                .eq('user_id', user.userId )

            if(error) {
                setErr(error)
                setData(null)
                console.error(`Error: `, error)
            } else {
                console.log(`User account: `, data)
                if(data.length <= 0){
                    //console.log("bruv")
                    console.error(`Cannot find user with id: ${user.userId}`)
                    setData(null)
                } else {
                    user.setBalance(data[0].balance) 
                    setData(data[0])
                    setErr(null)
                }   
            }
        
        } catch (err) {
            setErr(err);
            setData(null);
        }
    }

    const fetchCurrentHoldings = async () => {
        try {
            const {data, error } = await supabase   
                .from('transactions')
                .select('*')
                //.eq('user_id', 'b1e98c85-6232-4a9c-945d-5aee59061054')
                .eq('user_id', user.userId )
                    // (b1e98c85-6232-4a9c-945d-5aee59061054,alice)
            if(error) {
                setErr(error)
                setData(null)
                console.error(`Error: `, error)

            } else {
                console.log(`User's holdings: `, data)
                setCurrentHoldings(data)
                setErr(null)

                if(data.length <= 0){
                    console.log(`WARNING! User currently has no holdings!`)
                    setIsEmpty(true)
                }
                // currently does NOT feed to React context
            }
        
        } catch (err) {
            setErr(err);
            setData(null);
        }
    }


    useEffect(() => {
        // Fetch once when the page is initially loaded
        fetchUserData();
        fetchCurrentHoldings();

        // Fetch data every 5 seconds
        const intervalId = setInterval(() => {
            fetchUserData();
            fetchCurrentHoldings();
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
            
            <br/><br/>

            {currentHoldings && currentHoldings.length > 0 ?
                <div>
                    <h1>This user currently is holding:</h1>
                    <pre>{JSON.stringify(currentHoldings, null, 2)}</pre>
                </div>
            :
                <h1>This user currently does not have any holdings.</h1>
            }

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