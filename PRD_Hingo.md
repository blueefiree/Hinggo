# PRD Hingo: website consignment komponen dan periferal komputer bekas

Draf 1 untuk tim pengembang.

## 1. Ringkasan dan tujuan MVP

Hingo adalah layanan consignment komponen dan periferal komputer bekas. Consignor menitipkan barang, Hingo menguji dan menjualnya, dan Hingo mengambil fee dari harga jual.

### 1.1 Bisnis

- Hingo tidak memiliki barang. Hingo menjual barang milik consignor dan mengambil fee Rp10.000 untuk harga jual sampai Rp200.000, atau 5% untuk harga di atasnya.

- Consignor mendapat kemudahan menjual barang bekas. Pembeli mendapat barang bekas yang sudah diuji, lengkap dengan laporan uji dan garansi 7 hari.

- Hingo yang melakukan penjualan, transaksi, pemasaran, dan penanganan pembeli. Barang dijual lewat website. Pemasaran di Instagram, TikTok, dan Facebook berada di luar PRD ini.

### 1.2 Tujuan MVP

- Membuktikan bahwa satu barang bisa melewati seluruh alur, dari pengajuan consignor sampai consignor dibayar, dengan website sebagai pengendali alur.

- Mengotomatiskan hal yang sulit dikerjakan manual saat barang banyak: status barang, penahanan, usulan penurunan harga, perhitungan fee, serta notifikasi.

- Mempertahankan pengecekan fisik oleh manusia sebagai jaminan kepercayaan pembeli.

### 1.3 Pembaca dokumen

PRD ini ditulis untuk tim pengembang beranggota empat orang dan menjadi acuan bersama. Kriteria selesai ada di bagian 9.

## 2. Lingkup MVP

MVP mencakup 28 fitur di bagian 5 untuk tiga kategori barang (RAM, SSD, dan GPU), dengan penjualan lewat website.

### 2.1 Masuk MVP

- 28 fitur di bagian 5, untuk consignor, pembeli, admin, dan sistem.

- Tiga kategori barang dengan checklist uji masing-masing: RAM, SSD, dan GPU.

- Website sebagai satu-satunya sistem. Website juga menjadi satu-satunya kanal penjualan.

- Transaksi dan pembayaran nyata tidak diwajibkan, jadi MVP boleh berjalan dengan data uji.

### 2.2 Tidak dikerjakan di MVP

| Hal | Pengganti di MVP |
| --- | --- |
| WhatsApp otomatis | Email otomatis dan penanda di dasbor. Nomor WhatsApp disimpan untuk kontak manual |
| Ongkir dari API ekspedisi | Ongkir dummy bernilai tetap yang diatur admin |
| Payment gateway | Transfer manual dengan unggah bukti, diverifikasi admin |
| Verifikasi email | Pendaftaran tanpa verifikasi email |
| Verifikasi KTP otomatis | KTP diunggah dan disimpan, admin memeriksa secara manual |
| Ekspor laporan ke CSV | Tidak ada |
| Kategori selain RAM, SSD, dan GPU | Menyusul setelah MVP, termasuk periferal |
| Pemasaran di media sosial | Di luar PRD |

## 3. Peran pengguna

Sistem melayani empat aktor: consignor, pembeli, admin, dan sistem otomatis. Hak akses mengikuti tabel ini dan diperinci di bagian 4 dan 5.

| Peran | Siapa | Boleh | Tidak boleh |
| --- | --- | --- | --- |
| Consignor | Pemilik barang yang menitipkan | Mengajukan barang, mengunggah KTP dan bukti kepemilikan, menyetujui syarat, mengisi resi, menjawab usulan penurunan harga, memilih perpanjang atau ambil kembali, mengajukan penarikan, dan melihat barang serta pembayarannya sendiri | Mengubah status atau harga secara langsung, dan melihat barang consignor lain |
| Pembeli | Pembeli | Melihat katalog dan halaman produk, memakai keranjang dan checkout, mengunggah bukti transfer, melihat pesanan sendiri, dan mengajukan klaim dalam masa garansi | Melihat identitas consignor atau dokumennya, dan mengubah status |
| Admin | Anggota tim Hingo, akun dibuat oleh tim | Screening, pengujian, penetapan harga, verifikasi pembayaran, pengisian resi, pemrosesan klaim, pembayaran consignor, pengaturan, dan manajemen pengguna | Memindahkan status di luar tabel 4.2, dan mengubah status akhir |
| Sistem otomatis | Penjadwal dan modul notifikasi | Membuat penahanan, usulan penurunan harga, batas respons, status Masa penitipan habis, keputusan ambil kembali bila consignor tidak merespons, kedaluwarsa pengajuan yang resinya tidak diisi, dan status Siap dibayar ke consignor, menghitung fee, serta mengirim notifikasi | Mengubah harga tanpa persetujuan consignor |

- Satu akun bisa menjadi consignor dan pembeli sekaligus.

- Pengunjung tanpa akun bisa melihat katalog dan halaman produk. Akun dibutuhkan untuk mengajukan barang dan untuk checkout.

## 4. Status barang dan aturan perpindahannya

Setiap barang berada di satu dari 20 status. Admin memindahkan status lewat transisi di tabel 4.2, consignor dan pembeli hanya melakukan tindakan yang tercatat di 4.4, dan pembayaran ke consignor hanya terjadi dari status Siap dibayar ke consignor.

alur status barang · jalur utama dan pengembalian

Diagram menyederhanakan alurnya: status 6 sampai 8 digabung menjadi Pengembalian ke consignor. Hasil klaim, Masa penitipan habis, dan batas waktu dijelaskan di tabel 4.2 dan 4.3.

### 4.1 Daftar status

| No | Status | Arti | Akhir |
| --- | --- | --- | --- |
| 1 | Diajukan | Consignor sudah mengisi formulir dan mengunggah KTP serta bukti kepemilikan. Menunggu screening daring. | Tidak |
| 2 | Ditolak saat screening | Admin menolak dari data dan foto, atau pengajuan kedaluwarsa karena resi tidak diisi dalam 2x24 jam. Barang belum dikirim. | Ya |
| 3 | Disetujui, menunggu kiriman | Screening lolos. Consignor sudah menerima syarat dan panduan packing. | Tidak |
| 4 | Dalam perjalanan ke Hingo | Consignor sudah mengisi nomor resi. Ongkir ditanggung consignor. | Tidak |
| 5 | Diterima, sedang diuji | Paket dibuka dengan video. Admin menguji dengan checklist kategori dan menyimpan dokumentasinya. Bila hasil uji lebih buruk dari klaim consignor, barang tetap di status ini sampai consignor memutuskan lewat chat dengan admin. | Tidak |
| 6 | Ditolak setelah pengecekan | Barang gagal uji, tidak sesuai pengajuan, atau rusak dalam pengiriman. Alasannya dipilih dari daftar baku di 4.4. | Tidak |
| 7 | Menunggu ongkir kembali | Barang akan dikirim balik setelah consignor membayar ongkir kembali dan, untuk penarikan, biaya penarikan Rp25.000. Bila belum dibayar dalam 1x24 jam, barang tetap disimpan dan tidak ditayangkan. | Tidak |
| 8 | Dikembalikan ke consignor | Barang sudah dikirim balik. | Ya |
| 9 | Tayang | Barang ada di katalog website. Masa penitipan 60 hari berjalan. | Tidak |
| 10 | Ditahan menunggu pembayaran | Pembeli sudah membuat pesanan. Barang ditahan sampai bukti transfer masuk. | Tidak |
| 11 | Dibayar, dikemas | Pembayaran terverifikasi. Barang dikemas dan didokumentasikan. | Tidak |
| 12 | Dikirim ke pembeli | Nomor resi sudah diisi. Ongkir ditanggung pembeli. | Tidak |
| 13 | Diterima pembeli | Barang sudah sampai. Garansi 7 hari berjalan sejak barang diterima. | Tidak |
| 14 | Klaim diproses | Pembeli sudah mengajukan klaim dengan bukti. Admin memeriksa. | Tidak |
| 15 | Klaim: cacat tersembunyi | Cacat tidak mungkin terdeteksi saat pengujian. Consignor tidak dibayar untuk penjualan ini. | Akhir transaksi |
| 16 | Klaim: kesalahan Hingo | Cacat seharusnya terdeteksi, atau laporan uji tidak sesuai kondisi barang. Pembeli menerima refund. | Akhir transaksi |
| 17 | Siap dibayar ke consignor | Dana sudah masuk ke rekening Hingo dan masa garansi sudah lewat tanpa klaim. | Tidak |
| 18 | Consignor sudah dibayar | Harga jual dikurangi fee sudah ditransfer ke consignor. | Ya |
| 19 | Masa penitipan habis | Hari ke-60 sejak pertama tayang sudah lewat. Menunggu keputusan consignor selama 3x24 jam. | Tidak |
| 20 | Klaim: kesalahan pengiriman | Barang rusak dalam perjalanan ke pembeli. Hingo mengurus masalah ini dengan ekspedisi. Penanganan rincian tidak termasuk MVP. | Akhir transaksi |

Status 15, 16, dan 20 mengakhiri transaksi, bukan barangnya. Barang lanjut sesuai tabel 4.2, kecuali status 20 yang rinciannya tidak termasuk MVP.

### 4.2 Tabel transisi

| Dari | Ke | Pemicu | Pelaku |
| --- | --- | --- | --- |
| Diajukan | Ditolak saat screening | Data atau foto tidak memenuhi syarat | Admin |
| Diajukan | Disetujui, menunggu kiriman | Screening lolos | Admin |
| Disetujui, menunggu kiriman | Dalam perjalanan ke Hingo | Consignor mengisi resi | Consignor |
| Disetujui, menunggu kiriman | Ditolak saat screening | Resi belum diisi dalam 2x24 jam | Sistem |
| Dalam perjalanan ke Hingo | Diterima, sedang diuji | Paket tiba dan dibuka | Admin |
| Diterima, sedang diuji | Tayang | Lolos uji, harga tayang ditetapkan | Admin |
| Diterima, sedang diuji | Ditolak setelah pengecekan | Gagal uji, tidak sesuai pengajuan, atau rusak dalam pengiriman | Admin |
| Diterima, sedang diuji | Tayang | Hasil uji lebih buruk dari klaim consignor, dan consignor menyetujui harga yang disesuaikan | Admin |
| Diterima, sedang diuji | Menunggu ongkir kembali | Hasil uji lebih buruk dari klaim consignor, dan consignor memilih ambil kembali | Admin |
| Ditolak setelah pengecekan | Menunggu ongkir kembali | Alasan penolakan dicatat | Admin |
| Menunggu ongkir kembali | Dikembalikan ke consignor | Consignor sudah membayar ongkir kembali (dan biaya penarikan Rp25.000 untuk penarikan), buktinya diverifikasi admin, lalu barang dikirim balik | Admin |
| Tayang | Ditahan menunggu pembayaran | Pembeli menyelesaikan checkout | Sistem |
| Ditahan menunggu pembayaran | Tayang | 24 jam lewat tanpa bukti transfer | Sistem |
| Ditahan menunggu pembayaran | Dibayar, dikemas | Bukti transfer terverifikasi | Admin |
| Dibayar, dikemas | Dikirim ke pembeli | Resi diisi | Admin |
| Dikirim ke pembeli | Diterima pembeli | Tanggal terima diisi dari resi atau konfirmasi pembeli | Admin |
| Diterima pembeli | Klaim diproses | Pembeli mengajukan klaim dalam masa garansi 7 hari | Pembeli |
| Klaim diproses | Klaim: cacat tersembunyi | Klaim valid, cacat tidak mungkin terdeteksi saat uji | Admin |
| Klaim diproses | Klaim: kesalahan Hingo | Klaim valid, cacat seharusnya terdeteksi atau laporan uji tidak sesuai | Admin |
| Klaim diproses | Klaim: kesalahan pengiriman | Klaim valid, barang rusak dalam perjalanan ke pembeli | Admin |
| Klaim diproses | Diterima pembeli | Klaim tidak valid, masa garansi tetap berjalan | Admin |
| Klaim: cacat tersembunyi | Menunggu ongkir kembali | Barang kembali ke Hingo, consignor tidak dibayar | Admin |
| Klaim: kesalahan Hingo | Tayang | Refund selesai, barang diuji ulang dan ditayangkan lagi | Admin |
| Diterima pembeli | Siap dibayar ke consignor | Dana masuk dan masa garansi 7 hari lewat tanpa klaim | Sistem |
| Siap dibayar ke consignor | Consignor sudah dibayar | Transfer ke consignor dilakukan dan buktinya dicatat | Admin |
| Tayang | Masa penitipan habis | Hari ke-60 sejak pertama tayang | Sistem |
| Masa penitipan habis | Tayang | Consignor memilih perpanjang, dengan harga baru yang disepakati dengan admin | Consignor |
| Masa penitipan habis | Menunggu ongkir kembali | Consignor memilih ambil kembali, atau sistem menetapkannya bila tidak ada respons dalam 3x24 jam | Consignor |
| Tayang | Menunggu ongkir kembali | Consignor menarik barang sebelum masa habis dan dikenai biaya penarikan Rp25.000 | Consignor mengajukan, admin memproses |

### 4.3 Aturan berbasis waktu

| Aturan | Waktu | Efek |
| --- | --- | --- |
| Penahanan pesanan | 24 jam sejak checkout | Barang kembali Tayang bila bukti transfer belum masuk |
| Usulan penurunan harga, barang Rp200.000 ke atas | Hari ke-21, 36, dan 50 sejak pertama tayang | Sistem membuat usulan penurunan 5% dari harga awal di tiap tahap. Harga berubah setelah consignor menyetujui, dan usulan tidak boleh di bawah harga minimum consignor |
| Usulan penurunan harga, barang di bawah Rp200.000 | Hari ke-30 | Sistem membuat satu usulan penurunan 10%. Harga berubah setelah consignor menyetujui, dan usulan tidak boleh di bawah harga minimum consignor |
| Batas respons usulan | 3 hari sejak usulan dibuat, dengan satu pengingat | Tanpa jawaban, usulan dianggap ditolak dan harga tetap. Usulan berikutnya muncul pada jadwal berikutnya |
| Masa penitipan | 60 hari sejak pertama tayang | Status berubah menjadi Masa penitipan habis |
| Perpanjangan | Satu kali, 30 hari | Harga baru disepakati admin dan consignor |
| Batas keputusan akhir masa | 3x24 jam setelah status Masa penitipan habis | Tanpa respons, barang dianggap diambil kembali dan masuk Menunggu ongkir kembali |
| Batas isi resi | 2x24 jam setelah pengajuan disetujui | Pengajuan kedaluwarsa dan berstatus Ditolak saat screening, consignor bisa mengajukan ulang |
| Batas pembayaran ongkir kembali | 1x24 jam setelah status Menunggu ongkir kembali | Tanpa pembayaran, barang tetap disimpan Hingo dan tidak ditayangkan. Halaman produknya menampilkan Tidak tersedia. Barang dikirim balik setelah consignor membayar |
| Garansi | 7 hari sejak barang diterima pembeli | Klaim diterima selama masa ini |

### 4.4 Aturan lain

- Barang yang tidak berstatus Tayang tidak muncul di katalog website.

- Syarat Siap dibayar ke consignor: dana masuk ke rekening Hingo dan garansi 7 hari lewat tanpa klaim. Fee dihitung dari harga jual akhir.

- Ditolak saat screening, Dikembalikan ke consignor, dan Consignor sudah dibayar tidak bisa diubah lagi. Koreksi dilakukan lewat catatan, bukan dengan mengubah status.

- Ongkir kembali selalu ditanggung consignor, baik karena penolakan, penarikan, tidak diperpanjang, maupun cacat tersembunyi. Ongkir memakai nilai dummy di MVP dan dibayar lebih dulu, bersama biaya penarikan Rp25.000 bila consignor menarik barang sebelum masa habis. Pembayarannya memakai metode yang sama dengan pembeli, yaitu transfer manual dengan bukti yang diverifikasi admin, dan barang baru dikirim balik setelah semua biaya lunas.

- Setiap perubahan status dicatat dengan barang, status lama, status baru, pelaku, waktu, dan catatan. Perubahan harga dicatat terpisah dengan harga lama, harga baru, alasan (harga awal, penurunan yang disetujui consignor, perubahan oleh admin atas permintaan consignor, atau perpanjangan), dan waktu.

- Admin mengubah status hanya lewat transisi di tabel 4.2. Consignor mengajukan barang, menyetujui syarat, mengisi resi, menjawab usulan penurunan harga, memilih perpanjang atau ambil kembali, mengajukan penarikan, dan mengunggah bukti transfer untuk ongkir kembali. Pembeli hanya mengunggah bukti transfer dan mengajukan klaim.

- Alasan penolakan memakai daftar baku (usulan): barang tidak berfungsi, kondisi tidak sesuai pengajuan, bukti kepemilikan tidak memenuhi syarat, rusak dalam pengiriman, kategori tidak diterima, tidak dikirim tepat waktu, dan lainnya dengan catatan wajib.

- Barang di keranjang tidak ditahan. Penahanan 24 jam dimulai saat checkout, satu pesanan boleh berisi beberapa barang, dan status serta klaim dicatat per barang.

- Setelah barang diserahkan ke ekspedisi untuk dikirim balik, barang bukan lagi tanggung jawab Hingo. Bila ekspedisi mengembalikan barang ke Hingo, admin menghubungi consignor, dan kejadiannya dicatat sebagai catatan pada barang tanpa mengubah status akhir.

- Pembeli yang membuka halaman produk barang yang tidak berstatus Tayang melihat label Tidak tersedia.

- Setiap usulan penurunan harga dicatat dengan harga usulan, jawaban consignor (setuju, tolak, atau tanpa jawaban), dan waktu.

- Consignor menjawab usulan lewat dasbor. Consignor yang ingin harga lain menghubungi admin, dan admin mengubah harga atas permintaan itu.

## 5. Kebutuhan fungsional

MVP memuat 28 fitur untuk consignor, pembeli, admin, dan sistem. Nomor fitur dipakai sebagai rujukan di bagian 9.

### 5.1 Consignor

| No | Fitur | Rincian |
| --- | --- | --- |
| 1 | Akun consignor | Daftar dan masuk. Rekening untuk pembayaran disimpan di profil. |
| 2 | Formulir pengajuan | Jenis, merek, model, kondisi, lama pemakaian, kelengkapan, foto, harga yang diinginkan, dan harga minimum. |
| 3 | Unggah KTP dan bukti kepemilikan | Hanya admin dan consignor sendiri yang bisa melihat. |
| 4 | Persetujuan syarat penitipan | Consignor menyetujui fee, ongkir, pembayaran setelah garansi, jadwal usulan penurunan harga yang perlu disetujui consignor, dan aturan akhir masa sebelum mengirim barang. |
| 5 | Dasbor consignor | Daftar barang, status, riwayat harga, usulan penurunan harga yang menunggu jawaban, dan rincian pembayaran (harga jual, fee, jumlah diterima). |
| 6 | Isi resi pengiriman | Mengubah status menjadi Dalam perjalanan ke Hingo. Batas pengisian 2x24 jam setelah pengajuan disetujui. |
| 7 | Keputusan consignor atas barang | Setujui atau tolak usulan penurunan harga, pilih perpanjang atau ambil kembali, dan ajukan penarikan sebelum masa habis dengan biaya Rp25.000. Batas keputusan setelah masa habis adalah 3x24 jam. Consignor membayar ongkir kembali dan biaya penarikan lewat unggah bukti transfer, seperti pembeli. |

### 5.2 Pembeli

| No | Fitur | Rincian |
| --- | --- | --- |
| 8 | Akun pembeli | Daftar dan masuk dengan email dan kata sandi. |
| 9 | Katalog | Pencarian teks, filter kategori, rentang harga, dan kondisi, dengan urutan harga atau terbaru. |
| 10 | Halaman produk | Foto, spesifikasi, harga, laporan uji, video YouTube, tanggal uji, kelengkapan, dan ketentuan garansi. Barang yang tidak berstatus Tayang menampilkan label Tidak tersedia. |
| 11 | Keranjang dan checkout | Alamat, ongkir dummy, asuransi dummy otomatis untuk barang di atas Rp500.000, ringkasan pesanan, lalu penahanan 24 jam. |
| 12 | Pembayaran dan riwayat pesanan | Unggah bukti transfer, lihat status pesanan, dan lihat riwayat. |
| 13 | Klaim garansi | Formulir dengan bukti foto dan tautan video, selama masa garansi 7 hari. |
| 14 | Halaman kebijakan | Garansi dan retur. |

### 5.3 Admin

| No | Fitur | Rincian |
| --- | --- | --- |
| 15 | Dasbor admin | Jumlah barang per status, total fee, dan daftar tugas yang menunggu tindakan. |
| 16 | Antrean screening | Setujui atau tolak dengan alasan baku. |
| 17 | Penerimaan dan laporan uji | Checklist per kategori (RAM, SSD, GPU), unggah foto, tautan video YouTube, dan hasil lolos atau gagal. |
| 18 | Penetapan harga | Admin memasukkan harga tayang yang sudah disepakati dengan consignor lewat chat, dan mengubahnya atas permintaan consignor. |
| 19 | Ubah status barang | Hanya lewat transisi yang valid di tabel 4.2. |
| 20 | Pencatatan penjualan dan pengiriman | Verifikasi bukti transfer, isi resi, dan isi tanggal terima. |
| 21 | Proses klaim | Periksa klaim dan tentukan hasilnya. |
| 22 | Antrean pembayaran consignor | Barang berstatus Siap dibayar ke consignor, dengan pencatatan bukti transfer. |
| 23 | Pengaturan | Fee Rp10.000 dan 5%, ambang Rp200.000, ongkir dummy, dan percepatan jadwal untuk demo. |
| 24 | Manajemen pengguna | Lihat daftar consignor dan pembeli, nonaktifkan atau aktifkan kembali akun. Akun nonaktif tidak bisa masuk, data dan riwayatnya tetap tersimpan. Sistem menolak penonaktifan bila akun masih punya barang aktif atau pesanan berjalan. Admin bisa menonaktifkan paksa dengan catatan wajib, yang menyembunyikan barangnya dari katalog dan membatalkan pesanan yang belum dibayar. |

### 5.4 Sistem

| No | Fitur | Rincian |
| --- | --- | --- |
| 25 | Penjadwal otomatis | Penahanan 24 jam, pembuatan usulan penurunan harga, batas respons usulan, akhir masa penitipan, batas keputusan akhir masa, kedaluwarsa pengajuan yang resinya tidak diisi, dan status Siap dibayar ke consignor. |
| 26 | Perhitungan fee | Fee dan jumlah yang dibayar ke consignor. |
| 27 | Riwayat | Riwayat status, riwayat harga, dan jumlah pembeli yang melihat tiap barang. |
| 28 | Notifikasi | Email otomatis dan penanda di dasbor pada perubahan status penting, rinciannya di bagian 7. WhatsApp tidak masuk MVP. |

### 5.5 Catatan

- Barang di keranjang tidak ditahan. Penahanan 24 jam dimulai saat checkout. Satu pesanan boleh berisi barang dari beberapa consignor, tetapi status dan klaim dicatat per barang. Barang yang terjual lebih dulu keluar otomatis dari keranjang dengan pemberitahuan.

- Ongkir memakai nilai dummy tetap yang diatur admin, dan bisa diganti integrasi ekspedisi nanti.

- Foto uji diunggah ke website. Video uji disimpan di YouTube dan ditampilkan lewat tautan.

## 6. Aturan bisnis

Semua aturan bisnis di bawah ini diterapkan sistem tanpa tafsir manual, dan semua angkanya disimpan sebagai pengaturan (fitur 23), bukan ditulis tetap di kode. Aturan yang berkaitan dengan waktu ada di tabel 4.3.

### 6.1 Fee dan jumlah untuk consignor

- Harga jual sampai Rp200.000 dikenai fee Rp10.000. Harga jual di atas Rp200.000 dikenai fee 5%. Di Rp200.000 keduanya sama-sama Rp10.000.

- Consignor menerima harga jual dikurangi fee. Fee dihitung dari harga jual akhir, setelah penurunan harga.

- Consignor dibayar setelah syarat Siap dibayar ke consignor terpenuhi, sesuai 4.4.

| Harga jual | Fee | Diterima consignor |
| --- | --- | --- |
| Rp150.000 | Rp10.000 | Rp140.000 |
| Rp200.000 | Rp10.000 | Rp190.000 |
| Rp500.000 | Rp25.000 | Rp475.000 |
| Rp1.500.000 | Rp75.000 | Rp1.425.000 |

### 6.2 Ongkir dan kerusakan

| Kejadian | Ditanggung | Catatan |
| --- | --- | --- |
| Pengiriman consignor ke Hingo | Consignor | Consignor mengikuti panduan packing |
| Pengiriman Hingo ke pembeli | Pembeli | Nilai dummy di MVP |
| Pengiriman kembali ke consignor (ditolak, ditarik, tidak diperpanjang, cacat tersembunyi) | Consignor | Dibayar sebelum barang dikirim balik, nilai dummy di MVP |
| Penarikan barang sebelum masa habis (biaya Rp25.000) | Consignor | Dibayar lebih dulu, barang belum dikembalikan sebelum biaya lunas |
| Barang rusak saat dikirim ke Hingo | Consignor | Dibuktikan dengan video saat paket dibuka |
| Barang rusak saat dikirim ke pembeli | Hingo | Asuransi wajib untuk barang di atas Rp500.000, dibayar pembeli sebagai bagian dari ongkir. Nominal asuransi dummy di MVP. Bila barang rusak, statusnya Klaim: kesalahan pengiriman, dan Hingo mengurusnya dengan ekspedisi (rincian di luar MVP) |

### 6.3 Garansi, retur, dan klaim

- Pembeli mendapat garansi 7 hari sejak barang diterima. Garansi berlaku untuk barang yang mati atau tidak sesuai laporan uji, bukan untuk kerusakan akibat salah pasang atau pemakaian.

- Klaim wajib disertai bukti, yaitu video saat barang dibuka dan saat gagal berfungsi.

- Cacat tersembunyi menjadi tanggung jawab consignor: barang kembali ke consignor dan consignor tidak dibayar untuk penjualan itu.

- Cacat yang seharusnya terdeteksi, atau laporan uji yang tidak sesuai kondisi barang, menjadi tanggung jawab Hingo: pembeli menerima refund, barang disimpan, diuji ulang, dan dijual lagi.

- Barang yang rusak dalam perjalanan ke pembeli berstatus Klaim: kesalahan pengiriman. Hingo mengurusnya dengan ekspedisi, dan rinciannya tidak termasuk MVP.

### 6.4 Penerimaan dan verifikasi consignor

- KTP dan bukti kepemilikan wajib untuk semua barang. Bukti yang diterima: nota atau tangkapan layar pembelian, dus asli, atau foto serial number bersama kertas bertuliskan nama dan tanggal. Consignor juga menyatakan bahwa barang itu miliknya.

- Data identitas disimpan seperlunya dan aksesnya dibatasi.

- Laporan uji Hingo menjadi acuan final dan disetujui consignor di awal. Bila hasilnya lebih buruk dari klaim consignor, consignor memilih harga disesuaikan atau barang diambil kembali. Barang tetap berstatus Diterima, sedang diuji selama admin menghubungi consignor lewat chat, dan keputusannya dicatat admin.

- Identitas consignor tidak ditampilkan ke pembeli, dan komunikasi berjalan lewat Hingo.

- Consignor tidak boleh menjual barang yang sama di tempat lain selama masa penitipan. Penarikan sebelum masa habis dikenai biaya Rp25.000, dan barang baru dikembalikan setelah biaya itu dibayar.

### 6.5 Harga dan masa penitipan

- Consignor menetapkan harga minimum sejak awal. Usulan penurunan harga tidak boleh melewatinya, dan harga hanya berubah atas persetujuan consignor.

- Saat screening, admin memberi consignor referensi harga pasar bekas untuk barangnya.

- Jadwal usulan penurunan harga, masa penitipan 60 hari, dan perpanjangan 30 hari ada di tabel 4.3.

- Harga tayang awal disepakati consignor dan Hingo lewat chat, misalnya WhatsApp, lalu admin memasukkannya ke sistem. Harga yang diinginkan di formulir menjadi bahan awal pembicaraan.

## 7. Notifikasi

Notifikasi MVP berjalan lewat email otomatis dan status di dasbor. WhatsApp otomatis tidak dibuat karena tim tidak memakai API WhatsApp.

### 7.1 Kanal dan aturan

- Ada dua kanal: email otomatis lewat SMTP dan status di dasbor. Dasbor tetap menjadi sumber kebenaran.

- Nomor WhatsApp tetap wajib diisi saat daftar, sebagai kontak untuk admin menghubungi pengguna secara manual. Pengiriman WhatsApp otomatis ditulis sebagai rencana pengembangan setelah MVP.

- Template pesan berbahasa Indonesia, tetap per peristiwa, tertulis di kode, dan tidak bisa diubah admin.

- Kegagalan kirim email dicatat dan admin bisa melihatnya di dasbor. Tidak ada percobaan ulang otomatis.

- Notifikasi consignor dan pembeli berupa email dan penanda di dasbor, kecuali yang tertulis lain.

### 7.2 Notifikasi ke consignor

| Peristiwa | Isi pesan |
| --- | --- |
| Pengajuan diterima | Konfirmasi pengajuan masuk dan menunggu screening |
| Ditolak saat screening | Alasan penolakan |
| Disetujui, menunggu kiriman | Syarat penitipan, panduan packing, alamat pengiriman, dan batas isi resi 2x24 jam |
| Pengajuan kedaluwarsa | Resi tidak diisi dalam 2x24 jam, pengajuan bisa diajukan ulang |
| Lolos uji dan Tayang | Harga tayang dan tanggal mulai masa penitipan 60 hari |
| Ditolak setelah pengecekan | Alasan penolakan, nominal ongkir kembali, dan cara membayarnya |
| Barang terjual | Pemberitahuan penjualan. Pembayaran menunggu masa garansi lewat |
| Klaim diajukan pembeli | Klaim sedang diproses |
| Hasil klaim | Cacat tersembunyi: consignor tidak dibayar dan ongkir kembali berlaku. Kesalahan Hingo: barang dijual lagi |
| Consignor sudah dibayar | Harga jual, fee, dan jumlah yang ditransfer |
| Masa penitipan habis | Permintaan keputusan: perpanjang atau ambil kembali, dengan batas 3x24 jam. Tanpa respons, barang dianggap diambil kembali |
| Menunggu ongkir kembali | Nominal ongkir kembali (dan biaya penarikan Rp25.000 bila ditarik) serta cara membayarnya. Batas pembayaran 1x24 jam, dan barang dikirim setelah lunas |
| Dikembalikan ke consignor | Nomor resi pengiriman balik |
| Usulan penurunan harga | Pada hari yang dijadwalkan: harga usulan, jumlah pembeli yang melihat barang, dan batas respons 3 hari |
| Pengingat usulan penurunan harga | Satu kali sebelum batas respons habis. Tanpa jawaban, usulan dianggap ditolak dan harga tetap |
| Pengingat masa penitipan | 7 hari sebelum hari ke-60 (usulan) |

### 7.3 Notifikasi ke pembeli

| Peristiwa | Isi pesan |
| --- | --- |
| Pesanan dibuat | Rincian pesanan, nominal, rekening tujuan, dan batas waktu 24 jam |
| Pengingat penahanan | Sekitar jam ke-12, bila bukti transfer belum masuk |
| Penahanan berakhir | Pesanan dibatalkan otomatis dan barang kembali tayang |
| Pembayaran terverifikasi | Konfirmasi dan barang sedang dikemas |
| Dikirim ke pembeli | Nomor resi |
| Diterima pembeli | Garansi 7 hari berlaku sampai tanggal tertentu |
| Klaim diajukan | Konfirmasi klaim masuk |
| Hasil klaim | Klaim valid atau tidak valid, dan langkah berikutnya termasuk refund |
| Barang di keranjang terjual | Penanda di dasbor dan keranjang, tanpa email |

### 7.4 Notifikasi ke admin

Admin menerima email dan penanda di daftar tugas dasbor untuk empat peristiwa: pengajuan baru, bukti transfer masuk, klaim baru, dan barang Siap dibayar ke consignor.

## 8. Data utama dan keamanan data

Sistem menyimpan 16 kelompok data. Yang paling sensitif adalah KTP consignor, yang hanya bisa dibuka admin dan pemiliknya, dan dihapus 90 hari setelah barang berstatus akhir kecuali ada sengketa.

### 8.1 Data utama

| Data | Isi utama |
| --- | --- |
| Pengguna | Nama, email, kata sandi (hash), nomor WhatsApp, peran, status akun aktif atau nonaktif. Consignor menyimpan rekening pembayaran, pembeli menyimpan alamat |
| Barang | Consignor, kategori, merek, model, kondisi, lama pemakaian, kelengkapan, foto, harga yang diinginkan, harga minimum, harga tayang saat ini, status, tanggal pertama tayang, tanggal masa penitipan berakhir, jumlah pembeli yang melihat |
| Dokumen identitas dan kepemilikan | File KTP dan bukti kepemilikan per barang, serta pernyataan kepemilikan |
| Laporan uji | Barang, tanggal uji, hasil checklist per kategori, foto, tautan video YouTube, kelengkapan, dan hasil lolos atau gagal |
| Keranjang | Pembeli dan barang yang dimasukkan |
| Pesanan | Pembeli, alamat, ongkir, total, waktu checkout, batas penahanan, bukti transfer, dan nomor resi |
| Penjualan per barang | Pesanan, barang, harga jual saat itu, fee, jumlah untuk consignor, dan tanggal diterima |
| Klaim | Penjualan, alasan, bukti foto dan tautan video, hasil klaim, dan tanggal |
| Pembayaran ke consignor | Penjualan, jumlah, tanggal transfer, dan bukti transfer |
| Persetujuan syarat | Consignor, barang, dan waktu persetujuan |
| Pengembalian barang | Barang, alasan (ditolak, ditarik, tidak diperpanjang, atau cacat tersembunyi), ongkir kembali, biaya penarikan, bukti transfer consignor, dan nomor resi pengiriman balik |
| Usulan penurunan harga | Barang, harga usulan, tanggal usulan, batas respons, jawaban consignor, dan waktu jawaban |
| Riwayat status | Barang, status lama, status baru, pelaku, waktu, dan catatan |
| Riwayat harga | Barang, harga lama, harga baru, alasan, dan waktu |
| Pengaturan | Fee Rp10.000 dan 5%, ambang Rp200.000, ongkir dummy, batas asuransi Rp500.000, biaya penarikan Rp25.000, batas penahanan, jadwal usulan, batas isi resi dan batas keputusan akhir masa, percepatan jadwal untuk demo, dan daftar alasan penolakan |
| Log notifikasi | Penerima, peristiwa, waktu, dan hasil kirim email (terkirim atau gagal) |

### 8.2 Keamanan dan akses

- Satu akun bisa menjadi consignor dan pembeli sekaligus. Akun admin dibuat oleh tim, bukan lewat pendaftaran.

- Kata sandi disimpan dalam bentuk hash. Email tidak diverifikasi di MVP.

- Consignor hanya melihat barang dan pembayarannya sendiri. Pembeli hanya melihat pesanan dan klaimnya sendiri.

- KTP dan bukti kepemilikan disimpan di penyimpanan privat, tidak tampil di halaman publik, dan hanya bisa dibuka admin dan pemiliknya.

- Identitas consignor tidak ditampilkan ke pembeli.

- Foto uji, bukti transfer, dan foto klaim disimpan sebagai file di server. Video disimpan di YouTube dan dirujuk lewat tautan. Video disarankan berstatus tidak publik (unlisted).

- Riwayat status dan riwayat harga hanya bisa ditambah, tidak bisa diubah atau dihapus pengguna. Koreksi dilakukan lewat catatan baru.

- Akun yang dinonaktifkan tidak bisa masuk, tetapi data dan riwayatnya tetap tersimpan. Penonaktifan ditolak bila akun masih punya barang aktif atau pesanan berjalan, kecuali admin memilih nonaktifkan paksa dengan catatan wajib.

## 9. Kriteria selesai

MVP dianggap selesai bila 28 fitur memenuhi kriteria di 9.1 dan delapan skenario di 9.2 berjalan dari awal sampai akhir di website yang bisa dibuka.

### 9.1 Kriteria per fitur

| No | Fitur | Selesai bila |
| --- | --- | --- |
| 1 | Akun consignor | Pengguna bisa daftar, masuk, dan menyimpan rekening pembayaran di profil. |
| 2 | Formulir pengajuan | Pengajuan tersimpan lengkap dengan foto, dan status barang menjadi Diajukan. |
| 3 | Unggah KTP dan bukti kepemilikan | Pengajuan tidak bisa dikirim tanpa KTP dan bukti kepemilikan, dan file hanya bisa dibuka admin dan pemiliknya. |
| 4 | Persetujuan syarat penitipan | Consignor tidak bisa mengisi resi sebelum menyetujui syarat, dan persetujuan tercatat dengan waktu. |
| 5 | Dasbor consignor | Consignor melihat semua barangnya dengan status, riwayat harga, usulan yang menunggu jawaban, dan rincian pembayaran, dan tidak bisa melihat barang consignor lain. |
| 6 | Isi resi pengiriman | Consignor yang sudah menyetujui syarat bisa mengisi resi, dan status menjadi Dalam perjalanan ke Hingo. |
| 7 | Keputusan consignor atas barang | Consignor bisa menyetujui atau menolak usulan penurunan harga, memilih perpanjang atau ambil kembali, dan mengajukan penarikan, lalu mengunggah bukti transfer untuk ongkir kembali dan biaya penarikan. Status berubah sesuai tabel 4.2. |
| 8 | Akun pembeli | Pembeli bisa daftar dan masuk dengan email dan kata sandi. |
| 9 | Katalog | Katalog hanya menampilkan barang berstatus Tayang, dengan pencarian teks, filter kategori, rentang harga, dan kondisi, serta urutan harga atau terbaru. |
| 10 | Halaman produk | Halaman menampilkan foto, spesifikasi, harga, laporan uji, video YouTube yang bisa diputar, tanggal uji, kelengkapan, dan ketentuan garansi. Barang yang tidak berstatus Tayang menampilkan label Tidak tersedia. |
| 11 | Keranjang dan checkout | Pembeli bisa memasukkan barang ke keranjang lalu checkout dengan alamat, ongkir dummy, dan asuransi dummy otomatis untuk barang di atas Rp500.000. Setelah checkout barang berstatus Ditahan menunggu pembayaran dan tidak bisa dibeli orang lain. Barang yang sudah terjual keluar dari keranjang dengan pemberitahuan. |
| 12 | Pembayaran dan riwayat pesanan | Pembeli bisa mengunggah bukti transfer dan melihat status dan riwayat pesanannya. |
| 13 | Klaim garansi | Pembeli bisa mengajukan klaim dengan bukti hanya dalam 7 hari sejak tanggal diterima. Setelah itu formulir menolak. |
| 14 | Halaman kebijakan | Halaman garansi dan retur bisa dibuka dari menu dan dari halaman produk. |
| 15 | Dasbor admin | Dasbor menampilkan jumlah barang per status, total fee yang sama dengan jumlah fee per penjualan menurut 6.1, dan daftar tugas yang menunggu tindakan. |
| 16 | Antrean screening | Admin bisa menyetujui atau menolak pengajuan, dan penolakan wajib memilih alasan baku. |
| 17 | Penerimaan dan laporan uji | Admin bisa mengisi checklist sesuai kategori (RAM, SSD, GPU), mengunggah foto, menempel tautan video YouTube, dan menyimpan hasil lolos atau gagal. Barang tidak bisa Tayang tanpa laporan uji yang lolos. |
| 18 | Penetapan harga | Admin bisa menetapkan dan mengubah harga tayang. |
| 19 | Ubah status barang | Sistem menolak perubahan status yang tidak ada di tabel 4.2, dan perubahan oleh peran yang tidak berwenang. |
| 20 | Pencatatan penjualan dan pengiriman | Admin bisa memverifikasi bukti transfer, mengisi resi, dan mengisi tanggal terima. Tanggal terima memulai garansi 7 hari. |
| 21 | Proses klaim | Admin bisa menentukan hasil klaim (cacat tersembunyi, kesalahan Hingo, kesalahan pengiriman, atau tidak valid), dan status berubah sesuai tabel 4.2. |
| 22 | Antrean pembayaran consignor | Hanya barang berstatus Siap dibayar ke consignor yang muncul. Setelah bukti transfer dicatat, status menjadi Consignor sudah dibayar dengan jumlah sesuai 6.1. |
| 23 | Pengaturan | Admin bisa mengubah fee, ambang, ongkir dummy, alasan penolakan, dan percepatan jadwal untuk demo. Perubahan dipakai pada perhitungan berikutnya. |
| 24 | Manajemen pengguna | Admin bisa menonaktifkan dan mengaktifkan akun. Akun nonaktif tidak bisa masuk dan datanya tetap ada. Penonaktifan ditolak bila akun masih punya barang aktif atau pesanan berjalan, kecuali admin memilih nonaktifkan paksa dengan catatan, yang menyembunyikan barangnya dan membatalkan pesanan yang belum dibayar. |
| 25 | Penjadwal otomatis | Penahanan yang lewat 24 jam mengembalikan barang ke Tayang. Usulan penurunan dibuat pada hari yang dijadwalkan, dan usulan tanpa jawaban setelah 3 hari dianggap ditolak. Hari ke-60 mengubah status menjadi Masa penitipan habis, dan tanpa keputusan consignor dalam 3x24 jam barang menjadi Menunggu ongkir kembali. Pengajuan yang resinya tidak diisi dalam 2x24 jam setelah disetujui menjadi Ditolak saat screening. Barang menjadi Siap dibayar ke consignor saat masa garansi lewat tanpa klaim. |
| 26 | Perhitungan fee | Fee dan jumlah untuk consignor sama dengan tabel contoh di 6.1 untuk harga Rp150.000, Rp200.000, Rp500.000, dan Rp1.500.000. |
| 27 | Riwayat | Setiap perubahan status, harga, dan usulan tercatat dengan waktu dan pelaku serta tidak bisa diubah. Jumlah pembeli yang melihat barang bertambah saat halaman produk dibuka. |
| 28 | Notifikasi | Email terkirim pada peristiwa di 7.2 sampai 7.4, kegagalan tercatat di log yang bisa dilihat admin, dan penanda muncul di dasbor. |

### 9.2 Skenario uji menyeluruh

- Jalur lancar: consignor mengajukan barang, admin menyetujui, consignor mengisi resi, admin menguji dan menayangkan, pembeli checkout dan membayar, admin memverifikasi dan mengirim, barang diterima, masa garansi lewat, lalu consignor dibayar dengan jumlah yang benar.

- Penolakan: satu pengajuan ditolak saat screening, satu pengajuan kedaluwarsa karena resi tidak diisi dalam 2x24 jam, dan satu barang ditolak setelah pengecekan sampai berstatus Dikembalikan ke consignor.

- Penahanan: pembeli tidak membayar dan barang kembali Tayang setelah 24 jam. Dua pembeli melakukan checkout untuk barang yang sama, dan hanya yang pertama berhasil.

- Klaim: satu klaim berakhir sebagai cacat tersembunyi (consignor tidak dibayar, barang kembali ke consignor), satu lagi sebagai kesalahan Hingo (refund, barang tayang lagi).

- Penurunan harga: satu usulan disetujui (harga berubah), satu usulan ditolak atau tanpa jawaban (harga tetap).

- Akhir masa: barang mencapai hari ke-60, lalu consignor memilih perpanjang pada satu barang dan ambil kembali pada barang lain, dan satu barang lagi tanpa respons selama 3x24 jam menjadi Menunggu ongkir kembali.

- Akses: consignor tidak bisa melihat barang consignor lain, dan pembeli tidak bisa membuka KTP.

- Pengembalian: satu barang ditarik consignor dengan biaya Rp25.000 dan ongkir dibayar lebih dulu. Satu barang ditolak, ongkirnya tidak dibayar dalam 1x24 jam sehingga tetap disimpan dan menampilkan Tidak tersedia, lalu dikirim balik setelah consignor membayar.

Skenario 2, 3, 5, 6, dan 8 bergantung pada waktu. Agar bisa didemokan, jadwal bisa dipercepat lewat pengaturan (fitur 23).