

# Akselera.Tech Internal Chat

Aplikasi internal chat berbasis web untuk komunikasi 1-on-1 antar pengguna yang terdaftar.

## Tech Stack & Infrastruktur


| Next.js 16    | Framework aplikasi web   | Mendukung frontend dan API dalam satu project serta routing berbasis App Router |
| TypeScript    | Bahasa pemrograman       | Memberikan type checking sehingga kode lebih aman dan mudah dipelihara |
| Tailwind CSS  | Styling UI               | Memudahkan pembuatan UI yang konsisten dan responsive |
| Prisma ORM    | Database ORM             | Mempermudah pengelolaan database, query, dan relasi antar tabel |
| MySQL         | Database                 | Digunakan untuk menyimpan data pengguna, percakapan, dan pesan |
| bcryptjs      | Password hashing         | Mengamankan password pengguna sebelum disimpan ke database |
| Laragon       | Local development        | Menyediakan environment lokal untuk menjalankan aplikasi dan MySQL |
| GitHub        | Version control          | Menyimpan source code dan mengelola perubahan project |

## Fitur

- Registrasi akun
- Login dan logout
- Proteksi halaman chat berdasarkan autentikasi
- Membuat percakapan 1-on-1
- Mengirim pesan
- Menampilkan daftar percakapan
- Unread message count
- Status pesan terbaca
- Polling pesan secara berkala
- Search conversation
- Responsive layout
- Dark/light mode

## Menjalankan Secara Lokal

### 1. Clone repository

```bash
git clone <repository-url>
cd akselera-chat
````

### 2. Install dependency

```bash
npm install
```

### 3. Konfigurasi environment

Buat file `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/akselera_chat"
```

Sesuaikan username, password, port, dan nama database dengan konfigurasi MySQL lokal.

### 4. Jalankan migration Prisma

```bash
npx prisma migrate dev
```

### 5. Jalankan development server

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```text
http://localhost:3000
```

Jika menggunakan konfigurasi Laragon dengan virtual host, URL dapat disesuaikan dengan konfigurasi lokal.

## Struktur Database

Database menggunakan tiga tabel utama:

### User

Menyimpan data pengguna aplikasi.

| Field        | Keterangan                  |
| ------------ | --------------------------- |
| id           | ID pengguna                 |
| name         | Nama pengguna               |
| email        | Email unik pengguna         |
| passwordHash | Password yang telah di-hash |
| createdAt    | Waktu pembuatan akun        |
| updatedAt    | Waktu perubahan data        |

### Conversation

Menyimpan percakapan 1-on-1 antar dua pengguna.

| Field     | Keterangan               |
| --------- | ------------------------ |
| id        | ID percakapan            |
| user1Id   | ID pengguna pertama      |
| user2Id   | ID pengguna kedua        |
| createdAt | Waktu percakapan dibuat  |
| updatedAt | Waktu perubahan terakhir |

Relasi:

```text
User 1 ──────── Conversation ──────── User 2
```

### Message

Menyimpan pesan dalam sebuah percakapan.

| Field          | Keterangan         |
| -------------- | ------------------ |
| id             | ID pesan           |
| conversationId | ID percakapan      |
| senderId       | ID pengirim        |
| content        | Isi pesan          |
| createdAt      | Waktu pesan dibuat |
| readAt         | Waktu pesan dibaca |

Relasi:

```text
Conversation 1 ──────── * Message
User 1 ──────────────── * Message
```

## AI Tools

Dalam proses pengembangan project, AI digunakan sebagai alat bantu untuk:

* Membantu penyusunan struktur dan arsitektur aplikasi.
* Membantu implementasi komponen dan fitur menggunakan Next.js dan TypeScript.
* Membantu debugging dan analisis error.
* Membantu penyusunan query serta struktur Prisma.
* Membantu perbaikan UI dan responsive design.
* Membantu dokumentasi project.

AI yang digunakan:

* ChatGPT

AI digunakan sebagai alat bantu pengembangan, sedangkan implementasi dan pengujian aplikasi dilakukan secara langsung pada project.

## Hal yang Belum Selesai

Beberapa bagian yang masih dapat dikembangkan:

* Implementasi komunikasi real-time menggunakan WebSocket atau teknologi realtime lainnya.
* Notifikasi pesan baru secara real-time.
* Deployment production.
* Pengembangan fitur tambahan seperti group chat, attachment file, dan profil pengguna.

Saat ini pembaruan pesan menggunakan mekanisme polling secara berkala.

belum menggunakan WebSocket**. `ChatRoom.tsx` masih melakukan polling setiap 3 detik:

```text
loadMessages()
     ↓
3 detik
     ↓
loadMessages()
     ↓
3 detik
     ↓
loadMessages()
````

