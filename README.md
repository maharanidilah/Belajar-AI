# FinFlow - Personal Finance Tracker

A premium, interactive, and client-side single-page web application designed to help users track, manage, and visualize their daily incomes and expenses.

## Fitur Utama
1. **Financial Dashboard**: Perhitungan sisa saldo, total pemasukan, dan total pengeluaran secara real-time dengan status indikator kesehatan keuangan.
2. **Visualisasi Chart**: Diagram lingkaran interaktif (Doughnut Chart) menggunakan **Chart.js** untuk melihat persentase pengeluaran per kategori.
3. **Pencatatan Transaksi**: Pengisian cepat dengan kategori yang disesuaikan secara dinamis, input tanggal, catatan, dan format angka Rupiah otomatis saat mengetik.
4. **Riwayat & Pencarian**: Daftar transaksi terurut yang bisa difilter berdasarkan tipe, kategori, atau dicari lewat kata kunci pada catatan.
5. **Ekspor & Impor JSON**: Cadangkan data finansial Anda ke file `.json` lokal atau pulihkan data lama dengan mudah.
6. **Desain Premium**: Tampilan futuristik bertema gelap (Dark Mode) dengan gaya glassmorphic, micro-animations, dan layout yang sepenuhnya responsif (nyaman dibuka di HP maupun desktop).

## Cara Menjalankan Aplikasi
1. Buka folder ini di File Explorer Anda.
2. Klik dua kali pada file [index.html](file:///d:/SEMESTER%204/AI/Belajar%20Ai/index.html) untuk langsung membukanya di browser.
3. (Opsional) Jika Anda ingin menjalankan local server, jalankan perintah `python -m http.server 8000` di terminal Anda pada direktori ini, lalu buka browser dan akses `http://localhost:8000`.

## Struktur Kode Proyek
- [index.html](file:///d:/SEMESTER%204/AI/Belajar%20Ai/index.html) - Struktur halaman utama, modal, form, dan referensi CDN.
- [style.css](file:///d:/SEMESTER%204/AI/Belajar%20Ai/style.css) - Desain CSS murni bertema gelap, glassmorphic cards, animasi transisi, dan grid responsif.
- [app.js](file:///d:/SEMESTER%204/AI/Belajar%20Ai/app.js) - Logika penyimpanan LocalStorage, kalkulasi saldo, dynamic dropdowns, filter list, dan setup Chart.js.
