import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_INDICES } from '../../services/mock.js'

export default function TopBar() {
  const { searchQuery, searchResults, isSearching, handleSearch, openStockDetail, openStockModal, finmindToken, setFinmindToken } = useApp()
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tokenInput, setTokenInput] = useState(finmindToken)
  const searchRef = useRef(null)

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.search-wrapper')) setShowSearch(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-indices">
        {MOCK_INDICES.map(idx => (
          <div key={idx.name} className="index-pill">
            <span className="index-name">{idx.name}</span>
            <span className="index-value">{idx.value.toLocaleString()}</span>
            <span className={`index-change ${idx.changePct >= 0 ? 'up' : 'down'}`}>
              {idx.changePct >= 0 ? '+' : ''}{idx.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div className="topbar-actions">
        <div className="search-wrapper">
          <button className="icon-btn" onClick={() => setShowSearch(v => !v)} title="搜尋股票">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          {showSearch && (
            <div className="search-dropdown">
              <input
                ref={searchRef}
                className="search-input"
                placeholder="輸入股票代號或名稱..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
              {isSearching && <div className="search-hint">搜尋中...</div>}
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map(s => (
                    <li key={s.code} className="search-result-item" onClick={() => { openStockModal(s); setShowSearch(false) }}>
                      <span className="result-code">{s.code}</span>
                      <span className="result-name">{s.name}</span>
                      <span className={`result-price ${s.changePct >= 0 ? 'up' : 'down'}`}>
                        {s.price?.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button className="icon-btn" onClick={() => setShowSettings(v => !v)} title="API設定">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93a10 10 0 0 1 1.41 1.41M4.93 4.93A10 10 0 0 0 3.52 6.34M19.07 19.07a10 10 0 0 1-1.41 1.41M4.93 19.07a10 10 0 0 0 1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
          </svg>
        </button>

        {showSettings && (
          <div className="settings-popup">
            <div className="settings-title">FinMind API Token</div>
            <input
              className="settings-input"
              type="text"
              placeholder="輸入 FinMind Token（可選）"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
            />
            <button className="settings-save" onClick={() => { setFinmindToken(tokenInput); setShowSettings(false) }}>
              儲存
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
