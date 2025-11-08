import Dashboard from "@/components/Dashboard"
import { useUser } from "@/utils/context/UserContext"
import { supabase } from '@/utils/supabase/client'

export default async function WalletPage() {
    
    // const user = useUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log(`User information from supabase is `, user)

    //console.log(`Cached userId is ${userId}`)
    console.log(`Hardcoded user_id is '84cc420e-c2e6-45a3-afeb-9a0efca0d5ce'`)


    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        //.eq('user_id', user.userId )
        .eq('user_id', '84cc420e-c2e6-45a3-afeb-9a0efca0d5ce' )

        // 84cc420e-c2e6-45a3-afeb-9a0efca0d5ce

    if(error) {
        console.error('Error fetching data', error.message)
    } else {
        console.log('Fetched data: ', data, `, with type ${typeof(data)}`)
    }

    // return(
    //     <div>
    //         <h1>print the userId</h1>
    //     </div>
    // )
    return(
        <div>
            <h1>print the userId</h1>
            <Dashboard data={data}></Dashboard>
        </div>
    )
}