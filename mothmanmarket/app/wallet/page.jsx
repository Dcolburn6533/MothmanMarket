'use client'

import { useUser } from "@/utils/context/UserContext"

export default function WalletPage() {
    
    const { userId }  = useUser()

    console.log(`Cached userId is ${userId}`)

    return(
        <div>
            <h1>print the userId</h1>
        </div>
    )
}