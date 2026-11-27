"use client";

import { useState } from "react";
import { Item } from "@/types";
import { Check, X, FileText, ExternalLink } from "lucide-react";

interface ScreeningRowProps {
  item: any;
  standardReasons: string[];
}

export default function ScreeningItemRow({ item, standardReasons }: ScreeningRowProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(standardReasons[0]);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${item.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "Disetujui, menunggu kiriman",
          notes: "Lolos screening awal. Menunggu kiriman dari consignor.",
        }),
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${item.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "Ditolak saat screening",
          rejectionReason: selectedReason,
          notes: rejectNotes,
        }),
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-card border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <img
          src={item.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=200&q=80"}
          alt=""
          className="size-20 rounded-btn object-cover bg-gray-100 shrink-0"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-yellow-700 uppercase">{item.category}</span>
            <span className="text-xs font-mono text-gray-400">&bull; {item.item_code}</span>
          </div>
          <h4 className="font-bold text-sm text-ink">{item.model}</h4>
          <p className="text-xs text-gray-600">
            Consignor: <strong>{item.consignor?.name}</strong> ({item.consignor?.phone || item.consignor?.whatsapp || "-"})
          </p>
          <p className="text-xs text-gray-600">
            Harga Harapan: <strong>Rp {Number(item.expected_price).toLocaleString("id-ID")}</strong> &bull; Min: Rp {Number(item.min_price).toLocaleString("id-ID")}
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs text-blue-600 font-semibold">
            <a
              href="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              <FileText className="size-3.5" />
              Lihat KTP (Signed URL)
            </a>
          </div>
        </div>
      </div>

      {/* Approve / Reject Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className="px-3.5 py-2 border border-danger/40 text-danger hover:bg-danger-bg text-xs font-bold rounded-btn flex items-center gap-1.5 transition-colors"
        >
          <X className="size-3.5" />
          Tolak
        </button>

        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold rounded-btn shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Check className="size-3.5" />
          Setujui Screening
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 max-w-md w-full border border-gray-200 shadow-card space-y-4">
            <h3 className="font-bold text-base text-ink">Pilih Alasan Baku Penolakan</h3>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alasan Baku</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                >
                  {standardReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan Tambahan (Wajib jika alasan lainnya)</label>
                <textarea
                  rows={2}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-btn"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-danger text-white text-xs font-bold rounded-btn"
                >
                  {loading ? "Menolak..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
