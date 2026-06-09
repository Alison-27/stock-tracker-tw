import { useState } from 'react'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STOCKS } from '../../services/mock.js'

export default function Watchlist() {
  const {
    watchlistGroups, addWatchlistGroup, removeWatchlistGroup, renameWatchlistGroup,
    addStockToGroup, removeStockFromGroup, liveQuotes, openStockDetail
  } = useApp()

  const [activeGroup, setActiveGroup] = useState(watchlistGroups[0]?.id)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [editingGroup, setEditingGroup] = useState(null)
  const [editName, setEditName] = useState('')
  const [showAddStock, setShowAddStock] = useState(false)
  const [stockQuery, setStockQuery] = useState('')
  const [stockHints, setStockHints] = useState([])

  const currentGroup = watchlistGroups.find(g => g.id === activeGroup)

  const getQuote = (code) => {
    return liveQuotes[code] || MOCK_STOCKS.find(s => s.code === code) || { code, name: code, price: 0, changePct: 0, change: 0, volume: 0 }
  }

  const handleStockSearch = (val) => {
    setStockQuery(val)
    if (val) setStockHints(MOCK_STOCKS.filter(s => s.code.includes(val) || s.name.includes(val)).slice(0, 6))
    else setStockHints([])
  }

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return
    addWatchlistGroup(newGroupName.trim())
    setNewGroupName('')
    setShowNewGroup(false)
  }

  const handleRename = (id) => {
    renameWatchlistGroup(id, editName)
    setEditingGroup(null)
  }

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h2 className="page-title">自選清單</h2>
        <button className="btn-primary" onClick={() => setShowNewGroup(v => !v)}>
          {showNewGroup ? '✕ 取消' : '＋ 新增群組'}
        </button>
      </div>

      {showNewGroup && (
        <div className="new-group-form card">
          <input
            className="form-input"
            placeholder="群組名稱"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
            autoFocus
          />
          <button className="btn-primary" onClick={handleAddGroup}>建立</button>
        </div>
      )}

      <div className="watchlist-layout">
        {/* Group Tabs */}
        <div className="group-sidebar">
          <div className="group-sidebar-title">群組</div>
          {watchlistGroups.map(g => (
            <div
              key={g.id}
              className={`group-tab ${activeGroup === g.id ? 'active' : ''}`}
              onClick={() => setActiveGroup(g.id)}
            >
              {editingGroup === g.id ? (
                <input
                  className="group-rename-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename(g.id)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(g.id)}
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="group-name">{g.name}</span>
                  <span className="group-count">{g.stocks.length}</span>
                </>
              )}
              {activeGroup === g.id && (
                <div className="group-actions">
                  <button className="group-action-btn" title="重新命名"
                    onClick={(e) => { e.stopPropagation(); setEditingGroup(g.id); setEditName(g.name) }}>✎</button>
                  <button className="group-action-btn del" title="刪除群組"
                    onClick={(e) => { e.stopPropagation(); removeWatchlistGroup(g.id); setActiveGroup(watchlistGroups[0]?.id) }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stock List */}
        <div className="group-content">
          {currentGroup && (
            <>
              <div className="group-content-header">
                <span className="group-content-title">{currentGroup.name}</span>
                <button className="btn-secondary" onClick={() => setShowAddStock(v => !v)}>
                  {showAddStock ? '取消' : '＋ 加入股票'}
                </button>
              </div>

              {showAddStock && (
                <div className="add-stock-form">
                  <div className="autocomplete-wrap">
                    <input
                      className="form-input"
                      placeholder="搜尋股票代號或名稱"
                      value={stockQuery}
                      onChange={e => handleStockSearch(e.target.value)}
                      autoFocus
                    />
                    {stockHints.length > 0 && (
                      <ul className="autocomplete-list">
                        {stockHints.map(s => (
                          <li key={s.code} onClick={() => {
                            addStockToGroup(currentGroup.id, s.code, s.name)
                            setStockQuery('')
                            setStockHints([])
                            setShowAddStock(false)
                          }}>
                            <span className="hint-code">{s.code}</span>
                            <span className="hint-name">{s.name}</span>
                            <span className={`hint-price ${s.changePct >= 0 ? 'up' : 'down'}`}>{s.price?.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {currentGroup.stocks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">★</div>
                  <div className="empty-text">此群組尚無股票</div>
                  <div className="empty-sub">點擊「加入股票」開始追蹤</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>代號</th><th>名稱</th><th>現價</th><th>漲跌</th><th>漲跌幅</th>
                      <th>成交量</th><th>本益比</th><th>股價淨值比</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGroup.stocks.map(code => {
                      const s = getQuote(code)
                      return (
                        <tr key={code} onClick={() => openStockDetail(s)}>
                          <td className="code-cell">{s.code}</td>
                          <td>{s.name}</td>
                          <td className={`mono ${s.changePct >= 0 ? 'up' : 'down'}`}>{s.price?.toFixed(2)}</td>
                          <td className={`mono ${s.change >= 0 ? 'up' : 'down'}`}>
                            {s.change >= 0 ? '+' : ''}{s.change?.toFixed(2)}
                          </td>
                          <td className={`mono ${s.changePct >= 0 ? 'up' : 'down'}`}>
                            {s.changePct >= 0 ? '+' : ''}{s.changePct?.toFixed(2)}%
                          </td>
                          <td className="mono">{s.volume ? (s.volume / 1e3).toFixed(0) + 'K' : '-'}</td>
                          <td className="mono">{s.pe?.toFixed(1) || '-'}</td>
                          <td className="mono">{s.pb?.toFixed(2) || '-'}</td>
                          <td>
                            <button className="row-del" onClick={(e) => { e.stopPropagation(); removeStockFromGroup(currentGroup.id, code) }}>✕</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
