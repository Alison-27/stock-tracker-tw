import { useState } from 'react'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_BIG_PLAYERS } from '../../services/mock.js'

function fmt(n) {
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${(n / 1e8).toFixed(1)}億`
  return `${(n / 1e4).toFixed(0)}萬`
}

export default function BigPlayers() {
  const { openStockDetail } = useApp()
  const [data] = useState(MOCK_BIG_PLAYERS)
  const [sortKey, setSortKey] = useState('netBuy')
  const [sortDir, setSortDir] = useState(-1)
  const [filter, setFilter] = useState('all')

  const filtered = [...data]
    .filter(d => {
      if (filter === 'buy') return d.netBuy > 0
      if (filter === 'sell') return d.netBuy < 0
      return true
    })
    .sort((a, b) => (b[sortKey] - a[sortKey]) * sortDir)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  return (
    <div className="bigplayer-page">
      <div className="page-header">
        <h2 className="page-title">大戶股</h2>
        <div className="filter-tabs">
          {[['all', '全部'], ['buy', '淨買超'], ['sell', '淨賣超']].map(([v, l]) => (
            <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card full">
        <table className="data-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>名稱</th>
              <th className="sortable" onClick={() => handleSort('concentration')}>
                大戶集中度 {sortKey === 'concentration' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('bigPlayerBuy')}>大戶買入</th>
              <th className="sortable" onClick={() => handleSort('bigPlayerSell')}>大戶賣出</th>
              <th className="sortable" onClick={() => handleSort('netBuy')}>
                淨買賣 {sortKey === 'netBuy' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('holdingChange')}>
                持倉變化 {sortKey === 'holdingChange' ? (sortDir === -1 ? '▼' : '▲') : ''}
              </th>
              <th>大戶動態</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.code} onClick={() => openStockDetail(d)}>
                <td className="code-cell">{d.code}</td>
                <td>{d.name}</td>
                <td>
                  <div className="conc-wrap">
                    <div className="conc-bar">
                      <div className="conc-fill" style={{ width: `${d.concentration}%` }} />
                    </div>
                    <span className="mono accent">{d.concentration.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="mono up">{fmt(d.bigPlayerBuy)}</td>
                <td className="mono down">{fmt(d.bigPlayerSell)}</td>
                <td className={`mono bold ${d.netBuy >= 0 ? 'up' : 'down'}`}>{fmt(d.netBuy)}</td>
                <td className={`mono ${d.holdingChange >= 0 ? 'up' : 'down'}`}>
                  {d.holdingChange >= 0 ? '+' : ''}{d.holdingChange.toFixed(1)}%
                </td>
                <td>
                  <span className={`status-badge ${d.netBuy > 0 ? 'bullish' : 'bearish'}`}>
                    {d.netBuy > 0 ? '大戶買超' : '大戶賣超'}
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
