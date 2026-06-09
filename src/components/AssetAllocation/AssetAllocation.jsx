import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STOCKS } from '../../services/mock.js'

function fmt(n) {
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)}億`
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)}萬`
  return n.toLocaleString()
}

export default function AssetAllocation() {
  const { assetAllocation, addAssetItem, removeAssetItem, liveQuotes } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', value: '' })
  const [searchHints, setSearchHints] = useState([])

  const total = assetAllocation.reduce((s, a) => s + a.value, 0)

  const enriched = assetAllocation.map(a => {
    const quote = liveQuotes[a.code]
    const changePct = quote?.changePct || 0
    return { ...a, changePct, pct: total > 0 ? (a.value / total) * 100 : 0 }
  })

  const handleCodeInput = (val) => {
    setForm(f => ({ ...f, code: val }))
    if (val.length >= 1) {
      const hints = MOCK_STOCKS.filter(s => s.code.includes(val) || s.name.includes(val)).slice(0, 5)
      setSearchHints(hints)
    } else {
      setSearchHints([])
    }
  }

  const selectHint = (stock) => {
    setForm({ code: stock.code, name: stock.name, value: '' })
    setSearchHints([])
  }

  const handleAdd = () => {
    if (!form.code || !form.value) return
    addAssetItem({
      code: form.code,
      name: form.name || form.code,
      value: parseFloat(form.value)
    })
    setForm({ code: '', name: '', value: '' })
    setShowAdd(false)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="chart-tooltip">
        <div className="tt-name">{d.name}</div>
        <div className="tt-value">{fmt(d.value)}</div>
        <div className="tt-pct">{d.pct.toFixed(1)}%</div>
      </div>
    )
  }

  return (
    <section className="asset-allocation-bar">
      <div className="aa-header">
        <div className="aa-title">
          <span className="aa-icon">◈</span>
          <span>資產配置</span>
          <span className="aa-total">{fmt(total)}</span>
        </div>
        <button className="aa-add-btn" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ 取消' : '＋ 新增'}
        </button>
      </div>

      <div className="aa-content">
        <div className="aa-chart">
          <ResponsiveContainer width={160} height={120}>
            <PieChart>
              <Pie data={enriched} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={52} strokeWidth={0}>
                {enriched.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="aa-items">
          {enriched.map(item => (
            <div key={item.code} className="aa-item">
              <div className="aa-dot" style={{ background: item.color }} />
              <div className="aa-item-info">
                <span className="aa-item-name">{item.name}</span>
                <span className="aa-item-code">{item.code !== 'cash' ? item.code : ''}</span>
              </div>
              <div className="aa-item-right">
                <span className="aa-item-value">{fmt(item.value)}</span>
                <span className="aa-item-pct">{item.pct.toFixed(1)}%</span>
                {item.code !== 'cash' && item.changePct !== 0 && (
                  <span className={`aa-item-chg ${item.changePct >= 0 ? 'up' : 'down'}`}>
                    {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
              <button className="aa-remove" onClick={() => removeAssetItem(item.code)}>✕</button>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="aa-form">
            <div className="aa-form-row">
              <div className="aa-autocomplete">
                <input
                  className="aa-input"
                  placeholder="股票代號或名稱"
                  value={form.code}
                  onChange={e => handleCodeInput(e.target.value)}
                />
                {searchHints.length > 0 && (
                  <ul className="aa-hints">
                    {searchHints.map(s => (
                      <li key={s.code} onClick={() => selectHint(s)}>
                        <span className="hint-code">{s.code}</span>
                        <span className="hint-name">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input
                className="aa-input"
                placeholder="市值（元）"
                type="number"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              />
              <button className="aa-confirm-btn" onClick={handleAdd}>確認</button>
            </div>
            <div className="aa-form-hint">
              也可輸入「cash」加入現金部位
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
