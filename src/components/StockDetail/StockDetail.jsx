import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { useApp } from '../../store/AppContext.jsx'
import { getPriceHistory } from '../../services/api.js'
import { MOCK_PRICE_HISTORY, MOCK_INSTITUTIONAL, MOCK_MARGIN } from '../../services/mock.js'

export default function StockDetail() {
  const { selectedStock, setActiveTab, openStockDetail } = useApp()
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('chart')
  const [range, setRange] = useState('3mo')

  const stock = selectedStock

  useEffect(() => {
    if (!stock?.code) return
    setHistory([])
    getPriceHistory(stock.code)
      .then(setHistory)
      .catch(() => setHistory(MOCK_PRICE_HISTORY(stock.code)))
  }, [stock?.code, range])

  if (!stock) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-icon">◻</div>
        <div className="empty-text">請從搜尋或列表中選擇股票</div>
      </div>
    )
  }

  const inst = MOCK_INSTITUTIONAL.find(i => i.code === stock.code)
  const margin = MOCK_MARGIN.find(m => m.code === stock.code)
  const up = stock.changePct >= 0

  const volumeData = history.slice(-30).map(d => ({ date: d.date, volume: d.volume }))

  return (
    <div className="stock-detail-page">
      <button className="back-btn" onClick={() => setActiveTab('dashboard')}>← 返回</button>

      <div className="sd-header">
        <div className="sd-identity">
          <div className="sd-code">{stock.code}</div>
          <div className="sd-name">{stock.name}</div>
        </div>
        <div className="sd-price-block">
          <div className={`sd-price ${up ? 'up' : 'down'}`}>{stock.price?.toFixed(2)}</div>
          <div className={`sd-change ${up ? 'up' : 'down'}`}>
            {up ? '+' : ''}{stock.change?.toFixed(2)} ({up ? '+' : ''}{stock.changePct?.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="sd-tabs">
        {[['chart', '走勢'], ['fundamental', '基本面'], ['institutional', '法人'], ['margin', '資券']].map(([v, l]) => (
          <button key={v} className={`sd-tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === 'chart' && (
        <div>
          <div className="range-tabs">
            {[['1mo', '1月'], ['3mo', '3月'], ['6mo', '6月'], ['1y', '1年']].map(([v, l]) => (
              <button key={v} className={`range-tab ${range === v ? 'active' : ''}`} onClick={() => setRange(v)}>{l}</button>
            ))}
          </div>
          <div className="card full">
            <div className="card-head"><span className="card-title">股價走勢</span></div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={up ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={up ? '#10b981' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3050" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4a5568' }} tickFormatter={v => v.slice(5)} interval={Math.floor(history.length / 8)} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#4a5568' }} width={55} />
                <Tooltip contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="price" stroke={up ? '#10b981' : '#ef4444'} fill="url(#sdGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card full" style={{ marginTop: 12 }}>
            <div className="card-head"><span className="card-title">成交量</span></div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4a5568' }} tickFormatter={v => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: '#4a5568' }} width={50} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, color: '#e2e8f0', fontSize: 11 }} formatter={(v) => [`${(v / 1e6).toFixed(2)}M`]} />
                <Bar dataKey="volume" fill="#243860" radius={[1,1,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'fundamental' && (
        <div className="fund-grid">
          {[
            ['本益比 (P/E)', stock.pe?.toFixed(1) || 'N/A', ''],
            ['股價淨值比 (P/B)', stock.pb?.toFixed(2) || 'N/A', ''],
            ['市值（億）', stock.marketCap ? `${stock.marketCap.toLocaleString()}億` : 'N/A', ''],
            ['成交量', stock.volume ? `${(stock.volume / 1e6).toFixed(2)}M` : 'N/A', ''],
          ].map(([label, val]) => (
            <div key={label} className="fund-item card">
              <div className="fund-label">{label}</div>
              <div className="fund-val">{val}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'institutional' && inst && (
        <div className="card full">
          <div className="card-head"><span className="card-title">法人買賣超</span></div>
          <div className="inst-detail-grid">
            {[
              { label: '外資', value: inst.foreign, color: '#06b6d4' },
              { label: '投信', value: inst.trust, color: '#10b981' },
              { label: '自營商', value: inst.dealer, color: '#f59e0b' },
              { label: '合計', value: inst.total, color: inst.total >= 0 ? '#10b981' : '#ef4444' },
            ].map(item => (
              <div key={item.label} className="inst-detail-card">
                <div className="idc-label">{item.label}</div>
                <div className="idc-value" style={{ color: item.color }}>
                  {item.value >= 0 ? '+' : ''}{(item.value / 1e8).toFixed(2)}億
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'margin' && margin && (
        <div className="card full">
          <div className="card-head"><span className="card-title">融資融券資訊</span></div>
          <div className="margin-detail-grid">
            {[
              { label: '融資餘額', value: `${margin.marginBuy.toLocaleString()} 張`, change: margin.marginBuyChange, up: margin.marginBuyChange >= 0 },
              { label: '融券餘額', value: `${margin.shortSell.toLocaleString()} 張`, change: margin.shortSellChange, up: margin.shortSellChange >= 0 },
              { label: '資/券比', value: `${margin.coverRatio.toFixed(2)}x`, change: null },
            ].map(item => (
              <div key={item.label} className="margin-detail-card">
                <div className="mdc-label">{item.label}</div>
                <div className="mdc-value">{item.value}</div>
                {item.change !== null && (
                  <div className={`mdc-change ${item.up ? 'up' : 'down'}`}>
                    {item.up ? '▲' : '▼'} {Math.abs(item.change).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
