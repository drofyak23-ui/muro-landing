"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const BACKEND = "https://meme-bot-production-5a56.up.railway.app";

interface BotState {
  balanceSol: number;
  totalPnlSol: number;
  totalTrades: number;
  wins: number;
  losses: number;
  autoRunning: boolean;
  dayStartBalanceSol: number;
  pausedUntil: string | null;
  consecutiveLosses: number;
}

interface Trade {
  id: string;
  tokenSymbol: string;
  status: string;
  pnlSol: number | null;
  pnlPercent: number | null;
  amountSol: number;
  entryMcap: number | null;
  exitMcap: number | null;
  currentMcap: number | null;
  openedAt: string;
  closedAt: string | null;
}

const fmtMC = (n: number | null | undefined) => {
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1000).toFixed(1)}k`;
};

const fmtTime = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = Date.now();
  const ageMin = Math.round((now - d.getTime()) / 60000);
  if (ageMin < 60) return `${ageMin}m ago`;
  if (ageMin < 1440) return `${Math.round(ageMin / 60)}h ago`;
  return `${Math.round(ageMin / 1440)}d ago`;
};

export default function StatsPage() {
  const [state, setState] = useState<BotState | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    try {
      const [stateRes, tradesRes] = await Promise.all([
        fetch(`${BACKEND}/api/state`),
        fetch(`${BACKEND}/api/trades`),
      ]);
      const stateData = await stateRes.json();
      const tradesData = await tradesRes.json();
      setState(stateData);
      setTrades(tradesData);
    } catch (e) {
      console.error("fetch error", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, []);

  if (loading || !state) {
    return (
      <main className="min-h-screen w-full bg-black text-neutral-400 flex items-center justify-center font-mono text-sm tracking-widest">
        LOADING...
      </main>
    );
  }

  const winRate =
    state.wins + state.losses > 0
      ? ((state.wins / (state.wins + state.losses)) * 100).toFixed(1)
      : "0.0";

  const pnlColor = state.totalPnlSol >= 0 ? "text-emerald-500" : "text-red-500";
  const pnlSign = state.totalPnlSol >= 0 ? "+" : "";

  // CLOSED WINNERS ONLY — sorted by best PnL %
  const winners = trades
    .filter((t) => t.status !== "OPEN" && (t.pnlPercent || 0) > 0)
    .sort((a, b) => (b.pnlPercent || 0) - (a.pnlPercent || 0));

  const avgWinner =
    winners.length > 0
      ? winners.reduce((s, t) => s + (t.pnlPercent || 0), 0) / winners.length
      : 0;

  const bestWin = winners.length > 0 ? winners[0].pnlPercent || 0 : 0;

  return (
    <main className="min-h-screen w-full bg-black text-neutral-200 px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12 md:mb-16">
          <Link href="/" className="flex items-center gap-4 group">
            <Image
              src="/muro-logo.svg"
              alt="MURO"
              width={60}
              height={60}
              className="w-12 md:w-14 h-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div>
              <div className="text-[10px] md:text-[11px] text-neutral-600 tracking-[0.35em] uppercase">
                On-chain market intelligence
              </div>
              <div className="text-xs text-neutral-500 tracking-wider uppercase mt-1">
                Winning Trades · Live
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${state.autoRunning ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-[10px] text-neutral-500 tracking-widest uppercase">
              {state.autoRunning ? "Active" : "Paused"}
            </span>
          </div>
        </div>

        {/* PNL HERO — honest total */}
        <div className="mb-12 md:mb-16">
          <div className="text-[10px] text-neutral-600 tracking-[0.35em] uppercase mb-3">
            Total Profit & Loss
          </div>
          <div className={`text-5xl md:text-7xl font-light tracking-tight ${pnlColor}`}>
            {pnlSign}
            {state.totalPnlSol.toFixed(3)}
            <span className="text-2xl md:text-3xl text-neutral-600 ml-2 tracking-widest">SOL</span>
          </div>
          <div className="text-sm text-neutral-500 mt-3 font-mono">
            {state.balanceSol.toFixed(3)} / 10.000 SOL balance · {state.totalTrades} trades · {winRate}% win rate
          </div>
        </div>

        {/* WIN STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900 mb-12 md:mb-16">
          <div className="bg-black p-5 md:p-6">
            <div className="text-[9px] text-neutral-600 tracking-[0.3em] uppercase mb-2">
              Total Wins
            </div>
            <div className="text-3xl text-emerald-500 font-light tracking-tight">
              {state.wins}
            </div>
            <div className="text-[10px] text-neutral-600 font-mono mt-1">
              closed positions
            </div>
          </div>
          <div className="bg-black p-5 md:p-6">
            <div className="text-[9px] text-neutral-600 tracking-[0.3em] uppercase mb-2">
              Win Rate
            </div>
            <div className="text-3xl text-[#C9A86A] font-light tracking-tight">
              {winRate}%
            </div>
            <div className="text-[10px] text-neutral-600 font-mono mt-1">
              {state.wins}W · {state.losses}L
            </div>
          </div>
          <div className="bg-black p-5 md:p-6">
            <div className="text-[9px] text-neutral-600 tracking-[0.3em] uppercase mb-2">
              Avg Winner
            </div>
            <div className="text-3xl text-emerald-500 font-light tracking-tight">
              {avgWinner > 0 ? "+" : ""}
              {avgWinner.toFixed(1)}%
            </div>
            <div className="text-[10px] text-neutral-600 font-mono mt-1">per trade</div>
          </div>
          <div className="bg-black p-5 md:p-6">
            <div className="text-[9px] text-neutral-600 tracking-[0.3em] uppercase mb-2">
              Best Trade
            </div>
            <div className="text-3xl text-[#C9A86A] font-light tracking-tight">
              {bestWin > 0 ? "+" : ""}
              {bestWin.toFixed(1)}%
            </div>
            <div className="text-[10px] text-neutral-600 font-mono mt-1">all time</div>
          </div>
        </div>

        {/* WINNING TRADES */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-6 bg-[#C9A86A]/40" />
            <h2 className="text-[10px] text-neutral-600 tracking-[0.35em] uppercase">
              Winning Trades
            </h2>
            <span className="text-[10px] text-neutral-700 font-mono ml-auto">
              {winners.length} total
            </span>
          </div>
          {winners.length === 0 ? (
            <p className="text-neutral-600 text-sm font-mono">
              Awaiting first closed winner...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-900">
                    <th className="text-left p-3 text-[9px] text-neutral-600 tracking-[0.3em] uppercase font-normal">
                      Token
                    </th>
                    <th className="text-right p-3 text-[9px] text-neutral-600 tracking-[0.3em] uppercase font-normal">
                      Entry
                    </th>
                    <th className="text-right p-3 text-[9px] text-neutral-600 tracking-[0.3em] uppercase font-normal">
                      Exit
                    </th>
                    <th className="text-right p-3 text-[9px] text-neutral-600 tracking-[0.3em] uppercase font-normal hidden md:table-cell">
                      Size
                    </th>
                    <th className="text-right p-3 text-[9px] text-neutral-600 tracking-[0.3em] uppercase font-normal">
                      PnL
                    </th>
                    <th className="text-right p-3 text-[9px] text-neutral-600 tracking-[0.3em] uppercase font-normal">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {winners.slice(0, 50).map((t) => (
                    <tr key={t.id} className="border-b border-neutral-900/50">
                      <td className="p-3 font-mono text-neutral-200">{t.tokenSymbol}</td>
                      <td className="p-3 text-right font-mono text-neutral-500 text-xs">
                        {fmtMC(t.entryMcap)}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-500 text-xs">
                        {fmtMC(t.exitMcap)}
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-500 text-xs hidden md:table-cell">
                        {t.amountSol.toFixed(3)} SOL
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-500">
                        +{t.pnlPercent?.toFixed(1) || "0"}%
                      </td>
                      <td className="p-3 text-right font-mono text-neutral-600 text-xs">
                        {fmtTime(t.closedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-8 border-t border-neutral-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-[10px] text-neutral-700 font-mono tracking-wider">
              Paper trades · Solana memecoins · Updates every 15s
            </div>
            <Link
              href="/"
              className="text-[10px] text-neutral-500 hover:text-[#C9A86A] tracking-[0.3em] uppercase transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}