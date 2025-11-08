'use client'

import { use, useEffect, useState } from 'react'
import { useUser } from '@/utils/context/UserContext'
import { supabase } from '@/utils/supabase/client'
import { NextFastTable, Fields } from 'next-fast-table'

export default function WalletHolder() {

    const elStrino = '2025-11-08T03:56:13.026474+00:00'
    console.log("Date is: ", new Date(elStrino).toLocaleString())

    const user = useUser()
    const [ data, setData ] = useState(null)
    const [ error, setErr ] = useState(null)
    const [ currentHoldings, setCurrentHoldings ] = useState(null)
    const [ isEmpty, setIsEmpty ] = useState(false)

    const field = Fields;
    const columns = [
        field.string("transaction_id"),
        field.boolean("active"),
        field.number("amount_held"),
        field.number("buy_price"),
        field.string("buy_time", {
            header: "Buy Time",
            render: (row) => {return new Date(row.cell).toLocaleString()}
        }),
    ];

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
        if(!user.userId){
            //return

            user.setUserId('b1e98c85-6232-4a9c-945d-5aee59061054')
        }
        
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
    }, [user.userId])

    const onFetch = async (obj) => {
        if(!currentHoldings || currentHoldings.length === 0) {
            return { list: [], total: 0 }
        }

        const pageSize = obj.pagination?.pageSize ?? 10
        const pageIndex = obj.pagination?.pageIndex ?? 0

        let rows = [...currentHoldings]

        // Sorting, from docs
        if (obj.sorting && obj.sorting.length > 0) {
            const sort = obj.sorting[0]
            const multiplier = sort.desc ? -1 : 1
            rows.sort((a, b) => {
                const av = a[sort.id]
                const bv = b[sort.id]
                if (av < bv) return -1 * multiplier
                if (av > bv) return 1 * multiplier
                return 0
            })
        }

        // Filtering, from docs
        if (obj.columnFilters && obj.columnFilters.length > 0) {
            rows = rows.filter((row) =>
                obj.columnFilters.every((filter) => {
                const value = row[filter.id]
                const filterValue = filter.value
                if (typeof filterValue === "number" || typeof filterValue === "boolean") {
                    return value === filterValue
                } else if (typeof filterValue === "string") {
                    return String(value ?? '').includes(filterValue)
                }
                return true
                })
            )
        }

        const total = rows.length
        const list = rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)

        return { list, total }

    }

    const onCreate = async () => {
        console.log("Create not implemented yet")
    }

    const onUpdate = async () => {
        console.log("Update not implemented yet")
    }

    const onDelete = async () => {
        console.log("Delete not implemented yet")
    }


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
                    <NextFastTable
                        columns={columns}
                        onFetch={onFetch}
                        onDelete={onDelete}
                        onCreate={onCreate}
                        onUpdate={onUpdate}
                    />
                </div>
            :
                <h1>This user currently does not have any holdings.</h1>
            }

        </div>
    )


    //<pre>{JSON.stringify(currentHoldings, null, 2)}</pre>
    
    // return (
    //     <div>
    //         Found data for username: {data.username}
    //         <br />
    //         Current balance: {data.balance}
    //     </div>
    // )
}