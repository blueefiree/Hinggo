"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Camera,
  Coins,
  Calculator,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HowItWorksPage() {
  const [estimatedPrice, setEstimatedPrice] = useState<number>(1000000);
  const [selectedCategory, setSelectedCategory] = useState<string>("KEYBOARD");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fee calculation logic
  const feeRate = 0.08; // 8% consignment fee
  const handlingFeeRate = 0.02; // 2% handling & cleaning
  const consignmentFee = Math.round(estimatedPrice * feeRate);
  const handlingFee = Math.round(estimatedPrice * handlingFeeRate);
  const estimatedNetPayout = estimatedPrice - consignmentFee - handlingFee;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const steps = [
    {
      step: 1,
      title: "Ajukan Online dari Rumah",
      description:
        "Isi data spesifikasi gear (brand, switch/sensor, kelengkapan) dan unggah beberapa foto kondisi awal melalui website Hingo.",
      tag: "Tahap 1",
      icon: Layers,
    },
    {
      step: 2,
      title: "Kirim ke Gudang Inspeksi",
      description:
        "Setelah lolos screening online awal, kirim paket gear kamu ke Gudang Hingo Hub Jakarta Selatan untuk diuji fisik menyeluruh oleh teknisi kami.",
      tag: "Tahap 2",
      icon: Truck,
    },
    {
      step: 3,
      title: "Foto Studio & Pemasaran",
      description:
        "Tim Hingo mengambil foto studio profesional, video sound test, lalu mempromosikan ke ribuan audiens di Instagram, TikTok, dan komunitas peripheral.",
      tag: "Tahap 3",
      icon: Camera,
    },
    {
      step: 4,
      title: "Barang Terjual, Dana Cair Cepat",
      description:
        "Saat pembeli membayar lewat rekening bersama dan paket tiba, hasil bersih penjualan langsung ditransfer ke rekening bank BCA / Mandiri kamu.",
      tag: "Tahap 4",
      icon: Coins,
    },
  ];

  const criteria = [
    "Barang 100% Asli (Bukan barang replika/KW/palsu)",
    "Fungsi elektronik normal (Semua tombol switch, scroll wheel, sensor optik merespons)",
    "Konektivitas stabil (Kabel, Bluetooth, atau dongle 2.4G berfungsi baik)",
    "Kondisi fisik wajar bekas pemakaian (Bukan gear rusak total atau bekas banjir)",
  ];

  const faqs = [
    {
      q: "Berapa lama proses inspeksi fisik di gudang Hingo?",
      a: "Teknisi kami menguji setiap fungsi gear dalam waktu 1x24 jam kerja sejak paket tiba di gudang Jakarta Selatan.",
    },
    {
      q: "Bagaimana jika harga jual yang diusulkan Hingo berbeda dengan harapan saya?",
      a: "Kamu bisa menekan tombol 'Ajukan Negosiasi Harga' untuk memberikan penawaran alternatif atau meminta pengembalian barang jika tidak sepakat.",
    },
    {
      q: "Kapan hasil penjualan titip jual dicairkan ke rekening saya?",
      a: "Dana escrow otomatis dicairkan ke rekening bank penjual 1x24 jam setelah pembeli menerima paket dan mengonfirmasi bahwa gear sesuai.",
    },
    {
      q: "Siapa yang menanggung ongkir pengiriman ke pembeli?",
      a: "Ongkir pengiriman dari gudang Hingo ke pembeli sepenuhnya ditanggung oleh pembeli pada saat checkout.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Hero Header */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-8 sm:p-14 mb-12 shadow-xs text-center flex flex-col items-center gap-4">
        <span className="rounded-full bg-[#FFC629] text-black px-4 py-1 text-xs font-black uppercase tracking-wider">
          PANDUAN KONSINYASI TERKELOLA
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] max-w-3xl leading-tight">
          Kamu Titip Gear Preloved, Kami yang Urus Sampai Terjual
        </h1>
        <p className="text-xs sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
          Tidak perlu pusing melayani chat nawar sadis, foto studio mandiri, atau risiko penipuan pembeli. Hingo menangani pengujian fisik, promosi media sosial, rekening bersama (escrow), hingga pengiriman.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/seller/consignments/new"
            className="px-6 py-3.5 rounded-2xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs sm:text-sm shadow-xs transition active:scale-95"
          >
            Ajukan Titip Jual Sekarang
          </Link>
          <a
            href="#kalkulator"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm border border-neutral-300 transition"
          >
            Hitung Estimasi Hasil Bersih ↓
          </a>
        </div>
      </div>

      {/* 4 Steps Section */}
      <div className="flex flex-col gap-6 mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
            4 Tahap Mudah Titip Jual di Hingo
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Alur konsinyasi transparan dengan pembaruan status real-time di dashboard akunmu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEB] text-amber-700 border border-[#FDE68A]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xl font-black text-neutral-300">
                      0{st.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                    {st.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1.5">
                    {st.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] font-bold text-amber-800">
                  {st.tag}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Consignment Calculator Section */}
      <div id="kalkulator" className="scroll-mt-24 mb-16">
        <div className="rounded-3xl border-2 border-[#FFC629] bg-white p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFC629] text-black">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                  Kalkulator Simulasi Hasil Bersih Titip Jual
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Simulasikan berapa dana yang akan masuk langsung ke rekening bank kamu setelah gear terjual.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold border border-emerald-300 self-start sm:self-auto">
              Komisi Transparan
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            {/* Left Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Pilih Kategori Peripheral
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "KEYBOARD", label: "Keyboard" },
                    { id: "MOUSE", label: "Mouse" },
                    { id: "HEADSET", label: "Headset" },
                    { id: "MONITOR", label: "Monitor" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                        selectedCategory === cat.id
                          ? "bg-[#1A1A1A] text-white border-black"
                          : "bg-[#F6F6F4] text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Slider & Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="estimatedPrice" className="text-xs font-bold text-neutral-700">
                    Estimasi Harga Jual Pasar
                  </label>
                  <span className="font-mono text-base font-black text-amber-950">
                    {formatRupiah(estimatedPrice)}
                  </span>
                </div>

                <input
                  id="estimatedPrice"
                  name="estimatedPrice"
                  type="range"
                  min="200000"
                  max="5000000"
                  step="50000"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full accent-[#FFC629] cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-neutral-400 font-mono mt-1">
                  <span>Rp200.000</span>
                  <span>Rp2.500.000</span>
                  <span>Rp5.000.000</span>
                </div>
              </div>

              {/* Criteria Pills */}
              <div className="rounded-2xl bg-[#F6F6F4] p-4 text-xs text-neutral-600 flex flex-col gap-1.5 border border-neutral-200">
                <span className="font-bold text-neutral-800">Termasuk dalam paket titip Hingo:</span>
                <p>• Foto produk studio & audio sound test switch</p>
                <p>• Iklan berbayar feed Instagram & katalog preloved</p>
                <p>• Proteksi rekening bersama escrow sampai transaksi tuntas</p>
              </div>
            </div>

            {/* Right Result Card */}
            <div className="lg:col-span-5 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 shadow-xs flex flex-col justify-between gap-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-3">
                  Rincian Simulasi Hasil Titip Jual
                </span>

                <div className="flex flex-col gap-2.5 text-xs text-neutral-700">
                  <div className="flex justify-between">
                    <span>Estimasi Harga Jual</span>
                    <strong className="text-black font-bold">{formatRupiah(estimatedPrice)}</strong>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Komisi Hingo (8%)</span>
                    <span className="font-semibold text-neutral-900">- {formatRupiah(consignmentFee)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Biaya penanganan & rekondisi (2%)</span>
                    <span className="font-semibold text-neutral-900">- {formatRupiah(handlingFee)}</span>
                  </div>

                  <div className="pt-3 border-t border-amber-300/80 flex items-baseline justify-between">
                    <span className="text-xs font-black text-amber-950">
                      Estimasi Bersih ke Penjual
                    </span>
                    <span className="text-2xl font-black text-[#16A34A]">
                      {formatRupiah(estimatedNetPayout)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/seller/consignments/new?price=${estimatedPrice}&cat=${selectedCategory}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-xs sm:text-sm font-black text-black shadow-xs transition active:scale-95 text-center"
              >
                <span>Ajukan Titip Jual Gear Ini</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Criteria */}
      <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-10 shadow-xs mb-16">
        <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-4">
          Syarat Peripheral yang Diterima di Hingo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {criteria.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F6F6F4] border border-neutral-200 text-xs font-bold text-neutral-800"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-black text-[#1A1A1A] text-center mb-2">
          Pertanyaan Umum (FAQ)
        </h2>

        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs"
          >
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full p-4 text-left text-xs font-bold flex items-center justify-between hover:bg-neutral-50 transition"
            >
              <span>{faq.q}</span>
              {openFaq === idx ? (
                <ChevronUp className="h-4 w-4 text-neutral-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              )}
            </button>
            {openFaq === idx && (
              <div className="px-4 pb-4 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
