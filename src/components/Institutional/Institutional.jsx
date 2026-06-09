import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { getInstitutionalInvestors } from '../../services/api.js'
import { MOCK_INSTITUTIONAL } from '../../services/mock.js'

function fmt(n) {
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${(n / 1e8).toFixed(1)}億`
  if (abs >= 1e4) return `${(n / 1e4).toFixed(0)}萬`
  return n.toLocaleString()
}

export default function Institutional() {
  const [data, setData] = useState(MOCK_INSTITUTIONAL)
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState('total')
  const [sortDir, setSortDir] = useState(-1)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    getInstitutionalInvestors().then(d => {
      if (Array.isArray(d) && d.length) setData(d)
    }).finally(() => setLoading(false))
  }, [])

  const sorted = [...data]
    .filter(d => {
      if (filter === 'buy') return d.total > 0
      if (filter === 'sell') return d.total < 0
      return true
    })
    .sort((a, b) => (b[sortKey] - a[sortKey]) * sortDir)

  const totalForeign = data.reduce((s, d) => s + d.foreign, 0)
  const totalTrust = data.reduce((s, d) => s + d.trust, 0)
  const totalDealer = data.reduce((s, d) => s + d.dealer, 0)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const chartData = sorted.slice(0, 8).map(d => ({
    name: d.name,
    外資: d.foreign / 1e8,
    投信: d.trust / 1e8,
    自營商: d.dealer / 1e8,
  }))

  return (
    <div className="inst-page">
      <div className="page-header">
        <h2 className="page-title">三大法人資料</h2>
        <div className="filter-tabs">
          {[['all', '全部'], ['buy', '買超'], ['sell', '賣超']].map(([v, l]) => (
            <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="inst-summary-row">
        <div className="inst-summary-card">
          <div className="isc-label">外資合計</div>
          <div className={`isc-value ${totalForeign >= 0 ? 'up' : 'down'}`}>{fmt(totalForeign)}</div>
        </div>
        <div className="inst-summary-card">
          <div className="isc-label">投信合計</div>
          <div className={`isc-value ${totalTrust >= 0 ? 'up' : 'down'}`}>{fmt(totalTrust)}</div>
        </div>
        <div className="inst-summary-card">
          <div className="isc-label">自營商合計</div>
          <div className={`isc-value ${totalDealer >= 0 ? 'up' : 'down'}`}>{fmt(totalDealer)}</div>
        </div>
        <div className="inst-summary-card accent">
          <div className="isc-label">三大法人合計</div>
          <div className={`isc-value ${(totalForeign + totalTrust + totalDealer) >= 0 ? 'up' : 'down'}`}>
            {fmt(totalForeign + totalTrust + totalDealer)}
          </div>
        </div>
      </div>

      <div className="card full" style={{ marginBottom: 16 }}>
        <div className="card-head"><span className="card-title">個股法人買賣超（億元）</span></div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={2}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} tickFormatter={v => `${v}億`} />
            <Tooltip
              contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }}
              formatter={(v) => [`${v.toFixed(2)}億`]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Bar dataKey="外資" fill="#06b6d4" radius={[2,2,0,0]} />
            <Bar dataKey="投信" fill="#10b981" radius={[2,2,0,0]} />
            <Bar dataKey="自營商" fill="#f59e0b" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card full">
        <table className="data-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>名稱</th>
              <th className="sortable" onClick={() => handleSort('foreign')}>
                外資 {sortKey === 'foreign' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('trust')}>
                投信 {sortKey === 'trust' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('dealer')}>
                自營商 {sortKey === 'dealer' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('total')}>
                合計 {sortKey === 'total' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th>法人動向</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => (
              <tr key={d.code}>
                <td className="code-cell">{d.code}</td>
                <td>{d.name}</td>
                <td className={`mono ${d.foreign >= 0 ? 'up' : 'down'}`}>{fmt(d.foreign)}</td>
                <td className={`mono ${d.trust >= 0 ? 'up' : 'down'}`}>{fmt(d.trust)}</td>
                <td className={`mono ${d.dealer >= 0 ? 'up' : 'down'}`}>{fmt(d.dealer)}</td>
                <td className={`mono bold ${d.total >= 0 ? 'up' : 'down'}`}>{fmt(d.total)}</td>
                <td>
                  <div className="inst-bar-mini">
                    <div className={`ibm-fill ${d.total >= 0 ? 'up' : 'down'}`}
                      style={{ width: `${Math.min(Math.abs(d.total) / 3e10 * 100, 100)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
