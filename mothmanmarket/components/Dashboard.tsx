'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default async function Dashboard() {
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', '84cc420e-c2e6-45a3-afeb-9a0efca0d5ce' )

    return (
        <div>

        </div>
    )
}