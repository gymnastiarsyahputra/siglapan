import { useEffect, useState } from 'react'
import { getStatistik } from '../api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const WARNA = ['#4ade80', '#facc15', '#fb923c', '#a78bfa', '#f87171', '#60a5fa', '#34d399', '#f472b6']

export default function StatistikPanel() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStatistik()
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4 text-sm text-gray-500">Memuat statistik...</div>
  if (!data.length) return <div className="p-4 text-sm text-gray-400">Tidak ada data statistik</div>

  return (
    <div className="p-4">
      <h2 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-3">Statistik Tanaman</h2>

      {/* Bar Chart — dataKey pakai jumlah_persil (dari backend) */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
          <XAxis
            dataKey="nama_tanaman"
            tick={{ fontSize: 10 }}
            angle={-35}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, name) => [
              name === 'jumlah_persil' ? value + ' persil' : value,
              name === 'jumlah_persil' ? 'Jumlah Persil' : name
            ]}
          />
          <Bar dataKey="jumlah_persil" name="jumlah_persil">
            {data.map((_, i) => <Cell key={i} fill={WARNA[i % WARNA.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Tabel — field: nama_tanaman, jumlah_persil, total_luas */}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-green-50 text-green-800">
              <th className="text-left py-1 px-2">Tanaman</th>
              <th className="text-right py-1 px-2">Persil</th>
              <th className="text-right py-1 px-2">Luas (m²)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="py-1 px-2 flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: WARNA[i % WARNA.length] }}
                  />
                  {row.nama_tanaman}
                </td>
                <td className="py-1 px-2 text-right">{row.jumlah_persil}</td>
                <td className="py-1 px-2 text-right">
                  {row.total_luas
                    ? Number(row.total_luas).toLocaleString('id-ID', { maximumFractionDigits: 0 })
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
