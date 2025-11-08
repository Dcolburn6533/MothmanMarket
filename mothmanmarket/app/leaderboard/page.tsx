"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Profile = {
  username: string;
  balance: number;
};

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, balance")
        .order("balance", { ascending: false });

      if (error) {
        setError("Failed to summon the leaderboard.");
        setLoading(false);
        return;
      }

      const formatted: Profile[] = (data ?? []).map((p) => ({
        username: p.username,
        balance: parseFloat(p.balance),
      }));

      setProfiles(formatted);
      setLoading(false);
    };

    fetchProfiles();

    const channel = supabase
      .channel("realtime:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchProfiles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black p-8 text-zinc-50">
    <h1 className="text-4xl font-extrabold mb-8 text-center text-[#c75000] tracking-wide">
          Mothman Market Leaderboard 
      </h1>
      <p className="text-center text-zinc-400 mb-6">
        The cryptid watches… who among the seers will rise highest?
      </p>

      {loading ? (
        <p className="text-center text-zinc-400">Summoning balances from the void...</p>
      ) : error ? (
        <p className="text-center text-[#c75000]">{error}</p>
      ) : (
        <Card className="bg-zinc-900 border-[#c75000] shadow-lg rounded-2xl max-w-2xl mx-auto">
          <CardHeader>
            <h2 className="text-lg font-semibold text-[#c75000] text-center">
              Top Seers in the World
            </h2>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="py-2 px-4">Rank</th>
                  <th className="py-2 px-4">Username</th>
                  <th className="py-2 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p, index) => {
                  // Add cryptid-themed rank icons for top 3
                  let rankIcon = "";
                  if (index === 0) rankIcon = "👑";
                  else if (index === 1) rankIcon = "🦉";
                  else if (index === 2) rankIcon = "🌕";

                  return (
                    <tr
                      key={p.username}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-2 px-4 font-bold text-[#c75000]">
                        {rankIcon} {index + 1}
                      </td>
                      <td className="py-2 px-4">{p.username}</td>
                      <td className="py-2 px-4 text-right text-[#925cff]">
                        {p.balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
