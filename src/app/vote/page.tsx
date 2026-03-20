// src/app/vote/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const categories = [
  {
    title: "Took the Most Photos",
    emoji: "📸",
    gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExczNhbTh4dnluaXV6a3p0MHVqMWJoazRxdTg5OWZvOXBybGJrOHMyNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xqUvdZ6gH9y5kz11I7/giphy.gif", // paparazzi camera flash party vibe
  },
  {
    title: "Best Dressed",
    emoji: "👗",
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmwxdm9za3pnM2ZoYTRldWRueXF4ZHB6OGR1cm94MGpyNTFrcWRlMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xD21kV754DWSsgLao1/giphy.gif", // fashion runway model strut
  },
  {
    title: "Best Dance Moves",
    emoji: "💃",
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aXByb3AxcDlkN2VubXcybWlvbTN3dGEwaWp5NzRyMW1zc2pxM2NhOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT8qAY7e9If38xkrIY/giphy.gif", // energetic silly party dance
  },
  {
    title: "Drank the Most",
    emoji: "🍻",
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjZ1Y3MweWIyYW1raHY5Y2NrbWFlY2Y0anUyazBoM2E0ZnFsNXV5byZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5cLqQQK3VvxMA/giphy.gif", // beer cheers / drinking fun
  }
];

const participants = [
  "Nicole", "Tim", "Winnie the pooh", "PSA 10 Char - izard", "Lian", "my name is Jeff", "Jess ka-zhu", "PGA Tyler Woods",
  "A-Aliya-h", "Ashley aka Certified Yapper", "Dindi ", "Joey", "Psalm 28:7",
  "Jewel", "NYO", "LEO", "Amee", "Sara", "Sean", "Zephren", "Anthony",
  "Bartholomew Van Franklin The Third"
];

export default function VotePage() {
  const [votes, setVotes] = useState<Record<string, string>>({});

  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem('sashVotes');
    if (stored) {
      setHasVoted(JSON.parse(stored));
        }
    }, []);

  const handleVote = async (category: string, name: string) => {
    if (!name) return;

    if (hasVoted[category]) {
      alert("You've already voted in this category! 🎉");
      return;
    }

    setVotes((prev) => ({ ...prev, [category]: name }));

    try {
        const { error } = await supabase
            .from('votes')
            .insert({
                category,
                voted_for: name,
        });

        if (error) throw error;

        setHasVoted((prev) => {
        const updated = { ...prev, [category]: true };
        localStorage.setItem('sashVotes', JSON.stringify(updated));
        return updated;
      });

      alert(`Your vote for ${name} in "${category}" was saved! 🏆`);
    } catch (err) {
      console.error('Vote failed:', err);
      alert('Something went wrong — try again!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-900 text-white p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 tracking-wide drop-shadow-lg">
        Sash Awards Voting 🏆✨
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="relative bg-black/40 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 flex flex-col h-[520px] md:h-[580px]"
          >
            <div className="flex-1 relative">
              <img
                src={cat.gifUrl}
                alt={`${cat.title} theme animation`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(cat.title)}`;
                }}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pt-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center drop-shadow-lg">
                {cat.title} {cat.emoji}
              </h2>

              <select
                className="w-full p-4 bg-white/15 border border-white/30 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm appearance-none"
                value={votes[cat.title] || ""}
                onChange={(e) => handleVote(cat.title, e.target.value)}
                disabled={hasVoted[cat.title]}
              >
                <option value="" disabled className="text-gray-400 bg-black">
                  {hasVoted[cat.title] ? "You already voted!" : "Choose your winner..."}
                </option>
                {participants.map((name) => (
                  <option key={name} value={name} className="text-black bg-white">
                    {name}
                  </option>
                ))}
              </select>

              <button
                className="mt-5 w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                disabled={hasVoted[cat.title] || !votes[cat.title]}
                onClick={() => {
                  if (votes[cat.title]) {
                    alert("Vote already saved! ✨");
                  }
                }}
              >
                {hasVoted[cat.title] ? "Already Voted" : "Cast Your Vote"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}