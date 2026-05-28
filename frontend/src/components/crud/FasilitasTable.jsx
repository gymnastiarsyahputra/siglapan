import { useEffect, useState } from 'react'
import { getFasilitas, createFasilitas, updateFasilitas, deleteFasilitas } from '../../api/api'

// POST/PUT body: { id_user, nama_fasilitas, jenis_fasilitas, x_coord, y_coord }
const emptyForm = {
  id_user: 1,
  nama_fasilitas: '',
  jenis_fasilitas: '',
  x_coord: '',
  y_coord: ''
}

const JENIS_OPTIONS = [
  'Gudang', 'Irigasi', 'Posko', 'Kesehatan',
  'Alat Pertanian', 'Keamanan', 'Pengolahan',
  'Koperasi', 'Sensor', 'Pasar', 'Lainnya'
]

export default function FasilitasTable() {
  const [data, setData] = useState([])
  const [form, setForm] = useState(emptyForm)
  // id field dari backend: id_fasilitas
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  function load() {
    // GET /api/fasilitas/ → GeoJSON FeatureCollection
    // properties: { id_fasilitas, nama_fasilitas, jenis_fasilitas }
    getFasilitas()
      .then(res => setData(res.data?.features || []))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function handleSubmit() {
    if (!form.nama_fasilitas || !form.jenis_fasilitas || !form.x_coord || !form.y_coord) {
      return alert('Semua field wajib diisi')
    }
    setLoading(true)
    try {
      const payload = {
        id_user: Number(form.id_user) || 1,
        nama_fasilitas: form.nama_fasilitas,
        jenis_fasilitas: form.jenis_fasilitas,
        x_coord: parseFloat(form.x_coord),
        y_coord: parseFloat(form.y_coord),
      }
      if (editId) {
        await updateFasilitas(editId, payload)
      } else {
        await createFasilitas(payload)
      }
      setForm(emptyForm)
      setEditId(null)
      load()
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus fasilitas ini?')) return
    try {
      await deleteFasilitas(id)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menghapus')
    }
  }

  function handleEdit(f) {
    // f.properties: { id_fasilitas, nama_fasilitas, jenis_fasilitas }
    // f.geometry.coordinates: [lng, lat] dalam WGS84 (sudah dikonversi oleh ST_AsGeoJSON)
    const p = f.properties || {}
    setEditId(p.id_fasilitas)
    setForm({
      id_user: 1,
      nama_fasilitas: p.nama_fasilitas || '',
      jenis_fasilitas: p.jenis_fasilitas || '',
      // Koordinat dari GeoJSON adalah WGS84, tapi backend minta UTM 32748
      // Saat edit, kosongkan dan minta user isi ulang koordinat UTM
      x_coord: '',
      y_coord: '',
    })
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-green-800 mb-2">🏗️ Manajemen Fasilitas</h2>
      <p className="text-xs text-yellow-700 bg-yellow-50 rounded p-2 mb-4">
        ⚠️ Koordinat X (Easting) dan Y (Northing) menggunakan sistem UTM EPSG:32748.<br />
        Contoh wilayah Lampung: X ≈ 420000–500000, Y ≈ 9380000–9460000
      </p>

      {/* Form */}
      <div className="bg-green-50 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Nama Fasilitas *</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-40"
            placeholder="contoh: Gudang Utama"
            value={form.nama_fasilitas}
            onChange={e => setForm(f => ({ ...f, nama_fasilitas: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Jenis Fasilitas *</label>
          <select
            className="border rounded px-3 py-1.5 text-sm w-36"
            value={form.jenis_fasilitas}
            onChange={e => setForm(f => ({ ...f, jenis_fasilitas: e.target.value }))}
          >
            <option value="">-- Pilih Jenis --</option>
            {JENIS_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            Koordinat X / Easting (UTM) * {editId && <span className="text-orange-500">— isi ulang</span>}
          </label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-36 font-mono"
            placeholder="contoh: 456789"
            type="number"
            value={form.x_coord}
            onChange={e => setForm(f => ({ ...f, x_coord: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            Koordinat Y / Northing (UTM) * {editId && <span className="text-orange-500">— isi ulang</span>}
          </label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-36 font-mono"
            placeholder="contoh: 9420000"
            type="number"
            value={form.y_coord}
            onChange={e => setForm(f => ({ ...f, y_coord: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {editId ? '💾 Update' : '➕ Tambah'}
          </button>
          {editId && (
            <button
              onClick={() => { setEditId(null); setForm(emptyForm) }}
              className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Nama Fasilitas</th>
              <th className="px-3 py-2 text-left">Jenis</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-400">Belum ada data fasilitas</td></tr>
            )}
            {data.map((f, i) => {
              const p = f.properties || {}
              return (
                <tr key={p.id_fasilitas} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2">{p.id_fasilitas}</td>
                  <td className="px-3 py-2 font-medium">{p.nama_fasilitas}</td>
                  <td className="px-3 py-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      {p.jenis_fasilitas || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center space-x-2">
                    <button onClick={() => handleEdit(f)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(p.id_fasilitas)} className="text-red-600 hover:underline text-xs">Hapus</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
