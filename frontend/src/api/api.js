import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE_URL })

// ── TANAMAN ──────────────────────────────────────────────────
// GET   → array of { id_tanaman, nama_tanaman, deskripsi }
// POST  → body: { nama_tanaman, deskripsi }
// PUT   → body: { nama_tanaman, deskripsi }
export const getTanaman = () => api.get('/tanaman/')
export const createTanaman = (data) => api.post('/tanaman/', data)
export const updateTanaman = (id, data) => api.put(`/tanaman/${id}`, data)
export const deleteTanaman = (id) => api.delete(`/tanaman/${id}`)

// ── LAHAN ─────────────────────────────────────────────────────
// GET   → GeoJSON FeatureCollection
//         properties: { id_lahan, nama_pemilik, nama_lahan, luas_lahan, keterangan, nama_tanaman }
// POST  → body: { id_tanaman, id_user, nama_pemilik, nama_lahan, keterangan, geom_wkt }
// PUT   → body: { id_tanaman, id_user, nama_pemilik, nama_lahan, keterangan, geom_wkt }
// filter params: jenis_tanaman (int = id_tanaman), pemilik (string)
export const getLahan = (params = {}) => api.get('/lahan/', { params })
export const createLahan = (data) => api.post('/lahan/', data)
export const updateLahan = (id, data) => api.put(`/lahan/${id}`, data)
export const deleteLahan = (id) => api.delete(`/lahan/${id}`)

// ── FASILITAS ─────────────────────────────────────────────────
// GET   → GeoJSON FeatureCollection
//         properties: { id_fasilitas, nama_fasilitas, jenis_fasilitas }
// POST  → body: { id_user, nama_fasilitas, jenis_fasilitas, x_coord, y_coord }
// PUT   → body: { id_user, nama_fasilitas, jenis_fasilitas, x_coord, y_coord }
export const getFasilitas = () => api.get('/fasilitas/')
export const createFasilitas = (data) => api.post('/fasilitas/', data)
export const updateFasilitas = (id, data) => api.put(`/fasilitas/${id}`, data)
export const deleteFasilitas = (id) => api.delete(`/fasilitas/${id}`)

// ── SPASIAL ───────────────────────────────────────────────────
// cekLokasi    → params: x (lng), y (lat) — koordinat WGS84 dari klik peta
// fasilitasTerdekat → params: id_lahan (int), radius (float, default 500)
export const cekLokasi = (x, y) =>
  api.get('/spasial/cek-lokasi', { params: { x, y } })
export const fasilitasTerdekat = (id_lahan, radius) =>
  api.get('/spasial/fasilitas-terdekat', { params: { id_lahan, radius } })

// ── STATISTIK ─────────────────────────────────────────────────
// GET → array of { nama_tanaman, jumlah_persil, total_luas }
export const getStatistik = () => api.get('/statistik/')
