import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STOCKS, MOCK_TRADING_STATS, MOCK_PRICE_HISTORY } from '../../services/mock.js'

function PriceTag({ value, pct }) {
  const up = pct >= 0
  return (
    <div className={`price-tag ${up ? 'up' : 'down'}`}>
      <span className="price-val">{value?.toFixed(2)}</span>
      <span className="price-pct">{up ? '+' : ''}{pct?.toFixed(2)}%</span>
    </div>
  )
}

function MarketCard({ stock, onClick }) {
  const up = stock.changePct >= 0
  return (
    <div className={`market-card ${up ? 'up' : 'down'}`} onClick={() => onClick(stock)}>
      <div className="mc-header">
        <span className="mc-code">{stock.code}</span>
        <span className={`mc-badge ${up ? 'up' : 'down'}`}>{up ? '▲' : '▼'}</span>
      </div>
      <div className="mc-name">{stock.name}</div>
      <div className="mc-price">{stock.price.toFixed(2)}</div>
      <div className={`mc-change ${up ? 'up' : 'down'}`}>
        {up ? '+' : ''}{stock.change.toFixed(2)} ({up ? '+' : ''}{stock.changePct.toFixed(2)}%)
      </div>
      <div className="mc-vol">成交 {(stock.volume / 1e6).toFixed(1)}M</div>
    </div>
  )
}

export default function Dashboard() {
  const { openStockDetail } = useApp()
  const [indexHistory] = useState(MOCK_PRICE_HISTORY('2330').slice(-30))
  const stats = MOCK_TRADING_STATS
  const topGainers = [...MOCK_STOCKS].sort((a, b) => b.changePct - a.changePct).slice(0, 6)
  const topLosers = [...MOCK_STOCKS].sort((a, b) => a.changePct - b.changePct).slice(0, 4)
  const mostActive = [...MOCK_STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 6)

  const adRatio = stats.advances / (stats.advances + stats.declines + stats.unchanged)

  return (
    <div className="dashboard">
      <div className="dash-row">
        {/* Market Overview Chart */}
        <div className="card wide">
          <div className="card-head">
            <span className="card-title">大盤走勢</span>
            <span className="card-sub">加權指數 近30日</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={indexHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="indexGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a5568' }} tickFormatter={v => v.slice(5)} interval={4} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#4a5568' }} width={55} tickFormatter={v => v.toLocaleString()} />
              <Tooltip
                contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }}
                formatter={(v) => [v.toLocaleString(), '指數']}
                labelFormatter={l => l}
              />
              <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="url(#indexGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Market Stats */}
        <div className="card">
          <div className="card-head"><span className="card-title">今日概況</span></div>
          <div className="stat-grid">
            <div className="stat-item">
              <div className="stat-label">成交金額</div>
              <div className="stat-value accent">{(stats.totalVolume / 1e8).toFixed(0)}億</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">漲停</div>
              <div className="stat-value up">{stats.limitUp}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">跌停</div>
              <div className="stat-value down">{stats.limitDown}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">上漲家數</div>
              <div className="stat-value up">{stats.advances}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">下跌家數</div>
              <div className="stat-value down">{stats.declines}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">不變</div>
              <div className="stat-value muted">{stats.unchanged}</div>
            </div>
          </div>
          <div className="ad-bar-wrap">
            <div className="ad-bar">
              <div className="ad-up" style={{ width: `${adRatio * 100}%` }} />
              <div className="ad-down" style={{ width: `${(1 - adRatio) * 100}%` }} />
            </div>
            <div className="ad-labels">
              <span className="up">{(adRatio * 100).toFixed(1)}%上漲</span>
              <span className="down">{((1 - adRatio) * 100).toFixed(1)}%下跌</span>
            </div>
          </div>
        </div>

        {/* Institutional Net */}
        <div className="card">
          <div className="card-head"><span className="card-title">法人買賣超</span></div>
          <div className="inst-summary">
            {stats.buyByType.slice(0, 3).map(t => (
              <div key={t.type} className="inst-row">
                <span className="inst-type">{t.type}</span>
                <div className="inst-bar-wrap">
                  <div
                    className={`inst-bar-fill ${t.net >= 0 ? 'up' : 'down'}`}
                    style={{ width: `${Math.min(Math.abs(t.net) / 4e10 * 100, 100)}%` }}
                  />
                </div>
                <span className={`inst-net ${t.net >= 0 ? 'up' : 'down'}`}>
                  {t.net >= 0 ? '+' : ''}{(t.net / 1e8).toFixed(1)}億
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="card full">
        <div className="card-head">
          <span className="card-title">類股表現</span>
        </div>
        <div className="sector-row">
          {stats.sectorPerformance.map(s => (
            <div key={s.sector} className={`sector-pill ${s.changePct >= 0 ? 'up' : 'down'}`}>
              <span className="sector-name">{s.sector}</span>
              <span className="sector-pct">{s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-row">
        {/* Top Gainers */}
        <div className="card">
          <div className="card-head"><span className="card-title">漲幅排行</span></div>
          <div className="rank-list">
            {topGainers.map((s, i) => (
              <div key={s.code} className="rank-item" onClick={() => openStockDetail(s)}>
                <span className="rank-no">{i + 1}</span>
                <span className="rank-code">{s.code}</span>
                <span className="rank-name">{s.name}</span>
                <span className="rank-price">{s.price.toFixed(2)}</span>
                <span className="rank-pct up">+{s.changePct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div className="card">
          <div className="card-head"><span className="card-title">成交量排行</span></div>
          <div className="rank-list">
            {mostActive.map((s, i) => (
              <div key={s.code} className="rank-item" onClick={() => openStockDetail(s)}>
                <span className="rank-no">{i + 1}</span>
                <span className="rank-code">{s.code}</span>
                <span className="rank-name">{s.name}</span>
                <span className="rank-price">{s.price.toFixed(2)}</span>
                <span className={`rank-pct ${s.changePct >= 0 ? 'up' : 'down'}`}>
                  {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="card">
          <div className="card-head"><span className="card-title">跌幅排行</span></div>
          <div className="rank-list">
            {topLosers.map((s, i) => (
              <div key={s.code} className="rank-item" onClick={() => openStockDetail(s)}>
                <span className="rank-no">{i + 1}</span>
                <span className="rank-code">{s.code}</span>
                <span className="rank-name">{s.name}</span>
                <span className="rank-price">{s.price.toFixed(2)}</span>
                <span className="rank-pct down">{s.changePct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
