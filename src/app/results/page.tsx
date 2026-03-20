// src/app/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

type Vote = {
  id: string;
  category: string;
  voted_for: string;
  created_at: string;
};

export default function ResultsPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial votes
  useEffect(() => {
    const fetchVotes = async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching votes:', error);
        return;
      }

      setVotes(data || []);
      setLoading(false);
    };

    fetchVotes();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('votes-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('Realtime change:', payload);

          if (payload.eventType === 'INSERT') {
            setVotes((prev) => [...prev, payload.new as Vote]);
          }
          // You could handle UPDATE/DELETE if needed, but for votes we probably don't
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute counts and winners
  const getResultsByCategory = () => {
    const categoryMap: Record<string, Record<string, number>> = {};

    votes.forEach((vote) => {
      if (!categoryMap[vote.category]) {
        categoryMap[vote.category] = {};
      }
      categoryMap[vote.category][vote.voted_for] =
        (categoryMap[vote.category][vote.voted_for] || 0) + 1;
    });

    return Object.entries(categoryMap).map(([category, counts]) => {
      const entries = Object.entries(counts);
      const winnerEntry = entries.reduce(
        (max, curr) => (curr[1] > max[1] ? curr : max),
        ['', 0]
      );
      const winner = winnerEntry[0];
      const winnerVotes = winnerEntry[1];

      return {
        category,
        counts: Object.fromEntries(entries),
        winner,
        winnerVotes,
        totalVotes: entries.reduce((sum, [, count]) => sum + count, 0),
      };
    });
  };

  const results = getResultsByCategory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950 text-white flex items-center justify-center">
        <p className="text-3xl">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-900 text-white p-6 md:p-12">
      <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-12 tracking-wide drop-shadow-2xl">
        Live Sash Awards Results 🏆🔥
      </h1>

      {results.length === 0 ? (
        <p className="text-center text-2xl opacity-80">
          No votes yet — get the party voting! 🎉
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {results.map((res) => (
            <div
              key={res.category}
              className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl hover:border-purple-400/50 transition-all"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                {res.category}
              </h2>

              <div className="space-y-4">
                {Object.entries(res.counts)
                  .sort(([, a], [, b]) => b - a) // sort descending
                  .map(([name, count]) => (
                    <div
                      key={name}
                      className={`flex justify-between items-center p-4 rounded-xl ${
                        name === res.winner
                          ? 'bg-purple-600/70 border-2 border-purple-400'
                          : 'bg-white/10'
                      }`}
                    >
                      <span className="text-xl font-medium">{name}</span>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                  ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-xl opacity-80">Total votes: {res.totalVotes}</p>
                {res.winner && (
                  <p className="mt-4 text-3xl font-extrabold text-purple-300">
                    Current Winner: {res.winner} ({res.winnerVotes} votes) 🎖️
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center mt-12 text-sm opacity-60">
        Live updating • Last refresh: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}