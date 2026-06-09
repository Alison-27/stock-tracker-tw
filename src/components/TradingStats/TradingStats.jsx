import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { MOCK_TRADING_STATS } from '../../services/mock.js'

function fmt(n) {
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${(n / 1e8).toFixed(1)}億`
  if (abs >= 1e4) return `${(n / 1e4).toFixed(0)}萬`
  return n.toLocaleString()
}

export default function TradingStats() {
  const stats = MOCK_TRADING_STATS
  const [activeSection, setActiveSection] = useState('overview')

  const adData = [
    { name: '上漲', value: stats.advances, fill: '#10b981' },
    { name: '下跌', value: stats.declines, fill: '#ef4444' },
    { name: '不變', value: stats.unchanged, fill: '#4a5568' },
  ]

  const netBuyData = stats.buyByType.map(t => ({
    name: t.type,
    買入: t.buy / 1e8,
    賣出: -t.sell / 1e8,
    淨買超: t.net / 1e8,
  }))

  const sectorData = [...stats.sectorPerformance].sort((a, b) => b.changePct - a.changePct)

  return (
    <div className="trading-page">
      <div className="page-header">
        <h2 className="page-title">主動買賣統計</h2>
        <div className="filter-tabs">
          {[['overview', '市場概況'], ['investor', '投資人分析'], ['sector', '類股分布']].map(([v, l]) => (
            <button key={v} className={`filter-tab ${activeSection === v ? 'active' : ''}`} onClick={() => setActiveSection(v)}>{l}</button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <>
          <div className="inst-summary-row">
            <div className="inst-summary-card">
              <div className="isc-label">成交金額</div>
              <div className="isc-value accent">{fmt(stats.totalVolume)}</div>
            </div>
            <div className="inst-summary-card">
              <div className="isc-label">漲停家數</div>
              <div className="isc-value up">{stats.limitUp}</div>
            </div>
            <div className="inst-summary-card">
              <div className="isc-label">跌停家數</div>
              <div className="isc-value down">{stats.limitDown}</div>
            </div>
            <div className="inst-summary-card">
              <div className="isc-label">融資餘額</div>
              <div className="isc-value">{fmt(stats.marginBalance)}</div>
            </div>
            <div className="inst-summary-card">
              <div className="isc-label">融券餘額</div>
              <div className="isc-value">{fmt(stats.shortBalance)}</div>
            </div>
          </div>

          <div className="trading-row">
            <div className="card">
              <div className="card-head"><span className="card-title">漲跌家數分布</span></div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={adData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {adData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="ad-summary">
                <span className="up">↑ {stats.advances} 上漲</span>
                <span className="down">↓ {stats.declines} 下跌</span>
                <span className="muted">— {stats.unchanged} 平盤</span>
              </div>
            </div>

            <div className="card wide">
              <div className="card-head"><span className="card-title">法人淨買賣（億）</span></div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={netBuyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} tickFormatter={v => `${v}億`} />
                  <Tooltip contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }} formatter={(v) => [`${v.toFixed(1)}億`]} />
                  <Bar dataKey="淨買超" radius={[3,3,0,0]}>
                    {netBuyData.map((entry, i) => (
                      <Cell key={i} fill={entry['淨買超'] >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeSection === 'investor' && (
        <div className="card full">
          <div className="card-head"><span className="card-title">各類投資人買賣明細</span></div>
          <table className="data-table">
            <thead>
              <tr><th>投資人類型</th><th>買入（億）</th><th>賣出（億）</th><th>淨買賣（億）</th><th>市場佔比</th></tr>
            </thead>
            <tbody>
              {stats.buyByType.map(t => {
                const totalBuy = stats.buyByType.reduce((s, tt) => s + tt.buy, 0)
                return (
                  <tr key={t.type}>
                    <td className="bold">{t.type}</td>
                    <td className="mono up">{(t.buy / 1e8).toFixed(1)}</td>
                    <td className="mono down">{(t.sell / 1e8).toFixed(1)}</td>
                    <td className={`mono bold ${t.net >= 0 ? 'up' : 'down'}`}>
                      {t.net >= 0 ? '+' : ''}{(t.net / 1e8).toFixed(1)}
                    </td>
                    <td>
                      <div className="pct-bar-wrap">
                        <div className="pct-bar">
                          <div className="pct-fill" style={{ width: `${(t.buy / totalBuy) * 100}%`, background: '#06b6d4' }} />
                        </div>
                        <span className="mono muted">{((t.buy / totalBuy) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'sector' && (
        <div className="card full">
          <div className="card-head"><span className="card-title">類股今日漲跌幅</span></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectorData} layout="vertical" margin={{ top: 5, right: 60, left: 30, bottom: 5 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#4a5568' }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 12, fill: '#94a3b8' }} width={60} />
              <Tooltip contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }} formatter={(v) => [`${v.toFixed(2)}%`]} />
              <Bar dataKey="changePct" radius={[0,3,3,0]}>
                {sectorData.map((entry, i) => (
                  <Cell key={i} fill={entry.changePct >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
