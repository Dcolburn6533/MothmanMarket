'use client'

import { use, useEffect, useState } from 'react'
import { useUser } from '@/utils/context/UserContext'
import { supabase } from '@/utils/supabase/client'
import { NextFastTable, Fields } from 'next-fast-table'
import { useRouter } from 'next/navigation'

export default function Wallet() {

    const user = useUser()
    const [ data, setData ] = useState(null)
    const [ error, setErr ] = useState(null)
    const [ currentHoldings, setCurrentHoldings ] = useState(null)
    const [ isEmpty, setIsEmpty ] = useState(false)
    const [ currentBetsInvolved, setCurrentBetsInvolved ] = useState([])
    const router = useRouter()


    const getTargetBet = (row) => {
        if(!Array.isArray(currentBetsInvolved)) {return null}
        return currentBetsInvolved.find((bet) => bet.bet_id === row.row.bet_id) ?? null
    }

    const field = Fields;
    const columns = [
        field.string("transaction_id", {
            header: "Title",
            render: (row) => {
                const targetBet = getTargetBet(row)
                if(!targetBet?.bet_title) {return 'Unknown bet'}
                return targetBet.bet_title.length > 20 ? targetBet.bet_title.slice(0, 50) : targetBet.bet_title
            }
        }),
        //field.string("bet_id"),
        field.boolean("is_yes"),
        field.boolean("active"),
        field.number("amount_held"),
        field.number("current_price", {
            header: "Current Price",
            render: (row) => {
                const targetBet = getTargetBet(row)
                if(!targetBet?.bet_title) {return 0}
                const marketPrice = targetBet.is_yes ? targetBet.yes_price : targetBet.no_price 
                return marketPrice.toFixed(2)
            }
        }),
        field.number("buy_price"),
        field.string("buy_time", {
            header: "Buy Time",
            render: (row) => {return new Date(row.cell).toLocaleString()}
        }),
        field.number("cur_value", {
            header: "Current Value",
            render: (row) => {
                const targetBet = getTargetBet(row)
                if(!targetBet?.bet_title) {return 0}
                const marketPrice = targetBet.is_yes ? targetBet.yes_price : targetBet.no_price 
                const value = marketPrice * row.row.amount_held
                return value.toFixed(2)
            }
        }),
        field.number("cur_profit", {
            header: "Current Profit",
            render: (row) => {
                //console.log("Transaction contents of this row are: ", row.row)
                const targetBet = getTargetBet(row)
                if(!targetBet?.bet_title) {return 0}
                //console.log("The matching bet is: ", targetBet)
                const marketPrice = targetBet.is_yes ? targetBet.yes_price : targetBet.no_price 
                const profit = (marketPrice - row.row.buy_price) * row.row.amount_held
                return profit.toFixed(2)
            }
        }),
        field.string("cur_profit_perc", {
            header: "Profit Since Purchase (%)",
            render: (row) => {
                const targetBet = getTargetBet(row)
                if(!targetBet?.bet_title) {return '0%'}
                const marketPrice = targetBet.is_yes ? targetBet.yes_price : targetBet.no_price 
                const profitPercent = ((marketPrice - row.row.buy_price) * row.row.amount_held) / (row.row.buy_price * row.row.amount_held)
                return (profitPercent.toFixed(4) * 100)
            }
        })
    ];

    const fetchUserData = async () => {
        try {
            const {data, error } = await supabase   
                .from('profiles')
                .select('*')
                //.eq('user_id', 'b1e98c85-6232-4a9c-945d-5aee59061054')
                .eq('user_id', user.userId )

            if(error) {
                console.error(error)
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
            console.error(err);
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
                console.error(error)
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

                return(data)
                // currently does NOT feed to React context
            }
        
        } catch (err) {
            console.error(err);
            setData(null);
        }
    }

    /// MAKE THIS INTO A REQUESTER THAT GETS THE MATCHING BETS TO THE ONES WE OWN
    const fetchCurrentBetsHoldings = async (holdings) => {
        try {
            //console.log("STARTING BETS REQUEST", holdings)
            if(!holdings || holdings.length === 0 ){
                setCurrentBetsInvolved([])
                return []
            }

            const current_transactions = holdings.map(obj => {
                //console.log(`object in mapping: `, obj.bet_id)
                return obj.bet_id
            })
            
            const {data, error } = await supabase   
                .from('bets')
                .select('*')
                .in('bet_id', current_transactions )
            if(error) {
                setCurrentBetsInvolved([])
                console.error(`Error: `, error)

            } else {
                console.log(`User's involved bets: `, data)
                setCurrentBetsInvolved(data ?? [])
            }
        
        } catch (err) {
            console.error(err);
            setCurrentBetsInvolved([]);
        }
    }
    

    useEffect(() => {        
        if(!user.userId){
            router.push("/login")
            return
            //user.setUserId(null)
            //user.setUserId('b1e98c85-6232-4a9c-945d-5aee59061054') // alice
            //user.setUserId('0c274850-7077-4c26-a196-9a5d7ddda766') //Bread
        }
        
        // Fetch once when the page is initially loaded
        (async () => {
            await fetchUserData();
            const holdings = await fetchCurrentHoldings();
            await fetchCurrentBetsHoldings(holdings); 
        })();

        // Fetch data every 15 seconds
        const intervalId = setInterval(async () => {
            await fetchUserData();
            const holdings = await fetchCurrentHoldings();
            await fetchCurrentBetsHoldings(holdings);
        }, 15000)

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
            {currentHoldings && currentHoldings.length > 0 ?
                <div className='wallet-table'>
                    <h1 className="text-2xl font-bold mb-4">Current Positions</h1>
                    <NextFastTable
                        columns={columns}
                        onFetch={onFetch}
                    />
                </div>
            :
                <h1>This user currently does not have any holdings.</h1>
            }

        </div>
    )
}