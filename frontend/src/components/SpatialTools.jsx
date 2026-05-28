import { useState } from 'react'
import { getLahan, fasilitasTerdekat } from '../api/api'

export default function SpatialTools({ onFasilitasResult, onRadiusChange, onLahanPilihChange }) {
  const [lahanList, setLahanList] = useState([])
  // id_lahan dari backend (integer)
  const [lahanDipilih, setLahanDipilih] = useState('')
  const [radius, setRadius] = useState(500)
  const [hasil, setHasil] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Lazy load daftar lahan saat dropdown difokus
  function loadLahan() {
    if (loaded) return
    getLahan()
      .then(res => {
        // features GeoJSON — properties.id_lahan, properties.nama_lahan, properties.nama_pemilik
        const features = res.data?.features || []
        setLahanList(features)
        setLoaded(true)
      })
      .catch(() => {})
  }

  async function cariTerdekat() {
    if (!lahanDipilih) return
    setLoading(true)
    try {
      // endpoint: /api/spasial/fasilitas-terdekat?id_lahan=X&radius=Y
      const res = await fasilitasTerdekat(lahanDipilih, radius)
      setHasil(res.data)
      onFasilitasResult && onFasilitasResult(res.data)
      onRadiusChange && onRadiusChange(radius)
    } catch (err) {
      console.error(err)
      setHasil({ features: [] })
    } finally {
      setLoading(false)
    }
  }

  function handlePilihLahan(id) {
    setLahanDipilih(id)
    setHasil(null)
    onLahanPilihChange && onLahanPilihChange(id)
  }

  return (
    <div className="p-4 border-t">
      <h2 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-3">Fasilitas Terdekat</h2>

      {/* Pilih lahan — value = id_lahan */}
      <select
        className="w-full border rounded px-2 py-1 text-sm mb-2"
        value={lahanDipilih}
        onFocus={loadLahan}
        onChange={e => handlePilihLahan(e.target.value)}
      >
        <option value="">-- Pilih Lahan --</option>
        {lahanList.map((f) => {
          const p = f.properties || {}
          return (
            <option key={p.id_lahan} value={p.id_lahan}>
              {p.nama_lahan || `Lahan #${p.id_lahan}`} — {p.nama_pemilik}
            </option>
          )
        })}
      </select>

      {/* Input radius */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-600 whitespace-nowrap">Radius (m):</label>
        <input
          type="number"
          value={radius}
          min={100}
          max={50000}
          step={100}
          className="w-full border rounded px-2 py-1 text-sm"
          onChange={e => setRadius(Number(e.target.value))}
        />
      </div>

      <button
        onClick={cariTerdekat}
        disabled={!lahanDipilih || loading}
        className="w-full bg-blue-600 text-white py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Mencari...' : '🔍 Cari Fasilitas'}
      </button>

      {/* Hasil — field: id_fasilitas, nama_fasilitas, jenis_fasilitas, jarak_meter */}
      {hasil && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Ditemukan: {hasil.features?.length || 0} fasilitas dalam {radius}m
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {hasil.features?.length === 0 && (
              <p className="text-xs text-gray-400">Tidak ada fasilitas dalam radius ini</p>
            )}
            {hasil.features?.map((f, i) => {
              const p = f.properties || {}
              return (
                <div key={p.id_fasilitas || i} className="text-xs bg-blue-50 rounded p-1.5">
                  🏗️ <b>{p.nama_fasilitas}</b><br />
                  {p.jenis_fasilitas}
                  {p.jarak_meter !== undefined && (
                    <span className="text-gray-500 ml-1">
                      ({Number(p.jarak_meter).toFixed(0)}m)
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
