import { useState } from 'react'
import MapView from '../components/MapView'
import StatistikPanel from '../components/StatistikPanel'
import SpatialTools from '../components/SpatialTools'

export default function HomePage() {
  // filter params sesuai backend: jenis_tanaman (int = id_tanaman), pemilik (string)
  const [filter, setFilter] = useState({})
  const [modeCekLokasi, setModeCekLokasi] = useState(false)
  // radius dan lahanDipilihId untuk buffer lingkaran di peta
  const [radius, setRadius] = useState(null)
  const [lahanDipilihId, setLahanDipilihId] = useState(null)

  return (
    <div className="flex h-[calc(100vh-48px)]">

      {/* ── SIDEBAR KIRI ── */}
      <div className="w-64 bg-white shadow-md flex flex-col overflow-y-auto z-10">
        <div className="p-4 flex flex-col gap-4">

          {/* Filter Lahan */}
          <div>
            <h2 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">Filter Lahan</h2>

            {/* Filter pemilik — backend param: pemilik (ILIKE search) */}
            <input
              type="text"
              placeholder="Nama pemilik..."
              className="w-full border rounded px-2 py-1 text-sm mb-2"
              onChange={e => setFilter(f => ({
                ...f,
                pemilik: e.target.value || undefined
              }))}
            />

            {/* Catatan: filter jenis_tanaman butuh id_tanaman (int), bukan nama.
                Untuk kemudahan, kita pakai filter pemilik saja di sini.
                Filter by tanaman sudah tersedia di SpatialTools dropdown. */}
          </div>

          {/* Cek Lokasi (ST_Intersects) */}
          <div>
            <h2 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">Cek Lokasi</h2>
            <button
              onClick={() => setModeCekLokasi(m => !m)}
              className={`w-full py-1.5 rounded text-sm font-medium transition ${
                modeCekLokasi
                  ? 'bg-red-500 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {modeCekLokasi ? '❌ Nonaktifkan' : '📍 Aktifkan Cek Lokasi'}
            </button>
            {modeCekLokasi && (
              <p className="text-xs text-gray-500 mt-1">Klik di peta untuk cek lahan di titik tersebut</p>
            )}
          </div>

          {/* Legenda Warna Tanaman */}
          <div>
            <h2 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">Legenda</h2>
            {[
              ['Padi', '#4ade80'],
              ['Jagung', '#facc15'],
              ['Kedelai', '#fb923c'],
              ['Singkong', '#a78bfa'],
              ['Cabai', '#f87171'],
              ['Kopi', '#92400e'],
              ['Sawit', '#16a34a'],
              ['Lainnya', '#60a5fa'],
            ].map(([nama, warna]) => (
              <div key={nama} className="flex items-center gap-2 text-sm mb-1">
                <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: warna }} />
                {nama}
              </div>
            ))}
          </div>
        </div>

        {/* Fasilitas Terdekat (ST_DWithin) */}
        <SpatialTools
          onRadiusChange={setRadius}
          onLahanPilihChange={setLahanDipilihId}
        />

        {/* Statistik Lahan */}
        <StatistikPanel />
      </div>

      {/* ── PETA ── */}
      <div className="flex-1">
        <MapView
          filter={filter}
          modeCekLokasi={modeCekLokasi}
          radiusFasilitas={radius}
          lahanDipilihId={lahanDipilihId}
        />
      </div>

    </div>
  )
}
