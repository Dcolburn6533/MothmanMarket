"use client";

import React, { useEffect, useState } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/utils/context/UserContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Bet = {
  bet_id: string;
  title: string;
  active: boolean;
  yes_price: number;
  no_price: number;
  resolved: boolean;
};

export default function BetPage() {
  const params = useParams();
  const router = useRouter();
  const bet_id = params?.id as string;

  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<
    { time: string; yes_price: number | null; no_price: number | null }[]
  >([]);
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string | null>(null);
  const { userId } = useUser();

  useEffect(() => {
    if (!bet_id) return;

    const fetchBet = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("bets")
          .select("*")
          .eq("bet_id", bet_id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setMessage("Bet not found.");
          setBet(null);
          return;
        }

        setBet({
          bet_id: data.bet_id,
          title: data.bet_title,
          active: !data.resolved,
          yes_price: parseFloat(data.yes_price),
          no_price: parseFloat(data.no_price),
          resolved: data.resolved,
        });

        // Fetch price history
        const { data: historyRaw, error: historyError } = await supabase
          .from("price_history")
          .select("*")
          .eq("bet_id", bet_id)
          .order("created_at", { ascending: true });

        if (!historyError && historyRaw) {
          const historyArr = historyRaw as Array<Record<string, unknown>>;
          const times = Array.from(
            new Set(
              historyArr.map((h) =>
                new Date(String(h.created_at)).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              )
            )
          );

          const merged = times.map((time) => {
            const entry = historyArr.find(
              (h) =>
                new Date(String(h.created_at)).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }) === time
            );
            const yes =
              entry && entry.yes_price !== undefined
                ? parseFloat(String(entry.yes_price))
                : null;
            const no =
              entry && entry.no_price !== undefined
                ? parseFloat(String(entry.no_price))
                : null;
            return {
              time,
              yes_price: Number.isNaN(yes) ? null : yes,
              no_price: Number.isNaN(no) ? null : no,
            };
          });

          setChartData(merged);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessage(msg || "Failed to load bet.");
      } finally {
        setLoading(false);
      }
    };

    fetchBet();
  }, [bet_id]);

  const handleConfirm = async () => {
    if (!bet) return;
    if (bet.resolved) return setMessage("Cannot trade on a resolved bet.");
    if (quantity <= 0) return setMessage("Quantity must be at least 1.");
    if (!userId) return setMessage("You must be logged in.");

    try {
      if (action === "buy") {
        const { error } = await supabase.rpc("transaction", {
          p_bet_id: bet.bet_id,
          p_user_id: userId,
          p_is_yes: side === "yes",
          p_amount_held: quantity,
        });
        if (error) throw error;
        setMessage("Purchase successful!");
        setTimeout(() => router.push("/dashboard"), 1000);
      } else if (action === "sell") {
        const { error } = await supabase.rpc("sell_transaction", {
          p_bet_id: bet.bet_id,
          p_user_id: userId,
          p_is_yes: side === "yes",
          p_quantity: quantity,
        });
        if (error) throw error;
        setMessage("Sell successful!");
        setTimeout(() => router.push("/dashboard"), 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Transaction error:", msg);
      setMessage(msg || "Failed to submit transaction.");
    }
  };

const handleResolve = async (outcome: "yes" | "no") => {
  if (!bet) return;
  if (!bet.active) return setMessage("Cannot resolve a resolved bet.");

  setMessage("Resolving bet...");
  try {
    const { error } = await supabase.rpc("resolve_bet", {
      p_bet_id: bet.bet_id,   
      p_outcome: outcome, 
    });
    if (error) throw error;
    setMessage(`Bet resolved: ${outcome.toUpperCase()}`);
    setBet({ ...bet, active: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    setMessage(msg || "Failed to resolve bet.");
  }
};


  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-50">
      {!bet ? (
        <div className="max-w-xl mx-auto">
          <p className="text-center text-[#c75000]">{message ?? "Bet not found."}</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <h1 className="text-2xl font-bold">{bet.title}</h1>
              <p className="text-sm text-zinc-400">
                {bet.active ? "Active" : "Resolved"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 flex-col sm:flex-row items-start">
                {/* Chart + Prices */}
                <div className="flex-1">
                  {chartData.length > 0 && (
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1cfcf" />
                          <XAxis dataKey="time" stroke="#d1cfcf" />
                          <YAxis
                            stroke="#d1cfcf"
                            domain={[0, 1]}
                            tickFormatter={(v) => Number(v).toFixed(3)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#3f3f46",
                            }}
                            formatter={(value, name) => [
                              Number(value).toFixed(3),
                              String(name).toLowerCase().includes("yes")
                                ? "Yes"
                                : String(name).toLowerCase().includes("no")
                                ? "No"
                                : String(name),
                            ]}
                            labelFormatter={(label) => `Time: ${label}`}
                          />
                          <Legend
                            formatter={(value) =>
                              String(value).toLowerCase().includes("yes")
                                ? "Yes"
                                : String(value).toLowerCase().includes("no")
                                ? "No"
                                : String(value)
                            }
                          />
                          <Line type="monotone" dataKey="yes_price" stroke="#925cff" name="Yes" dot={false} />
                          <Line type="monotone" dataKey="no_price" stroke="#c75000" name="No" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Price display */}
                  <div className="mt-2 flex gap-4 items-center">
                    <div className="px-3 py-2 bg-zinc-900 rounded">
                      <div className="text-xs text-zinc-400">Yes</div>
                      <div className="text-lg font-semibold text-[#925cff]">
                        {Number(bet.yes_price).toFixed(3)}
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-zinc-900 rounded">
                      <div className="text-xs text-zinc-400">No</div>
                      <div className="text-lg font-semibold text-[#c75000]">
                        {Number(bet.no_price).toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Panel */}
                <div className="w-full sm:w-96">
                  {/* Action type */}
                  <div className="mb-3">
                    <label className="text-sm text-zinc-400">Action</label>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setAction("buy")}
                          disabled={!bet.active}
                          className={`px-3 py-1 rounded ${
                            action === "buy"
                              ? "bg-[#925cff] text-black"
                              : "bg-zinc-800"
                          } ${!bet.active ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setAction("sell")}
                          disabled={!bet.active}
                          className={`px-3 py-1 rounded ${
                            action === "sell"
                              ? "bg-[#c75000] text-black"
                              : "bg-zinc-800"
                          } ${!bet.active ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  {/* Side */}
                  <div className="mb-3">
                    <label className="text-sm text-zinc-400">Side</label>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setSide("yes")}
                          className={`px-3 py-1 rounded ${
                            side === "yes"
                              ? "bg-[#925cff] text-black"
                              : "bg-zinc-800"
                          }`}
                        disabled={!bet.active}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setSide("no")}
                          className={`px-3 py-1 rounded ${
                            side === "no"
                              ? "bg-[#c75000] text-black"
                              : "bg-zinc-800"
                          }`}
                        disabled={!bet.active}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-3">
                    <label className="text-sm text-zinc-400">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full mt-2 p-2 bg-zinc-900 rounded"
                      disabled={!bet.active}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleConfirm}
                      disabled={!bet.active}
                      className="flex-1 px-4 py-2 bg-blue-600 text-black rounded font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => router.back()}
                      className="px-4 py-2 bg-zinc-800 rounded"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Resolve Controls */}
                  {bet.active && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleResolve("yes")}
                        className="flex-1 px-4 py-2 bg-[#925cff] text-black rounded font-semibold"
                      >
                        Resolve Yes
                      </button>
                      <button
                        onClick={() => handleResolve("no")}
                        className="flex-1 px-4 py-2 bg-[#c75000] text-black rounded font-semibold"
                      >
                        Resolve No
                      </button>
                    </div>
                  )}

                  {message && (
                    <p className="mt-3 text-sm text-center text-zinc-300">
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
