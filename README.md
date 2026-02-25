# Sambung Ayat — Latihan Hafalan Al-Qur'an

Aplikasi latihan hafalan Al‑Qur’an berbasis web dengan mekanik “sambung ayat”. Fokus pada pengalaman ibadah: desain minimalis, tanpa distraksi, dengan umpan balik instan dan progress yang tercatat.

## Fitur Utama

- Latihan sambung ayat interaktif (drag and drop ke area jawaban)
- Umpan balik instan: benar/salah, ayat kelanjutan yang benar, efek konfeti saat sesi selesai
- Poin, combo, streak, rekap sesi, dan leaderboard 10 besar
- Tilawah audio per ayat: tombol Play/Stop (ikon dan warna dinamis)
- Pemilihan mode latihan: satu juz penuh, per surah, atau rentang surah
- Pengaturan sesi: jumlah soal, konfigurasi juz/surah
- Bahasa Indonesia dan English
- Tema terang/gelap
- Akun pengguna:
  - Login via Supabase (Google)
  - Guest mode otomatis; saat login, progress guest digabungkan ke akun
  - Pengaturan profil: ubah display name, hapus akun (logout otomatis)

## Cara Bermain

1. Masuk ke Beranda dan pilih Mulai Latihan
2. Pilih mode (Juz penuh / Per Surah / Rentang) dan jumlah soal
3. Baca ayat yang ditampilkan di bagian atas
4. Seret pilihan ayat yang menurut Anda merupakan kelanjutan yang benar ke area “Tarik ayat yang benar ke sini”
5. Sistem memvalidasi:
   - Jika benar: poin bertambah, combo/streak dihitung, suara “benar” diputar
   - Jika salah: combo direset, suara “salah” diputar, ditampilkan ayat yang benar
6. Putar/hentikan tilawah dengan tombol di bawah ayat:
   - Normal: tombol hijau
   - Sedang memutar: tombol merah
7. Sesi berakhir setelah jumlah soal terpenuhi; Anda akan melihat ringkasan poin, streak, dan combo. Lanjutkan ke sesi baru atau lihat Leaderboard.

## Arsitektur Singkat

- Next.js App Router (16.x) + React 19
- Tailwind CSS v4 untuk styling
- DnD Kit untuk drag-and-drop
- Supabase (SSR + client) untuk autentikasi dan sesi
- Prisma ORM + PostgreSQL untuk persistensi data

## Model Data (ringkas)

- User: progress agregat (poin, streak, dll.), relasi ke Sessions dan Answers
- Session: progres per sesi (total pertanyaan, combo, poin, batas pertanyaan)
- Answer: hasil per soal (benar/salah) dengan timestamp


## Teknologi

- Next.js, React, Tailwind CSS, DnD Kit
- Supabase (SSR + client)
- Prisma + PostgreSQL
- Lucide Icons

Kontribusi ide dan perbaikan sangat disambut. Semoga aplikasi ini membantu memperkuat hafalan Al‑Qur’an.*** End Patch*** }```
*** End Patch
