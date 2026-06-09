import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getMarginTrading } from '../../services/api.js'
import { MOCK_MARGIN } from '../../services/mock.js'

export default function MarginTrading() {
  const [data, setData] = useState(MOCK_MARGIN)
  const [sortKey, setSortKey] = useState('marginBuyChange')
  const [sortDir, setSortDir] = useState(-1)
  const [view, setView] = useState('table')

  useEffect(() => {
    getMarginTrading().then(d => {
      if (Array.isArray(d) && d.length) setData(d)
    }).catch(() => {})
  }, [])

  const sorted = [...data].sort((a, b) => (b[sortKey] - a[sortKey]) * sortDir)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const chartData = sorted.slice(0, 8).map(d => ({
    name: d.name,
    融資增減: d.marginBuyChange,
    融券增減: d.shortSellChange,
  }))

  const totalMarginChange = data.reduce((s, d) => s + d.marginBuyChange, 0)
  const totalShortChange = data.reduce((s, d) => s + d.shortSellChange, 0)

  return (
    <div className="margin-page">
      <div className="page-header">
        <h2 className="page-title">資券變化</h2>
        <div className="view-toggle">
          <button className={`filter-tab ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>表格</button>
          <button className={`filter-tab ${view === 'chart' ? 'active' : ''}`} onClick={() => setView('chart')}>圖表</button>
        </div>
      </div>

      <div className="inst-summary-row">
        <div className="inst-summary-card">
          <div className="isc-label">融資總餘額增減</div>
          <div className={`isc-value ${totalMarginChange >= 0 ? 'up' : 'down'}`}>
            {totalMarginChange >= 0 ? '+' : ''}{totalMarginChange.toLocaleString()} 張
          </div>
        </div>
        <div className="inst-summary-card">
          <div className="isc-label">融券總餘額增減</div>
          <div className={`isc-value ${totalShortChange >= 0 ? 'up' : 'down'}`}>
            {totalShortChange >= 0 ? '+' : ''}{totalShortChange.toLocaleString()} 張
          </div>
        </div>
        <div className="inst-summary-card accent">
          <div className="isc-label">融資/融券比 (平均)</div>
          <div className="isc-value accent">
            {(data.reduce((s, d) => s + d.coverRatio, 0) / data.length).toFixed(2)}x
          </div>
        </div>
      </div>

      {view === 'chart' && (
        <div className="card full" style={{ marginBottom: 16 }}>
          <div className="card-head"><span className="card-title">融資融券增減（張）</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} />
              <Tooltip
                contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="融資增減" fill="#06b6d4" radius={[2,2,0,0]}>
                {chartData.map((entry, i) => (
                  <rect key={i} fill={entry['融資增減'] >= 0 ? '#06b6d4' : '#ef4444'} />
                ))}
              </Bar>
              <Bar dataKey="融券增減" fill="#f59e0b" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card full">
        <table className="data-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>名稱</th>
              <th className="sortable" onClick={() => handleSort('marginBuy')}>融資餘額 {sortKey === 'marginBuy' ? (sortDir === -1 ? '▼' : '▲') : ''}</th>
              <th className="sortable" onClick={() => handleSort('marginBuyChange')}>
                融資增減 {sortKey === 'marginBuyChange' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('shortSell')}>融券餘額 {sortKey === 'shortSell' ? (sortDir === -1 ? '▼' : '▲') : ''}</th>
              <th className="sortable" onClick={() => handleSort('shortSellChange')}>
                融券增減 {sortKey === 'shortSellChange' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('coverRatio')}>資/券比 {sortKey === 'coverRatio' ? (sortDir === -1 ? '▼' : '▲') : ''}</th>
              <th>資券狀態</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => (
              <tr key={d.code}>
                <td className="code-cell">{d.code}</td>
                <td>{d.name}</td>
                <td className="mono">{d.marginBuy.toLocaleString()}</td>
                <td className={`mono ${d.marginBuyChange >= 0 ? 'up' : 'down'}`}>
                  {d.marginBuyChange >= 0 ? '+' : ''}{d.marginBuyChange.toLocaleString()}
                </td>
                <td className="mono">{d.shortSell.toLocaleString()}</td>
                <td className={`mono ${d.shortSellChange >= 0 ? 'up' : 'down'}`}>
                  {d.shortSellChange >= 0 ? '+' : ''}{d.shortSellChange.toLocaleString()}
                </td>
                <td className="mono accent">{d.coverRatio.toFixed(2)}x</td>
                <td>
                  <span className={`status-badge ${d.marginBuyChange > 0 && d.shortSellChange < 0 ? 'bullish' : d.marginBuyChange < 0 && d.shortSellChange > 0 ? 'bearish' : 'neutral'}`}>
                    {d.marginBuyChange > 0 && d.shortSellChange < 0 ? '偏多' : d.marginBuyChange < 0 && d.shortSellChange > 0 ? '偏空' : '中性'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
