import { useApp } from '../../store/AppContext.jsx'

const NAV_ITEMS = [
  { id: 'scanner', label: '進場掃描', icon: '⊕' },
  { id: 'dashboard', label: '市場總覽', icon: '▦' },
  { id: 'portfolio', label: '投資組合', icon: '◈' },
  { id: 'watchlist', label: '自選清單', icon: '★' },
  { id: 'institutional', label: '三大法人', icon: '⬡' },
  { id: 'margin', label: '資券變化', icon: '⇅' },
  { id: 'strong', label: '強勢股', icon: '▲' },
  { id: 'bigplayer', label: '大戶股', icon: '◉' },
  { id: 'etf', label: 'ETF 追蹤', icon: '◎' },
  { id: 'trading', label: '買賣統計', icon: '≋' },
  { id: 'alerts', label: '價格警報', icon: '◐' },
  { id: 'news', label: '市場新聞', icon: '◻' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, marketStatus } = useApp()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⬡</span>
        <div>
          <div className="brand-name">STOCKVAULT</div>
          <div className="brand-sub">台股追蹤系統</div>
        </div>
      </div>

      <div className="market-status-badge">
        <span className={`status-dot ${marketStatus === 'open' ? 'open' : ''}`} />
        <span>{marketStatus === 'open' ? '市場開盤中' : '市場已收盤'}</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {activeTab === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-date">
          {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </aside>
  )
}
