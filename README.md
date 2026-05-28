# 🌾 SIGLAPAN — Sistem Informasi Lahan Pertanian

Aplikasi **WebGIS** untuk mengelola dan memvisualisasikan data lahan pertanian berbasis peta interaktif. Dibangun dengan **FastAPI + PostGIS** di backend dan **ReactJS + Leaflet** di frontend.

> Proyek Akhir Mata Kuliah Sistem Informasi Geografis — Program Studi Teknik Informatika, ITERA — Semester Genap 2025/2026

---

## 📸 Preview

![Peta SIGLAPAN](frontend/src/assets/hero.png)

---

## 🧱 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | ReactJS, Leaflet, Tailwind CSS, Axios |
| Backend | Python, FastAPI, Pydantic |
| Database | PostgreSQL 18 + PostGIS |
| Tools | pgAdmin, Vite, Uvicorn |

---

## 📁 Struktur Folder

```
siglapan/
├── backend/                  ← FastAPI + PostGIS
│   ├── main.py               ← Entry point API
│   ├── database.py           ← Konfigurasi koneksi DB (tidak di-commit)
│   ├── database.example.py   ← Template konfigurasi DB
│   ├── schemas.py            ← Pydantic models
│   ├── import_data.py        ← Script import GeoJSON ke database
│   ├── schema_final.sql      ← SQL schema lengkap (tabel + index + trigger)
│   ├── pertanian.geojson     ← Data lahan pertanian (4.978 fitur)
│   └── routers/
│       ├── tanaman.py        ← CRUD jenis tanaman
│       ├── lahan.py          ← CRUD data lahan
│       ├── fasilitas.py      ← CRUD fasilitas pertanian
│       ├── spasial.py        ← Query spasial (ST_Intersects, ST_DWithin)
│       └── statistik.py      ← Statistik luas per tanaman
│
└── frontend/                 ← ReactJS + Leaflet
    ├── src/
    │   ├── api/api.js        ← Axios API client
    │   ├── components/
    │   │   ├── MapView.jsx         ← Peta interaktif utama
    │   │   ├── SpatialTools.jsx    ← Panel analisis spasial
    │   │   ├── StatistikPanel.jsx  ← Chart & tabel statistik
    │   │   └── crud/               ← Form CRUD tiap entitas
    │   └── pages/
    │       ├── HomePage.jsx        ← Halaman peta
    │       └── ManajemenPage.jsx   ← Halaman manajemen data
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Prasyarat

Pastikan sudah terinstall di komputer kamu:

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/) dengan **ekstensi PostGIS**
- [pgAdmin](https://www.pgadmin.org/) _(opsional, untuk GUI database)_

---

## 🚀 Cara Menjalankan

### 1. Clone repo

```bash
git clone https://github.com/gymnastiarsyahputra/siglapan.git
cd siglapan
```

---

### 2. Setup Database

**a. Pastikan PostgreSQL sedang berjalan**

Windows: buka `services.msc` → cari `postgresql` → klik **Start**

**b. Buat database baru di pgAdmin**

Klik kanan **Databases** → **Create** → **Database** → beri nama `siglapan`

**c. Aktifkan ekstensi PostGIS**

Buka Query Tool di pgAdmin, jalankan:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**d. Jalankan schema SQL**

Buka file `backend/schema_final.sql`, copy semua isinya, paste di Query Tool → jalankan.

**e. Insert user admin** _(wajib sebelum import data)_

```sql
INSERT INTO users (nama_lengkap, username, email, password, role)
VALUES ('Admin SIGLAPAN', 'admin', 'admin@siglapan.id', 'admin123', 'admin');
```

---

### 3. Setup Backend

**a. Masuk ke folder backend**

```bash
cd backend
```

**b. Install dependencies**

```bash
pip install fastapi uvicorn psycopg2-binary pydantic
```

**c. Buat file konfigurasi database**

```bash
cp database.example.py database.py
```

Lalu buka `database.py` dan sesuaikan dengan kredensial PostgreSQL kamu:

```python
DB_HOST = "localhost"
DB_NAME = "siglapan"
DB_USER = "postgres"
DB_PASS = "ISI_PASSWORD_KAMU"   # ← ganti ini
DB_PORT = "5432"                # ← sesuaikan port (cek di pgAdmin → Properties)
```

**d. Jalankan backend**

```bash
uvicorn main:app --reload
```

Backend berjalan di → **http://localhost:8000**
Dokumentasi API (Swagger) → **http://localhost:8000/docs**

**e. Import data lahan** _(jalankan sekali saja)_

Buka terminal baru di folder `backend`:

```bash
python import_data.py
```

Output sukses:
```
Ditemukan 5051 data. Memulai injeksi WKT ke database...
MANTAP! Proses selesai. 4978 data berhasil masuk, 73 data dilewati.
```

---

### 4. Setup Frontend

**a. Masuk ke folder frontend**

```bash
cd ../frontend
```

**b. Install dependencies**

```bash
npm install
```

**c. Jalankan frontend**

```bash
npm run dev
```

Frontend berjalan di → **http://localhost:5173**

---

## 🗺️ Fitur Aplikasi

| Fitur | Deskripsi |
|---|---|
| 🗺️ Peta Interaktif | Visualisasi 4.978 polygon lahan pertanian di wilayah Lampung |
| 🎨 Warna per Tanaman | Setiap jenis tanaman ditampilkan dengan warna berbeda |
| 🖱️ Popup Info Lahan | Klik polygon → tampil nama lahan, pemilik, luas, jenis tanaman |
| 📍 Marker Fasilitas | Lokasi fasilitas pertanian (gudang, irigasi, posko, dll) |
| 🔍 Filter Lahan | Filter berdasarkan jenis tanaman atau nama pemilik |
| 📌 Cek Lokasi | Klik titik di peta → cek lahan apa yang ada di sana (ST_Intersects) |
| 📏 Fasilitas Terdekat | Cari fasilitas dalam radius tertentu dari lahan (ST_DWithin) |
| 📊 Statistik | Bar chart & tabel luas lahan per jenis tanaman |
| ✏️ CRUD Data | Tambah, edit, hapus data Tanaman, Lahan, dan Fasilitas |

---

## 🔌 Daftar Endpoint API

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/tanaman/` | List semua jenis tanaman |
| POST | `/api/tanaman/` | Tambah tanaman baru |
| PUT | `/api/tanaman/{id}` | Update tanaman |
| DELETE | `/api/tanaman/{id}` | Hapus tanaman |
| GET | `/api/lahan/` | List lahan (GeoJSON), support filter |
| POST | `/api/lahan/` | Tambah lahan baru |
| PUT | `/api/lahan/{id}` | Update lahan |
| DELETE | `/api/lahan/{id}` | Hapus lahan |
| GET | `/api/fasilitas/` | List fasilitas (GeoJSON) |
| POST | `/api/fasilitas/` | Tambah fasilitas baru |
| PUT | `/api/fasilitas/{id}` | Update fasilitas |
| DELETE | `/api/fasilitas/{id}` | Hapus fasilitas |
| GET | `/api/spasial/cek-lokasi` | Cek lahan pada koordinat tertentu (ST_Intersects) |
| GET | `/api/spasial/fasilitas-terdekat` | Cari fasilitas dalam radius dari lahan (ST_DWithin) |
| GET | `/api/statistik/` | Statistik luas lahan per jenis tanaman |

---

## ❗ Troubleshooting

**Connection refused ke database**
→ Pastikan service PostgreSQL sedang berjalan via `services.msc`

**Port salah**
→ Cek port di pgAdmin: klik kanan server PostgreSQL → Properties → Connection → lihat kolom Port. Sesuaikan di `database.py`

**PostGIS tidak ditemukan**
→ Install via Stack Builder: buka aplikasi Stack Builder dari Start Menu → pilih versi PostgreSQL → centang PostGIS

**`import_data.py` error `database not found`**
→ Pastikan kamu menjalankan script dari dalam folder `backend`, bukan dari root folder

---

## 👥 Tim Pengembang

| Nama | NIM | Peran |
|---|---|---|
| _(isi nama anggota)_ | _(isi NIM)_ | Backend & Database |
| _(isi nama anggota)_ | _(isi NIM)_ | Frontend & UI |
| _(isi nama anggota)_ | _(isi NIM)_ | Integrasi & Testing |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik — Mata Kuliah Sistem Informasi Geografis, ITERA 2025/2026.
