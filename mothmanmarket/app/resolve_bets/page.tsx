"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/utils/context/UserContext";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Bet = {
  bet_id: string;
  bet_title: string;
  comments?: string | null;
  resolved: boolean;
  yes_price: number;
  no_price: number;
  resolver_id: string | null;
};

export default function ResolveBetsPage() {
  const { userId } = useUser();
  const router = useRouter();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBets = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("resolver_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Bet[] = (data ?? []).map((b: any) => ({
        bet_id: b.bet_id,
        bet_title: b.bet_title,
        comments: b.comments ?? null,
        resolved: !!b.resolved,
        yes_price: parseFloat(b.yes_price ?? 0),
        no_price: parseFloat(b.no_price ?? 0),
        resolver_id: b.resolver_id ?? null,
      }));
      setBets(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "Failed to load bets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchBets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleResolve = async (bet: Bet, outcome: "yes" | "no") => {
    if (!bet) return;
    if (bet.resolved) return setMessage("Cannot resolve a resolved bet.");

    setMessage("Resolving bet...");
    try {
      const { error } = await supabase.rpc("resolve_bet", {
        p_bet_id: bet.bet_id,
        p_outcome: outcome,
      });
      if (error) throw error;
      setMessage(`Bet resolved: ${outcome.toUpperCase()}`);
      // refresh list
      await fetchBets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setMessage(msg || "Failed to resolve bet.");
    }
  };

  if (!userId) return <p className="p-6 text-center">Please log in to view bets you can resolve.</p>;
  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#262525] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Resolve Bets</h1>

        {message && <p className="mb-3 text-sm text-red-400">{message}</p>}

        {bets.length === 0 ? (
          <p className="text-sm text-zinc-400">No bets assigned to you for resolution.</p>
        ) : (
          <div className="space-y-4">
            {bets.map((b) => (
              <Card key={b.bet_id} className="bg-[#454343]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{b.bet_title}</h2>
                      {b.comments && (
                        <p className="text-sm text-zinc-400 italic mt-1">
                          {b.comments.length > 160 ? `${b.comments.slice(0, 160)}...` : b.comments}
                        </p>
                      )}
                      <div className="text-xs text-zinc-400 mt-1">Status: {b.resolved ? 'Resolved' : 'Active'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">Yes</div>
                      <div className="text-lg font-semibold text-[#925cff]">{Number(b.yes_price).toFixed(3)}</div>
                      <div className="text-sm text-zinc-400 mt-2">No</div>
                      <div className="text-lg font-semibold text-[#c75000]">{Number(b.no_price).toFixed(3)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(b, 'yes')}
                      disabled={b.resolved}
                      className={`px-3 py-2 rounded flex-1 font-semibold ${b.resolved ? 'opacity-50 cursor-not-allowed bg-[#925cff]' : 'bg-[#925cff] hover:bg-[#925cff]/80 text-black'}`}
                    >
                      Resolve Yes
                    </button>
                    <button
                      onClick={() => handleResolve(b, 'no')}
                      disabled={b.resolved}
                      className={`px-3 py-2 rounded flex-1 font-semibold ${b.resolved ? 'opacity-50 cursor-not-allowed bg-[#c75000]' : 'bg-[#c75000] hover:bg-[#c75000]/80 text-black'}`}
                    >
                      Resolve No
                    </button>
                    <button onClick={() => router.push(`/bet/${b.bet_id}`)} className="px-3 py-2 rounded bg-[#333131] hover:bg-[#262525]">View</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
