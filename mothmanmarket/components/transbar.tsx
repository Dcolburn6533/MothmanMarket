"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Doto } from "next/font/google";

const tickerFont = Doto({ 
  subsets: ["latin"],
  weight: "900"
});

type Transaction = {
  transaction_id: string;
  username: string;
  bet_title: string;
  amount_held: number;
  buy_price: number | null;
  sell_price: number | null;
  is_yes: boolean;
  buy_time: string | null;
  sell_time: string | null;
};

export default function TransactionTicker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      // get recent transactions with user and bet info
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          transaction_id,
          user_id,
          bet_id,
          amount_held,
          buy_price,
          sell_price,
          is_yes,
          buy_time,
          sell_time,
          profiles!inner(username),
          bets!inner(bet_title)
        `
        )
        .order("buy_time", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }

      if (data) {
        const formatted: Transaction[] = data.map((t: any) => ({
          transaction_id: t.transaction_id,
          username: t.profiles.username,
          bet_title: t.bets.bet_title,
          amount_held: t.amount_held,
          buy_price: t.buy_price,
          sell_price: t.sell_price,
          is_yes: t.is_yes,
          buy_time: t.buy_time,
          sell_time: t.sell_time,
        }));

        setTransactions(formatted);
        setAnimationKey(prev => prev + 1); // Force animation restart
      }
    };

    fetchTransactions();

    // Periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing transactions...');
      fetchTransactions();
    }, 300000);

    // Subscribe to new transactions
    const channel = supabase
      .channel("realtime:transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // sort transactions by most recent (buy_time or sell_time)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const aTime = a.sell_time || a.buy_time;
    const bTime = b.sell_time || b.buy_time;
    if (!aTime || !bTime) return 0;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  // create the transaction text elements
  const transactionElements = sortedTransactions.map((t) => {
    const isSell = t.sell_time !== null;
    const action = isSell ? "sold" : "bought";
    const price = isSell ? t.sell_price : t.buy_price;
    const side = t.is_yes ? "YES" : "NO";
    
    return (
      <span key={t.transaction_id} className="inline-flex items-center mx-6">
        <span className="font-semibold text-zinc-100">{t.username}</span>
        <span className="mx-1.5 text-zinc-300">{action}</span>
        <span className="font-semibold text-zinc-100">{t.amount_held}</span>
        <span className="mx-1.5">
          <span className={t.is_yes ? "text-[#925cff] font-semibold" : "text-[#c75000] font-semibold"}>
            {side}
          </span>
        </span>
        <span className="text-zinc-300">shares of</span>
        <span className="mx-1.5 text-[#a89b03] italic">"{t.bet_title}"</span>
        <span className="text-zinc-300">@</span>
        <span className="ml-1.5 font-semibold text-emerald-400">
          ${price?.toFixed(2) || "0.00"}
        </span>
      </span>
    );
  });

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-[#454343] border-b border-zinc-800 text-zinc-400 py-3 text-center text-sm">
        Waiting for transactions...
      </div>
    );
  }

  const SECONDS_PER_TRANSACTION = 10;
  const animationDuration = sortedTransactions.length * SECONDS_PER_TRANSACTION;

  return (
    <div className="w-full bg-[#454343] border-b border-zinc-800 overflow-hidden relative">
      <div className={`ticker-wrapper py-3 ${tickerFont.className}`}>
        <div 
          key={animationKey}
          className="ticker-content"
          style={{
            animation: `scroll ${animationDuration}s linear infinite`
          }}>
          {transactionElements}
          {transactionElements}
        </div>
      </div>
      
      <style jsx>{`
        .ticker-wrapper {
          display: flex;
          overflow: hidden;
          white-space: nowrap;
        }
        
        .ticker-content {
          display: inline-flex;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}