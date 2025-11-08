'use client'

import { useState } from 'react'
import { useUser } from '@/utils/context/UserContext'

export default function Dashboard({data}) {
    
    const user = useUser()

    console.log(`Refreshing page. Dashboard has data: `, data)
    
    if(!data){
        return <div>No profile data found for user {user.userId}</div>
    }

    // const { data, error } = await supabase
    //     .from('profiles')
    //     .select('*')
    //     .eq('user_id', user.userId )

    //     // 84cc420e-c2e6-45a3-afeb-9a0efca0d5ce

    //     if(error) {
    //         console.error('Error fetching data', error.message)
    //     } else {
    //         console.log('Fetched data: ', data)
    //     }

    return (
        <div>
            Found data for username: {data[0].username}
            <br />
            Current balance: {data[0].balance}
        </div>
    )
}