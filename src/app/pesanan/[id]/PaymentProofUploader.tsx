"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";

interface PaymentProofProps {
  orderId: string;
  existingProof?: string;
}

export default function PaymentProofUploader({ orderId, existingProof }: PaymentProofProps) {
  const [proofUrl, setProofUrl] = useState(existingProof || "");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUploadSimulated = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProofUrl: proofUrl }),
      });

      if (res.ok) {
        setUploaded(true);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  if (existingProof || uploaded) {
    return (
      <div className="p-4 bg-emerald-50 rounded-btn border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
        <CheckCircle2 className="size-4.5 text-success shrink-0" />
        <span>Bukti transfer berhasil diunggah. Menunggu verifikasi dari Admin Hinggo.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleUploadSimulated} className="bg-white p-4 rounded-btn border border-amber-200 space-y-3">
      <h4 className="font-bold text-xs text-ink flex items-center gap-1.5">
        <UploadCloud className="size-4 text-yellow-600" />
        Unggah Bukti Transfer Bank
      </h4>

      <div>
        <label className="block text-[11px] text-gray-600 mb-1">
          Masukkan URL Gambar Bukti Transfer (atau gunakan link simulasi):
        </label>
        <input
          type="url"
          required
          placeholder="https://images.unsplash.com/... atau link foto bukti"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          className="w-full h-9 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setProofUrl("https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80")}
          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-btn text-[11px] text-gray-700 font-medium"
        >
          Isi Contoh Bukti Transfer
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold rounded-btn shadow-xs ml-auto"
        >
          {loading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
        </button>
      </div>
    </form>
  );
}
