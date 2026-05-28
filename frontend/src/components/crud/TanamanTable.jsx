import { useEffect, useState } from 'react'
import { getTanaman, createTanaman, updateTanaman, deleteTanaman } from '../../api/api'

// POST/PUT body: { nama_tanaman, deskripsi }
const emptyForm = { nama_tanaman: '', deskripsi: '' }

export default function TanamanTable() {
  const [data, setData] = useState([])
  const [form, setForm] = useState(emptyForm)
  // id field dari backend: id_tanaman
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  function load() {
    // response: array of { id_tanaman, nama_tanaman, deskripsi }
    getTanaman().then(res => setData(res.data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function handleSubmit() {
    if (!form.nama_tanaman.trim()) return alert('Nama tanaman wajib diisi')
    setLoading(true)
    try {
      if (editId) {
        await updateTanaman(editId, form)
      } else {
        await createTanaman(form)
      }
      setForm(emptyForm)
      setEditId(null)
      load()
    } catch (err) {
      alert('Gagal menyimpan: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus jenis tanaman ini?')) return
    try {
      await deleteTanaman(id)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menghapus. Mungkin tanaman masih dipakai di data lahan.')
    }
  }

  function handleEdit(row) {
    // row fields: id_tanaman, nama_tanaman, deskripsi
    setEditId(row.id_tanaman)
    setForm({ nama_tanaman: row.nama_tanaman, deskripsi: row.deskripsi || '' })
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-green-800 mb-4">🌱 Manajemen Jenis Tanaman</h2>

      {/* Form */}
      <div className="bg-green-50 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Nama Tanaman *</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-40"
            placeholder="contoh: Padi"
            value={form.nama_tanaman}
            onChange={e => setForm(f => ({ ...f, nama_tanaman: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">Deskripsi</label>
          <input
            className="border rounded px-3 py-1.5 text-sm w-64"
            placeholder="Deskripsi singkat (opsional)"
            value={form.deskripsi}
            onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
          />
        </div>
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

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Nama Tanaman</th>
              <th className="px-3 py-2 text-left">Deskripsi</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-400">Belum ada data tanaman</td></tr>
            )}
            {data.map((row, i) => (
              <tr key={row.id_tanaman} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2">{row.id_tanaman}</td>
                <td className="px-3 py-2 font-medium">{row.nama_tanaman}</td>
                <td className="px-3 py-2 text-gray-600">{row.deskripsi || '-'}</td>
                <td className="px-3 py-2 text-center space-x-2">
                  <button onClick={() => handleEdit(row)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(row.id_tanaman)} className="text-red-600 hover:underline text-xs">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
