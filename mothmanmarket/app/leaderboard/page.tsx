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
    <div className="min-h-screen bg-[#262525] p-8 text-zinc-50">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#c00d07] tracking-wide">
          Mothman Market Leaderboard 
      </h1>
      <p className="text-center text-zinc-400 italic mb-6">
        The cryptid watches…who among the seers will rise highest?
      </p>

      {loading ? (
        <p className="text-center text-zinc-400">Summoning balances from the void...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <Card className="bg-[#454343] border-red-800 rounded-2xl max-w-2xl mx-auto !shadow-[4px_4px_12px_#c00d0780]"
        style= {{ backgroundColor: '#454343'}}>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[#c00d07] text-center">
              Top Seers in the World
            </h2>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#c00d07] border-b border-zinc-800">
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
                      <td className="py-2 px-4 font-bold text-[#c00d07]">
                        {rankIcon} {index + 1}
                      </td>
                      <td className="py-2 px-4">{p.username}</td>
                      <td className="py-2 px-4 text-right text-green-400">
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
