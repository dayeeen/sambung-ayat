'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

interface LeaderboardUser {
  id: string;
  displayName: string | null;
  longestStreak: number;
  longestCorrectStreak: number;
  totalCorrect: number;
  totalPoints: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'daily' | 'correct' | 'points'>('points');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?sortBy=${sortBy}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load leaderboard', err);
        setLoading(false);
      });
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-6 px-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            Papan Konsistensi
          </h1>
          <p className="text-muted-foreground">
            Istiqomah dalam mempelajari Al-Qur'an
          </p>
          
          {!checkingSession && !isLoggedIn && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center text-sm text-amber-600 dark:text-amber-400 animate-in fade-in slide-in-from-top-2">
               ⚠️ Antum belum login. Hasil latihan antum tidak akan tersimpan di leaderboard.
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex rounded-full bg-muted p-1">
               <button
                onClick={() => setSortBy('points')}
                className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200
                  ${sortBy === 'points' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                Poin
              </button>
              <button
                onClick={() => setSortBy('daily')}
                className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200
                  ${sortBy === 'daily' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                Streak Hari
              </button>
              <button
                onClick={() => setSortBy('correct')}
                className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200
                  ${sortBy === 'correct' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                Jawaban Benar
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Memuat data...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada data. Jadilah yang pertama!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* Table Header */}
              <div className="grid grid-cols-10 sm:grid-cols-12 gap-2 sm:gap-4 p-4 bg-muted/30 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">
                <div className="col-span-2 sm:col-span-2 text-center">#</div>
                <div className="col-span-6 sm:col-span-6">Nama</div>
                <div className="col-span-2 sm:col-span-2 text-center">{sortBy === 'points' ? 'Poin' : 'Streak'}</div>
                <div className="hidden sm:block sm:col-span-2 text-center">Total Benar</div>
              </div>

              {users.map((user, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop3 = rank <= 3;

                return (
                  <div 
                    key={user.id}
                    className={`grid grid-cols-10 sm:grid-cols-12 gap-2 sm:gap-4 p-4 items-center transition-colors hover:bg-muted/20
                      ${isTop1 ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}
                    `}
                  >
                    {/* Rank */}
                    <div className="col-span-2 sm:col-span-2 flex justify-center">
                      <div className={`
                        w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full font-bold text-xs sm:text-sm
                        ${isTop1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 ring-2 ring-amber-500/20' : 
                          isTop3 ? 'bg-muted text-foreground' : 'text-muted-foreground'}
                      `}>
                        {rank}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="col-span-6 sm:col-span-6 font-medium truncate flex items-center gap-2 text-sm sm:text-base">
                      {user.displayName || 'Hamba Allah'}
                      {isTop1 && <span className="text-amber-500 text-xs sm:text-sm">👑</span>}
                    </div>

                    {/* Streak / Points */}
                    <div className="col-span-2 sm:col-span-2 text-center font-mono text-xs sm:text-sm">
                      <span className={`font-bold ${sortBy === 'points' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {sortBy === 'points' 
                          ? `🌟 ${user.totalPoints || 0}`
                          : sortBy === 'daily' 
                            ? `🔥 ${user.longestStreak}` 
                            : `🔥 ${user.longestCorrectStreak}`
                        }
                      </span>
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mt-1 hidden sm:block">
                        {sortBy === 'points' ? 'Total Poin' : (sortBy === 'daily' ? 'Hari' : 'Benar')}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="hidden sm:block sm:col-span-2 text-center font-mono text-sm text-muted-foreground">
                      {user.totalCorrect}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center">
           <Link href="/" className="text-primary hover:underline text-sm">
              ← Kembali ke Menu Utama
           </Link>
        </div>

      </div>
    </div>
  );
}
