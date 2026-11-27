"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, Play, RotateCcw, FastForward, CheckCircle2, ShieldAlert } from "lucide-react";

export default function TimeTravelSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [schedulerResult, setSchedulerResult] = useState<any>(null);
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/cron/scheduler");
      const data = await res.json();
      setSchedulerResult(data);
      setCurrentTimeOffset(data.timeOffsetHours || 0);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAdvance = async (hours: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advanceHours: hours }),
      });
      const data = await res.json();
      setSchedulerResult(data);
      setCurrentTimeOffset(data.timeOffsetHours || 0);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    handleAdvance(-currentTimeOffset);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            <Link href="/admin" className="hover:underline">Admin</Link> / Pengaturan & Demo
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2">
            <Clock className="size-7 text-yellow-600" />
            Simulasi Percepatan Waktu (Demo MVP)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kontrol time-travel untuk mendemokan skenario berbasis waktu: order hold 24 jam, batas resi 48 jam, usulan harga hari ke-21/30, dan akhir masa 60 hari.
          </p>
        </div>

        {/* Time Simulation Console */}
        <div className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 shadow-card space-y-6">
          <div className="p-4 bg-yellow-50 rounded-btn border border-yellow-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-yellow-800 font-semibold uppercase tracking-wider">Waktu Sistem Tersimulasi</span>
              <p className="text-xl font-black text-ink mt-0.5">
                {schedulerResult?.simulatedTime ? new Date(schedulerResult.simulatedTime).toLocaleString("id-ID") : "Memuat..."}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Offset Waktu Aktif: <strong>+{currentTimeOffset} Jam</strong> ({Math.round(currentTimeOffset / 24)} Hari)
              </p>
            </div>

            <button
              onClick={handleReset}
              disabled={loading || currentTimeOffset === 0}
              className="px-3.5 py-2 border border-yellow-300 bg-white hover:bg-yellow-100 disabled:opacity-50 text-xs font-bold text-yellow-900 rounded-btn flex items-center gap-1.5 transition-colors self-start sm:self-center"
            >
              <RotateCcw className="size-3.5" />
              Reset ke Waktu Sekarang
            </button>
          </div>

          {/* Quick Action Controls */}
          <div>
            <h3 className="font-bold text-sm text-ink mb-3">Kontrol Percepatan Waktu & Eksekusi Scheduler</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleAdvance(12)}
                disabled={loading}
                className="p-3 bg-gray-100 hover:bg-yellow-100 rounded-btn text-xs font-bold text-ink border border-gray-200 hover:border-yellow-300 transition-all text-center"
              >
                <FastForward className="size-4 mx-auto mb-1 text-yellow-600" />
                +12 Jam
                <span className="block text-[10px] text-gray-500 font-normal">Pengingat Pembayaran</span>
              </button>

              <button
                onClick={() => handleAdvance(24)}
                disabled={loading}
                className="p-3 bg-gray-100 hover:bg-yellow-100 rounded-btn text-xs font-bold text-ink border border-gray-200 hover:border-yellow-300 transition-all text-center"
              >
                <FastForward className="size-4 mx-auto mb-1 text-yellow-600" />
                +24 Jam (1 Hari)
                <span className="block text-[10px] text-gray-500 font-normal">Order Hold Expired</span>
              </button>

              <button
                onClick={() => handleAdvance(48)}
                disabled={loading}
                className="p-3 bg-gray-100 hover:bg-yellow-100 rounded-btn text-xs font-bold text-ink border border-gray-200 hover:border-yellow-300 transition-all text-center"
              >
                <FastForward className="size-4 mx-auto mb-1 text-yellow-600" />
                +48 Jam (2 Hari)
                <span className="block text-[10px] text-gray-500 font-normal">Batas Resi Expired</span>
              </button>

              <button
                onClick={() => handleAdvance(1440)}
                disabled={loading}
                className="p-3 bg-gray-100 hover:bg-yellow-100 rounded-btn text-xs font-bold text-ink border border-gray-200 hover:border-yellow-300 transition-all text-center"
              >
                <FastForward className="size-4 mx-auto mb-1 text-yellow-600" />
                +60 Hari
                <span className="block text-[10px] text-gray-500 font-normal">Akhir Masa 60 Hari</span>
              </button>
            </div>
          </div>

          {/* Trigger Now Button */}
          <div className="pt-2">
            <button
              onClick={() => handleAdvance(0)}
              disabled={loading}
              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm rounded-btn shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Play className="size-4 fill-current" />
              {loading ? "Mengevaluasi Jadwal..." : "Jalankan Seluruh Aturan Scheduler Sekarang"}
            </button>
          </div>

          {/* Live Scheduler Log Output */}
          {schedulerResult && (
            <div className="p-4 bg-gray-900 text-gray-100 rounded-btn space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-gray-800 pb-2">
                <span>HASIL EKSEKUSI SCHEDULER</span>
                <span className="text-[10px] text-gray-400">Timestamp: {schedulerResult.timestamp}</span>
              </div>
              <div className="space-y-1 pt-1">
                {schedulerResult.messages?.map((msg: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-yellow-500">&gt;</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Parameter Bisnis Setting Display */}
        <div className="bg-white p-6 rounded-card border border-gray-200 space-y-4">
          <h3 className="font-bold text-base text-ink">Parameter Pengaturan Tarif & Waktu Hinggo (Database)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-btn">
              <span className="text-gray-500 block">Fee Flat &le; Rp 200rb:</span>
              <strong className="text-ink text-sm">Rp 10.000</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-btn">
              <span className="text-gray-500 block">Fee Persentase &gt; Rp 200rb:</span>
              <strong className="text-ink text-sm">5%</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-btn">
              <span className="text-gray-500 block">Ongkir Flat Dummy:</span>
              <strong className="text-ink text-sm">Rp 18.000</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-btn">
              <span className="text-gray-500 block">Batas Asuransi Dummy:</span>
              <strong className="text-ink text-sm">Rp 500.000 (Biaya Rp 5.000)</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-btn">
              <span className="text-gray-500 block">Biaya Penarikan Dini:</span>
              <strong className="text-ink text-sm">Rp 25.000</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-btn">
              <span className="text-gray-500 block">Masa Garansi Toko:</span>
              <strong className="text-ink text-sm">7 Hari Kalender</strong>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
