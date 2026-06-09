import { useState } from 'react'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STOCKS } from '../../services/mock.js'

export default function Alerts() {
  const { alerts, addAlert, removeAlert, toggleAlert, liveQuotes } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', type: 'above', price: '' })
  const [hints, setHints] = useState([])

  const enriched = alerts.map(a => {
    const quote = liveQuotes[a.code] || MOCK_STOCKS.find(s => s.code === a.code) || {}
    const currentPrice = quote.price || 0
    const triggered = a.type === 'above' ? currentPrice >= a.price : currentPrice <= a.price
    const distance = a.type === 'above'
      ? ((a.price - currentPrice) / currentPrice * 100)
      : ((currentPrice - a.price) / currentPrice * 100)
    return { ...a, currentPrice, triggered, distance }
  })

  const handleCodeInput = (val) => {
    setForm(f => ({ ...f, code: val }))
    if (val) setHints(MOCK_STOCKS.filter(s => s.code.includes(val) || s.name.includes(val)).slice(0, 5))
    else setHints([])
  }

  const handleAdd = () => {
    if (!form.code || !form.price) return
    addAlert({ code: form.code, name: form.name || form.code, type: form.type, price: parseFloat(form.price), active: true })
    setForm({ code: '', name: '', type: 'above', price: '' })
    setShowAdd(false)
  }

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h2 className="page-title">價格警報</h2>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ 取消' : '＋ 新增警報'}
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
            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="above">價格高於</option>
              <option value="below">價格低於</option>
            </select>
            <input className="form-input" placeholder="目標價格" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            <button className="btn-primary" onClick={handleAdd}>確認</button>
          </div>
        </div>
      )}

      {enriched.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◐</div>
          <div className="empty-text">尚未設定任何警報</div>
          <div className="empty-sub">點擊「新增警報」設定價格通知</div>
        </div>
      ) : (
        <div className="alerts-grid">
          {enriched.map(a => (
            <div key={a.id} className={`alert-card ${a.triggered ? 'triggered' : ''} ${!a.active ? 'inactive' : ''}`}>
              <div className="alert-header">
                <div>
                  <span className="alert-code">{a.code}</span>
                  <span className="alert-name">{a.name}</span>
                </div>
                <div className="alert-actions">
                  <button className={`toggle-btn ${a.active ? 'active' : ''}`} onClick={() => toggleAlert(a.id)}>
                    {a.active ? '●' : '○'}
                  </button>
                  <button className="row-del" onClick={() => removeAlert(a.id)}>✕</button>
                </div>
              </div>
              <div className="alert-condition">
                <span className={`alert-type-badge ${a.type === 'above' ? 'up' : 'down'}`}>
                  {a.type === 'above' ? '▲ 突破' : '▼ 跌破'}
                </span>
                <span className="alert-target-price">{a.price.toFixed(2)}</span>
              </div>
              <div className="alert-current">
                <div className="acl">
                  <span className="ac-label">現價</span>
                  <span className="ac-value">{a.currentPrice.toFixed(2)}</span>
                </div>
                <div className="acl">
                  <span className="ac-label">距離目標</span>
                  <span className={`ac-value ${a.distance >= 0 ? 'muted' : 'up'}`}>
                    {a.distance.toFixed(2)}%
                  </span>
                </div>
              </div>
              {a.triggered && (
                <div className="alert-triggered-banner">
                  ⚡ 已觸發警報！
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
