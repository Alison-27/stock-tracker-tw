import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getETFList } from '../../services/api.js'
import { MOCK_ETF } from '../../services/mock.js'
import { useApp } from '../../store/AppContext.jsx'

export default function ETFTracker() {
  const { openStockDetail } = useApp()
  const [data, setData] = useState(MOCK_ETF)
  const [sortKey, setSortKey] = useState('changePct')
  const [sortDir, setSortDir] = useState(-1)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    getETFList().then(d => {
      if (Array.isArray(d) && d.length) setData(d)
    }).catch(() => {})
  }, [])

  const categories = ['all', ...new Set(data.map(d => d.category))]

  const filtered = [...data]
    .filter(d => category === 'all' || d.category === category)
    .sort((a, b) => (b[sortKey] - a[sortKey]) * sortDir)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(-1) }
  }

  const chartData = filtered.map(d => ({
    name: d.code,
    漲跌幅: d.changePct,
    折溢價: d.premium,
  }))

  return (
    <div className="etf-page">
      <div className="page-header">
        <h2 className="page-title">主動 ETF 追蹤</h2>
        <div className="filter-tabs">
          {categories.map(c => (
            <button key={c} className={`filter-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {c === 'all' ? '全部' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="etf-cards">
        {filtered.map(etf => (
          <div key={etf.code} className={`etf-card ${etf.changePct >= 0 ? 'up-border' : 'down-border'}`}
            onClick={() => openStockDetail({ ...etf, price: etf.price, changePct: etf.changePct })}>
            <div className="etf-header">
              <div>
                <div className="etf-code">{etf.code}</div>
                <div className="etf-name">{etf.name}</div>
              </div>
              <span className="etf-category">{etf.category}</span>
            </div>
            <div className="etf-prices">
              <div className="etf-price-row">
                <span className="etf-label">市價</span>
                <span className={`etf-val ${etf.changePct >= 0 ? 'up' : 'down'}`}>{etf.price.toFixed(2)}</span>
                <span className={`etf-pct ${etf.changePct >= 0 ? 'up' : 'down'}`}>
                  {etf.changePct >= 0 ? '+' : ''}{etf.changePct.toFixed(2)}%
                </span>
              </div>
              <div className="etf-price-row">
                <span className="etf-label">淨值</span>
                <span className="etf-val muted">{etf.nav.toFixed(2)}</span>
                <span className={`etf-premium ${etf.premium >= 0 ? 'up' : 'down'}`}>
                  {etf.premium >= 0 ? '+' : ''}{etf.premium.toFixed(2)}% 溢價
                </span>
              </div>
            </div>
            <div className="etf-footer">
              <div className="etf-stat">
                <span className="etf-stat-label">成交量</span>
                <span className="etf-stat-val">{(etf.volume / 1e6).toFixed(1)}M</span>
              </div>
              <div className="etf-stat">
                <span className="etf-stat-label">規模(億)</span>
                <span className="etf-stat-val">{(etf.aum / 1e4).toFixed(0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card full" style={{ marginTop: 16 }}>
        <div className="card-head"><span className="card-title">ETF 今日漲跌幅 vs 折溢價</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }}
              formatter={(v) => [`${v.toFixed(2)}%`]}
            />
            <Bar dataKey="漲跌幅" fill="#06b6d4" radius={[2,2,0,0]} />
            <Bar dataKey="折溢價" fill="#f59e0b" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
