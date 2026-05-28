import { useEffect, useState } from 'react'
import { getLahan, createLahan, updateLahan, deleteLahan, getTanaman } from '../../api/api'

// POST/PUT body: { id_tanaman, id_user, nama_pemilik, nama_lahan, keterangan, geom_wkt }
const emptyForm = {
  id_tanaman: '',
  id_user: 1,
  nama_pemilik: '',
  nama_lahan: '',
  keterangan: '',
  geom_wkt: ''
}

export default function LahanTable() {
  const [data, setData] = useState([])
  const [tanamanList, setTanamanList] = useState([])
  const [form, setForm] = useState(emptyForm)
  // id field dari backend: id_lahan
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  function load() {
    // GET /api/lahan/ → GeoJSON FeatureCollection
    // properties: { id_lahan, nama_pemilik, nama_lahan, luas_lahan, keterangan, nama_tanaman }
    getLahan()
      .then(res => setData(res.data?.features || []))
      .catch(() => {})
  }

  useEffect(() => {
    load()
    // GET /api/tanaman/ → array of { id_tanaman, nama_tanaman, deskripsi }
    getTanaman().then(res => setTanamanList(res.data)).catch(() => {})
  }, [])

  async function handleSubmit() {
    if (!form.nama_pemilik || !form.id_tanaman) {
      return alert('Nama pemilik dan jenis tanaman wajib diisi')
    }
    if (!editId && !form.geom_wkt) {
      return alert('Geometri WKT wajib diisi untuk lahan baru')
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        id_tanaman: Number(form.id_tanaman),
        id_user: Number(form.id_user) || 1,
      }
      if (editId) {
        await updateLahan(editId, payload)
      } else {
        await createLahan(payload)
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
    if (!confirm('Hapus lahan ini?')) return
    try {
      await deleteLahan(id)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menghapus')
    }
  }

  function handleEdit(f) {
    // f.properties: { id_lahan, nama_pemilik, nama_lahan, luas_lahan, keterangan, nama_tanaman }
    const p = f.properties || {}
    // Cari id_tanaman berdasarkan nama_tanaman
    const tanaman = tanamanList.find(t => t.nama_tanaman === p.nama_tanaman)
    setEditId(p.id_lahan)
    setForm({
      id_tanaman: tanaman?.id_tanaman || '',
      id_user: 1,
      nama_pemilik: p.nama_pemilik || '',
      nama_lahan: p.nama_lahan || '',
      keterangan: p.keterangan || '',
      geom_wkt: '', // kosongkan — isi ulang hanya jika ingin update geometri
    })
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-green-800 mb-2">🗺️ Manajemen Lahan</h2>
      <p className="text-xs text-yellow-700 bg-yellow-50 rounded p-2 mb-4">
        ⚠️ Geometri WKT menggunakan koordinat UTM EPSG:32748.<br />
        Format: <code>POLYGON((x1 y1, x2 y2, x3 y3, x1 y1))</code><br />
        Saat edit: kosongkan WKT jika tidak ingin mengubah geometri, isi jika ingin menggantinya.
      </p>

      {/* Form */}
      <div className="bg-green-50 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Nama Pemilik *</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-40"
            placeholder="Nama pemilik"
            value={form.nama_pemilik}
            onChange={e => setForm(f => ({ ...f, nama_pemilik: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Nama Lahan</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-36"
            placeholder="Nama / kode lahan"
            value={form.nama_lahan}
            onChange={e => setForm(f => ({ ...f, nama_lahan: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Jenis Tanaman *</label>
          <select
            className="border rounded px-3 py-1.5 text-sm w-36"
            value={form.id_tanaman}
            onChange={e => setForm(f => ({ ...f, id_tanaman: e.target.value }))}
          >
            <option value="">-- Pilih --</option>
            {/* options: id_tanaman sebagai value, nama_tanaman sebagai label */}
            {tanamanList.map(t => (
              <option key={t.id_tanaman} value={t.id_tanaman}>{t.nama_tanaman}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Keterangan</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-40"
            placeholder="Keterangan (opsional)"
            value={form.keterangan}
            onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))}
          />
        </div>
        <div className="w-full">
          <label className="text-xs text-gray-600 block mb-1">
            Geometri WKT {editId ? '(kosongkan jika tidak diubah)' : '*'}
          </label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-full font-mono text-xs"
            placeholder="POLYGON((677900 9296500, 677950 9296500, 677950 9296550, 677900 9296500))"
            value={form.geom_wkt}
            onChange={e => setForm(f => ({ ...f, geom_wkt: e.target.value }))}
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
              <th className="px-3 py-2 text-left">Nama Lahan</th>
              <th className="px-3 py-2 text-left">Pemilik</th>
              <th className="px-3 py-2 text-left">Tanaman</th>
              <th className="px-3 py-2 text-right">Luas (m²)</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4 text-gray-400">Belum ada data lahan</td></tr>
            )}
            {data.map((f, i) => {
              const p = f.properties || {}
              return (
                <tr key={p.id_lahan} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2">{p.id_lahan}</td>
                  <td className="px-3 py-2 font-medium">{p.nama_lahan || '-'}</td>
                  <td className="px-3 py-2">{p.nama_pemilik}</td>
                  <td className="px-3 py-2">{p.nama_tanaman || '-'}</td>
                  <td className="px-3 py-2 text-right">
                    {p.luas_lahan
                      ? Number(p.luas_lahan).toLocaleString('id-ID', { maximumFractionDigits: 0 })
                      : '-'}
                  </td>
                  <td className="px-3 py-2 text-center space-x-2">
                    <button onClick={() => handleEdit(f)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(p.id_lahan)} className="text-red-600 hover:underline text-xs">Hapus</button>
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
