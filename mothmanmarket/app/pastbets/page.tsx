"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from '@/utils/context/UserContext'
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
import { useRouter } from "next/navigation";

type Bet = {
  id: string;
  title: string;
  active: boolean;
  yes_price: number;
  no_price: number;
  comments?: string | null;
};

type PricePoint = {
  id: string;
  bet_id: string;
  yes_price: number;
  no_price: number;
  created_at: string;
};

export default function PastBetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useUser();

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
        comments: b.comments ?? null,
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

  console.log('User ID from context:', userId);
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
    <div className="min-h-screen bg-[#262525] p-8 text-zinc-50">

      {loading ? (
        <p className="text-center text-zinc-400">Loading market data...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bets
            .filter((b) => !b.active)
            .map((bet, i) => {
            const betHistory = priceHistory.filter((h) => h.bet_id === bet.id);

            const chartData = betHistory.map((h) => ({
              time: new Date(h.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              yes_price: Number(h.yes_price),
              no_price: Number(h.no_price),
            }));

            const allPrices = chartData.flatMap((d) => [
              Number(d.yes_price),
              Number(d.no_price),
            ]);
            const numericPrices = allPrices.filter((p) => typeof p === 'number' && !Number.isNaN(p));
            let yDomain: [number, number];
            if (numericPrices.length === 0) {
              // default domain when no data
              yDomain = [0, 1];
            } else {
              const minPrice = Math.min(...numericPrices);
              const maxPrice = Math.max(...numericPrices);
              const range = Math.max(1e-9, maxPrice - minPrice);
              const margin = Math.max(range * 0.05, Math.abs(maxPrice) * 0.01, 0.000001);
              const lower = Math.max(0, minPrice - margin);
              const upper = maxPrice + margin;
              yDomain = [lower, upper];
            }

            return (
              <Card
                  key={bet.id ?? `bet-${i}`}
                  className="bg-zinc-900 border-zinc-800 rounded-2xl cursor-pointer !shadow-[4px_4px_12px_#c00d0780]"
                  style= {{ backgroundColor: '#454343'}}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/bet/${bet.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/bet/${bet.id}`);
                    }
                  }}
                >
                <CardHeader>
                  <h2 className="text-lg font-semibold text-zinc-100 truncate">
                    {bet.title}
                  </h2>
                  {bet.comments ? (
                    <p className="text-sm text-zinc-400 italic mt-1">
                      {bet.comments.length > 120
                        ? `${bet.comments.slice(0, 120)}...`
                        : bet.comments}
                    </p>
                  ) : null}
                  <p className="text-sm text-zinc-400">
                    {bet.active ? "Active" : "Resolved"}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1cfcf" />
                        <XAxis dataKey="time" stroke="#d1cfcf" tick={false} />
                        <YAxis
                          stroke="#d1cfcf"
                          domain={yDomain}
                          tickFormatter={(value) => Number(value).toFixed(3)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#18181b",
                            borderColor: "#3f3f46",
                          }}
                          formatter={(value, name) => {
                            const n = String(name ?? "");
                            const label =
                              n === "yes_price" || /(^|\s)yes(\s|$)/i.test(n) ?
                                "Yes" : n === "no_price" || /(^|\s)no(\s|$)/i.test(n) ?
                                "No" : n;
                            return [Number(value).toFixed(3), label];
                          }}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="yes_price"
                          stroke="#925cff"
                          strokeWidth={3}
                          name="Yes"

                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="no_price"
                          stroke="#c75000"
                          strokeWidth={3}
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
