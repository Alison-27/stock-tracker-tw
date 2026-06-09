import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STOCKS, MOCK_PRICE_HISTORY } from '../../services/mock.js'

export default function Portfolio() {
  const { portfolio, addPortfolioItem, removePortfolioItem, liveQuotes, openStockDetail } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', shares: '', avgCost: '' })
  const [hints, setHints] = useState([])
  const [activeCode, setActiveCode] = useState(null)

  const enriched = portfolio.map(p => {
    const quote = liveQuotes[p.code] || MOCK_STOCKS.find(s => s.code === p.code) || {}
    const currentPrice = quote.price || p.avgCost
    const marketValue = currentPrice * p.shares
    const cost = p.avgCost * p.shares
    const pnl = marketValue - cost
    const pnlPct = ((currentPrice - p.avgCost) / p.avgCost) * 100
    return { ...p, currentPrice, marketValue, cost, pnl, pnlPct, changePct: quote.changePct || 0 }
  })

  const totalValue = enriched.reduce((s, p) => s + p.marketValue, 0)
  const totalCost = enriched.reduce((s, p) => s + p.cost, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#f97316']

  const handleCodeInput = (val) => {
    setForm(f => ({ ...f, code: val }))
    if (val) setHints(MOCK_STOCKS.filter(s => s.code.includes(val) || s.name.includes(val)).slice(0, 5))
    else setHints([])
  }

  const handleAdd = () => {
    if (!form.code || !form.shares || !form.avgCost) return
    addPortfolioItem({
      code: form.code,
      name: form.name || form.code,
      shares: parseInt(form.shares),
      avgCost: parseFloat(form.avgCost),
      currentPrice: parseFloat(form.avgCost),
    })
    setForm({ code: '', name: '', shares: '', avgCost: '' })
    setShowAdd(false)
  }

  const activeHistory = activeCode ? MOCK_PRICE_HISTORY(activeCode).slice(-30) : []

  return (
    <div className="portfolio-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">投資組合</h2>
          <div className="portfolio-summary">
            <span className="sum-label">總市值</span>
            <span className="sum-value">{totalValue.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 元</span>
            <span className={`sum-pnl ${totalPnl >= 0 ? 'up' : 'down'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ 取消' : '＋ 新增持股'}
        </button>
      </div>

      {showAdd && (
        <div className="add-form card">
          <div className="form-row">
            <div className="autocomplete-wrap">
              <input className="form-input" placeholder="股票代號" value={form.code} onChange={e => handleCodeInput(e.target.value)} />
              {hints.length > 0 && (
                <ul className="autocomplete-list">
                  {hints.map(s => (
                    <li key={s.code} onClick={() => { setForm(f => ({ ...f, code: s.code, name: s.name })); setHints([]) }}>
                      <span className="hint-code">{s.code}</span> <span className="hint-name">{s.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input className="form-input" placeholder="股票名稱" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="form-input" placeholder="股數" type="number" value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))} />
            <input className="form-input" placeholder="平均成本" type="number" value={form.avgCost} onChange={e => setForm(f => ({ ...f, avgCost: e.target.value }))} />
            <button className="btn-primary" onClick={handleAdd}>確認</button>
          </div>
        </div>
      )}

      <div className="portfolio-layout">
        <div className="portfolio-table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>代號</th><th>名稱</th><th>股數</th><th>成本</th>
                <th>現價</th><th>市值</th><th>損益</th><th>損益%</th><th>今日</th><th></th>
              </tr>
            </thead>
            <tbody>
              {enriched.map(p => (
                <tr key={p.code} className={`${activeCode === p.code ? 'active-row' : ''}`}
                  onClick={() => setActiveCode(p.code === activeCode ? null : p.code)}>
                  <td className="code-cell" onClick={(e) => { e.stopPropagation(); openStockDetail(p) }}>{p.code}</td>
                  <td>{p.name}</td>
                  <td className="mono">{p.shares.toLocaleString()}</td>
                  <td className="mono">{p.avgCost.toFixed(2)}</td>
                  <td className={`mono ${p.changePct >= 0 ? 'up' : 'down'}`}>{p.currentPrice.toFixed(2)}</td>
                  <td className="mono">{p.marketValue.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}</td>
                  <td className={`mono ${p.pnl >= 0 ? 'up' : 'down'}`}>
                    {p.pnl >= 0 ? '+' : ''}{p.pnl.toLocaleString('zh-TW', { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`mono ${p.pnlPct >= 0 ? 'up' : 'down'}`}>
                    {p.pnlPct >= 0 ? '+' : ''}{p.pnlPct.toFixed(2)}%
                  </td>
                  <td className={`mono ${p.changePct >= 0 ? 'up' : 'down'}`}>
                    {p.changePct >= 0 ? '+' : ''}{p.changePct.toFixed(2)}%
                  </td>
                  <td>
                    <button className="row-del" onClick={(e) => { e.stopPropagation(); removePortfolioItem(p.code) }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="portfolio-side">
          <div className="card">
            <div className="card-head"><span className="card-title">持股比例</span></div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={enriched} dataKey="marketValue" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={0}>
                  {enriched.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, fontSize: 12, color: '#e2e8f0' }}
                  formatter={(v, n, p) => [`${(p.payload.marketValue / totalValue * 100).toFixed(1)}%`, p.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {enriched.map((p, i) => (
                <div key={p.code} className="legend-item">
                  <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="legend-name">{p.name}</span>
                  <span className="legend-pct">{(p.marketValue / totalValue * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {activeCode && (
            <div className="card">
              <div className="card-head">
                <span className="card-title">{enriched.find(p => p.code === activeCode)?.name} 走勢</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={activeHistory}>
                  <defs>
                    <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4a5568' }} tickFormatter={v => v.slice(5)} interval={6} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#4a5568' }} width={50} />
                  <Tooltip contentStyle={{ background: '#0f1830', border: '1px solid #1e3050', borderRadius: 6, fontSize: 11, color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#stockGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
