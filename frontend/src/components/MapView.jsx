import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { getLahan, getFasilitas, cekLokasi } from '../api/api'

// Fix ikon marker Leaflet di Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Warna per jenis tanaman (nama_tanaman dari backend)
const WARNA_TANAMAN = {
  'Padi': '#4ade80',
  'Jagung': '#facc15',
  'Kedelai': '#fb923c',
  'Singkong': '#a78bfa',
  'Cabai': '#f87171',
  'Tomat': '#f43f5e',
  'Kopi': '#92400e',
  'Sawit': '#16a34a',
  'default': '#60a5fa',
}

function getWarna(namaTanaman) {
  return WARNA_TANAMAN[namaTanaman] || WARNA_TANAMAN['default']
}

// Komponen untuk handle klik peta (cek lokasi)
function MapClickHandler({ onMapClick, aktif }) {
  useMapEvents({
    click: (e) => {
      if (aktif) onMapClick(e.latlng)
    }
  })
  return null
}

export default function MapView({ filter, modeCekLokasi, radiusFasilitas, lahanDipilihId }) {
  const [lahanData, setLahanData] = useState(null)
  const [fasilitasData, setFasilitasData] = useState(null)
  const [lahanDiklik, setLahanDiklik] = useState(null)
  const [clickPoint, setClickPoint] = useState(null)

  // Load data lahan (reload saat filter berubah)
  useEffect(() => {
    getLahan(filter)
      .then(res => setLahanData(res.data))
      .catch(err => console.error('Gagal load lahan:', err))
  }, [filter])

  // Load fasilitas sekali saja
  useEffect(() => {
    getFasilitas()
      .then(res => setFasilitasData(res.data))
      .catch(err => console.error('Gagal load fasilitas:', err))
  }, [])

  // Style tiap polygon lahan berdasarkan nama_tanaman
  function styleFeature(feature) {
    const namaTanaman = feature.properties?.nama_tanaman || 'default'
    return {
      color: '#1a5c2a',
      weight: 1.5,
      fillColor: getWarna(namaTanaman),
      fillOpacity: 0.5,
    }
  }

  // Popup + highlight hover
  function onEachFeature(feature, layer) {
    // field dari backend: id_lahan, nama_pemilik, nama_lahan, luas_lahan, keterangan, nama_tanaman
    const p = feature.properties || {}
    const luas = p.luas_lahan
      ? Number(p.luas_lahan).toLocaleString('id-ID', { maximumFractionDigits: 0 })
      : '-'

    layer.bindPopup(`
      <div style="min-width:180px;font-family:sans-serif">
        <b style="font-size:14px;color:#1a5c2a">${p.nama_lahan || 'Lahan #' + p.id_lahan}</b>
        <hr style="margin:4px 0"/>
        👤 <b>Pemilik:</b> ${p.nama_pemilik || '-'}<br/>
        🌱 <b>Tanaman:</b> ${p.nama_tanaman || '-'}<br/>
        📐 <b>Luas:</b> ${luas} m²<br/>
        📝 <b>Keterangan:</b> ${p.keterangan || '-'}
      </div>
    `)

    layer.on({
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.8, weight: 3 }),
      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.5, weight: 1.5 }),
    })
  }

  // Handle klik peta → cek lokasi (ST_Intersects)
  // Catatan: backend pakai SRID 32748 (UTM), tapi ST_Intersects di backend
  // menerima x=longitude, y=latitude dalam WGS84 (dari Leaflet)
  async function handleMapClick(latlng) {
    setClickPoint(latlng)
    try {
      const res = await cekLokasi(latlng.lng, latlng.lat)
      setLahanDiklik(res.data)
    } catch (err) {
      console.error('Cek lokasi gagal:', err)
      setLahanDiklik(null)
    }
  }

  // Center peta: Bandar Lampung
  const center = [-5.4, 105.3]

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler aktif={modeCekLokasi} onMapClick={handleMapClick} />

        {/* Layer Lahan — key pakai filter supaya re-render saat filter berubah */}
        {lahanData && (
          <GeoJSON
            key={JSON.stringify(filter)}
            data={lahanData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Layer Fasilitas — field: id_fasilitas, nama_fasilitas, jenis_fasilitas */}
        {fasilitasData?.features?.map((f, i) => {
          const coords = f.geometry?.coordinates
          if (!coords) return null
          const p = f.properties || {}
          return (
            <Marker key={p.id_fasilitas || i} position={[coords[1], coords[0]]}>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', minWidth: '160px' }}>
                  <b style={{ color: '#c0392b' }}>🏗️ {p.nama_fasilitas || 'Fasilitas'}</b><br />
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>
                    Jenis: {p.jenis_fasilitas || '-'}
                  </span>
                  {p.jarak_meter !== undefined && (
                    <><br /><span style={{ fontSize: '0.85rem', color: '#555' }}>
                      Jarak: {Number(p.jarak_meter).toFixed(1)} m
                    </span></>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Titik merah saat cek lokasi aktif */}
        {clickPoint && modeCekLokasi && (
          <Circle
            center={clickPoint}
            radius={100}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
          />
        )}

        {/* Lingkaran buffer radius fasilitas terdekat */}
        {lahanDipilihId && radiusFasilitas && lahanData && (() => {
          const feat = lahanData.features?.find(
            f => f.properties?.id_lahan === Number(lahanDipilihId)
          )
          if (!feat?.geometry?.coordinates) return null
          // Ambil koordinat pertama dari polygon/multipolygon untuk center buffer
          let coords
          try {
            if (feat.geometry.type === 'MultiPolygon') {
              coords = feat.geometry.coordinates[0][0]
            } else {
              coords = feat.geometry.coordinates[0]
            }
            const lats = coords.map(c => c[1])
            const lngs = coords.map(c => c[0])
            const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
            const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
            return (
              <Circle
                center={[centerLat, centerLng]}
                radius={radiusFasilitas}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1, dashArray: '6' }}
              />
            )
          } catch { return null }
        })()}

      </MapContainer>

      {/* Info hasil cek lokasi */}
      {lahanDiklik && modeCekLokasi && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 max-w-xs text-sm">
          <b className="text-green-700">📍 Lahan di titik ini:</b>
          {lahanDiklik.features?.length > 0 ? (
            lahanDiklik.features.map((f, i) => (
              <div key={i} className="mt-1 border-t pt-1">
                {/* field dari backend spasial: nama_lahan, nama_pemilik */}
                <b>{f.properties?.nama_lahan || `Lahan #${f.properties?.id_lahan}`}</b>
                <br />
                👤 {f.properties?.nama_pemilik} — 🌱 {f.properties?.nama_tanaman}
              </div>
            ))
          ) : (
            <div className="mt-1 text-gray-500">Tidak ada lahan di titik ini</div>
          )}
        </div>
      )}
    </div>
  )
}
