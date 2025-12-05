# Proyek Akhir Praktikum Keamanan Jaringan

## Employee Portal ✨
Web sederhana untuk autentikasi, upload dokumen, dan manajemen kata sandi.

## Table of Contents
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Mitigasi & Remediasi](#mitigasi--remediasi)
- [Getting Started](#getting-started)
- [Default Credentials](#default-credentials)
- [Project Structure](#project-structure)
- [Catatan Keamanan & Batasan](#catatan-keamanan--batasan)
- [Developer](#developer)

## Tech Stack
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-templates-5c5c5c)
![Multer](https://img.shields.io/badge/Multer-file_upload-00a98f)
![express-session](https://img.shields.io/badge/express--session-sessions-0052cc)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952b3?logo=bootstrap&logoColor=white)

## Features 🚀
- Login dan logout berbasis sesi.
- Dashboard ringkas untuk akses fitur.
- Upload dokumen dengan whitelist MIME (JPEG, PNG, PDF) dan penamaan file unik dengan timestamp.
- Daftar file yang sudah di-upload ditampilkan di halaman Upload.
- Form ganti password dengan validasi current/new/confirm dan proteksi CSRF.

## Mitigasi & Remediasi 🔒
- **Proteksi CSRF:** Token CSRF wajib untuk aksi ganti password (`_csrf`), divalidasi terhadap token sesi.
- **Penguatan Cookie Sesi:** `httpOnly`, `sameSite=strict`, dan `maxAge` 15 menit untuk menekan risiko pencurian sesi.
- **Validasi Upload Ketat:** Whitelist MIME (JPEG/PNG/PDF) dan penamaan file unik untuk mencegah eksekusi file tak diizinkan serta konflik nama.
- **Validasi Password:** Wajib isi current password, new ≠ current, dan konfirmasi harus cocok sebelum perubahan diterapkan.

## Getting Started
1. Install dependencies: `npm install`
2. Jalankan aplikasi: `npm start`
3. Buka browser: http://localhost:3000

## Default Credentials
- Username: `admin`
- Password: `admin123`

## Project Structure
```
project/
├── app.js                   # Main app logic (routes, session, upload, CSRF)
├── package.json             # Dependencies & scripts
├── /views                   # EJS templates (login, dashboard, upload, change-password)
└── /public
    └── /uploads             # Storage untuk file yang di-upload
```

## Catatan Keamanan & Batasan
- Data user disimpan in-memory; restart server akan mereset password ke default.
- Upload hanya menerima JPEG/PNG/PDF; file disajikan publik via `/uploads/<nama-file>`.
- `secure` cookie masih `false` agar mudah diuji di HTTP lokal; set ke `true` untuk production dengan HTTPS.
- Tidak ada rate limiting/brute-force protection bawaan; pasang middleware tambahan jika diperlukan.

## Developer
**Kelompok 33** - Laura Fawzia Sambowo (23062601345)


<div align="center"> 
<em>© 2025/2026 Proyek Akhir Praktikum Keamanan Jaringan — Kelompok23</em>
</div>
