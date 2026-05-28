import { useState } from 'react'
import TanamanTable from '../components/crud/TanamanTable'
import LahanTable from '../components/crud/LahanTable'
import FasilitasTable from '../components/crud/FasilitasTable'

const TABS = [
  { id: 'tanaman', label: '🌱 Tanaman' },
  { id: 'lahan', label: '🗺️ Lahan' },
  { id: 'fasilitas', label: '🏭 Fasilitas' },
]

export default function ManajemenPage() {
  const [activeTab, setActiveTab] = useState('tanaman')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-green-900 mb-6">Manajemen Data SIGLAPAN</h1>

      {/* Tab */}
      <div className="flex gap-2 mb-6 border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition ${
              activeTab === tab.id
                ? 'bg-green-700 text-white'
                : 'text-gray-600 hover:bg-green-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Konten */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'tanaman' && <TanamanTable />}
        {activeTab === 'lahan' && <LahanTable />}
        {activeTab === 'fasilitas' && <FasilitasTable />}
      </div>
    </div>
  )
}