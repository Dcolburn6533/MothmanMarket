"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Bet = {
  id: string;
  title: string;
  active: boolean;
  yes_price: number;
  no_price: number;
};

type PricePoint = {
  id: string;
  bet_id: string;
  yes_price: number;
  no_price: number;
  created_at: string;
};

export default function MothmanDashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: betsRaw, error: betsError } = await supabase.from("bets").select("*");
      const { data: historyRaw, error: historyError } = await supabase
        .from("price_history")
        .select("*")
        .order("created_at", { ascending: true });

      if (betsError || historyError) {
        setError("Failed to load market data.");
        setLoading(false);
        return;
      }

      const bets: Bet[] = (betsRaw ?? []).map((b) => ({
        id: b.bet_id,
        title: b.bet_title,
        active: b.resolved === false,
        yes_price: parseFloat(b.yes_price),
        no_price: parseFloat(b.no_price),
      }));

      const history: PricePoint[] = (historyRaw ?? []).map((h) => ({
        id: h.history_id,
        bet_id: h.bet_id,
        yes_price: parseFloat(h.yes_price),
        no_price: parseFloat(h.no_price),
        created_at: h.created_at,
      }));

      setBets(bets);
      setPriceHistory(history);
      setLoading(false);
    };

    fetchData();

    const betsChannel = supabase
      .channel("realtime:bets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets" },
        () => fetchData()
      )
      .subscribe();
            // test User ID from localStorage
      const userId = localStorage.getItem('user_id');
      console.log('User ID on cleanup from localStorage:', userId);
    const historyChannel = supabase
      .channel("realtime:price_history")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "price_history" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(betsChannel);
      supabase.removeChannel(historyChannel);


    };

  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-zinc-100">
        Mothman Market Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-zinc-400">Loading market data...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bets.map((bet, i) => {
            const betHistory = priceHistory.filter((h) => h.bet_id === bet.id);

            const chartData = betHistory.map((h) => ({
              time: new Date(h.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              yes_price: Number(h.yes_price).toFixed(3),
              no_price: Number(h.no_price).toFixed(3),
            }));

            const allPrices = chartData.flatMap((d) => [
              parseFloat(d.yes_price),
              parseFloat(d.no_price),
            ]);
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);
            const yDomain = [
              Math.max(0, minPrice - 0.05),
              Math.min(1, maxPrice + 0.05),
            ];

            return (
              <Card
                key={bet.id ?? `bet-${i}`}
                className="bg-zinc-900 border-zinc-800 shadow-lg rounded-2xl"
              >
                <CardHeader>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    {bet.title}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {bet.active ? "Active" : "Resolved"}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        {/* Hide X-axis labels */}
                        <XAxis dataKey="time" stroke="#a1a1aa" tick={false} />
                        <YAxis
                          stroke="#a1a1aa"
                          domain={yDomain}
                          tickFormatter={(value) => Number(value).toFixed(3)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#3f3f46",
                          }}
                          formatter={(value, name) => [
                            Number(value).toFixed(3),
                            name === "yes_price" ? "Yes" : "No",
                          ]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="yes_price"
                          stroke="#a10cbeff"
                          name="Yes"

                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="no_price"
                          stroke="#0ae9cbff"
                          name="No"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
    </div>

    
  );
}
