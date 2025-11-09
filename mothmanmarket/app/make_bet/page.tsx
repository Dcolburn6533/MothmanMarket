"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/utils/context/UserContext";

export default function MakeBetPage() {
  const router = useRouter();
  const { userId } = useUser();

  const [title, setTitle] = useState("");
  const [comments, setComments] = useState("");
  const [resolverQuery, setResolverQuery] = useState("");
  const [resolverResults, setResolverResults] = useState<Array<{ user_id: string; username: string }>>([]);
  const [selectedResolver, setSelectedResolver] = useState<{ user_id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resolverQuery || resolverQuery.length < 2) {
      setResolverResults([]);
      return;
    }

    let mounted = true;
    const run = async () => {
      setSearching(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username")
        .ilike("username", `%${resolverQuery}%`)
        .limit(10);

      if (!mounted) return;
      setSearching(false);
      if (error) {
        console.error("Resolver search error:", error);
        setResolverResults([]);
        return;
      }
  setResolverResults((data ?? []) as Array<{ user_id: string; username: string }>);
    };

    const t = setTimeout(run, 250);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [resolverQuery]);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!title.trim()) return setMessage("Title is required.");
    if (!selectedResolver) return setMessage("Please pick a resolver from the list.");
    if (!userId) return setMessage("You must be logged in to create a bet.");

    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.rpc("make_bet", {
        bet_title: title.trim(),
        comments: comments.trim(),
        resolver_id: selectedResolver.user_id,
      });

      if (error) {
        console.error("make_bets rpc error:", error);
        setMessage(error.message || "Failed to create bet.");
        return;
      }

      setMessage("Bet created successfully.");
      // optional: if RPC returns created id, redirect to it
      // assume RPC returns the new bet id in data
      const newId = data ?? null;
      setTimeout(() => {
        if (newId && typeof newId === "number") {
          router.push(`/bet/${newId}`);
        } else {
          router.push("/dashboard");
        }
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-50 flex items-start justify-center">
      <form
        onSubmit={handleCreate}
        className="w-full max-w-2xl bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
      >
        <h1 className="text-2xl font-bold mb-4">Create a new bet</h1>

        <label className="block text-sm text-zinc-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short, clear question"
          maxLength={120}
          className="w-full mt-2 p-2 bg-zinc-800 rounded border border-zinc-700"
        />
        <div className="text-xs text-zinc-400 mt-1">{title.length}/120</div>

        <label className="block text-sm text-zinc-400 mt-4">Comments / Details</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Optional details or context"
          rows={4}
          maxLength={256}
          className="w-full mt-2 p-2 bg-zinc-800 rounded border border-zinc-700"
        />

        <label className="block text-sm text-zinc-400 mt-4">Resolver (select a user)</label>
        <div className="relative">
          <input
            value={resolverQuery}
            onChange={(e) => {
              setResolverQuery(e.target.value);
              setSelectedResolver(null);
            }}
            placeholder="Search username (min 2 chars)"
            className="w-full mt-2 p-2 bg-zinc-800 rounded border border-zinc-700"
          />
          {searching && (
            <div className="absolute right-2 top-3 text-sm text-zinc-400">Searching…</div>
          )}
        </div>

        {resolverResults.length > 0 && !selectedResolver && (
          <ul className="bg-zinc-900 border border-zinc-800 rounded mt-2 max-h-40 overflow-auto">
            {resolverResults.map((r) => (
              <li
                key={r.user_id}
                className="px-3 py-2 hover:bg-zinc-800 cursor-pointer"
                onClick={() => {
                  setSelectedResolver(r);
                  setResolverQuery(r.username);
                  setResolverResults([]);
                }}
              >
                {r.username}
              </li>
            ))}
          </ul>
        )}

        {selectedResolver && (
          <div className="mt-3 p-2 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-400">Resolver</div>
              <div className="font-semibold">{selectedResolver.username}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedResolver(null);
                setResolverQuery("");
              }}
              className="px-3 py-1 bg-zinc-700 rounded text-sm"
            >
              Clear
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-[#c75000]">{message}</p>}

        <div className="mt-6 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#925cff] text-black rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Bet"}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-zinc-800 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
