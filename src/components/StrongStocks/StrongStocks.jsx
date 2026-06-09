import { useState } from 'react'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STRONG_STOCKS } from '../../services/mock.js'

const SIGNAL_COLOR = { '突破': '#06b6d4', '強勢': '#10b981', '放量': '#f59e0b' }

export default function StrongStocks() {
  const { openStockDetail } = useApp()
  const [data] = useState(MOCK_STRONG_STOCKS)
  const [sortKey, setSortKey] = useState('rs')
  const [sortDir, setSortDir] = useState(-1)
  const [signalFilter, setSignalFilter] = useState('all')

  const filtered = data
    .filter(s => signalFilter === 'all' || s.signal === signalFilter)
    .sort((a, b) => (b[sortKey] - a[sortKey]) * sortDir)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  return (
    <div className="strong-page">
      <div className="page-header">
        <h2 className="page-title">強勢股</h2>
        <div className="filter-tabs">
          {[['all', '全部'], ['突破', '突破'], ['強勢', '強勢'], ['放量', '放量']].map(([v, l]) => (
            <button key={v} className={`filter-tab ${signalFilter === v ? 'active' : ''}`} onClick={() => setSignalFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="strong-grid">
        {filtered.map((s, i) => (
          <div key={s.code} className="strong-card" onClick={() => openStockDetail(s)}>
            <div className="sc-rank">#{i + 1}</div>
            <div className="sc-header">
              <div>
                <div className="sc-code">{s.code}</div>
                <div className="sc-name">{s.name}</div>
              </div>
              <span className="sc-signal" style={{ background: `${SIGNAL_COLOR[s.signal]}20`, color: SIGNAL_COLOR[s.signal], border: `1px solid ${SIGNAL_COLOR[s.signal]}40` }}>
                {s.signal}
              </span>
            </div>
            <div className="sc-price">
              <span className="sc-pval">{s.price.toFixed(2)}</span>
              <span className="sc-pct up">+{s.changePct.toFixed(2)}%</span>
            </div>
            <div className="sc-stats">
              <div className="sc-stat">
                <div className="sc-stat-label">相對強度</div>
                <div className="sc-stat-val accent">{s.rs}</div>
                <div className="rs-bar">
                  <div className="rs-fill" style={{ width: `${s.rs}%` }} />
                </div>
              </div>
              <div className="sc-stat">
                <div className="sc-stat-label">量比</div>
                <div className={`sc-stat-val ${s.volumeRatio > 2 ? 'up' : 'muted'}`}>{s.volumeRatio.toFixed(1)}x</div>
              </div>
            </div>
            <div className="sc-vol">成交量 {(s.volume / 1e6).toFixed(2)}M</div>
          </div>
        ))}
      </div>
    </div>
  )
}
