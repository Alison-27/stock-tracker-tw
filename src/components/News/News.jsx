import { useState, useEffect } from 'react'
import { getMarketNews } from '../../services/api.js'
import { MOCK_NEWS } from '../../services/mock.js'
import { useApp } from '../../store/AppContext.jsx'

const SENTIMENT_COLORS = { positive: '#10b981', negative: '#ef4444', neutral: '#94a3b8' }
const SENTIMENT_LABELS = { positive: '利多', negative: '利空', neutral: '中性' }

export default function News() {
  const { openStockDetail, liveQuotes } = useApp()
  const [news, setNews] = useState(MOCK_NEWS)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMarketNews().then(d => {
      if (Array.isArray(d) && d.length) setNews(d)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = news.filter(n => {
    if (filter === 'positive') return n.sentiment === 'positive'
    if (filter === 'negative') return n.sentiment === 'negative'
    return true
  })

  return (
    <div className="news-page">
      <div className="page-header">
        <h2 className="page-title">市場新聞</h2>
        <div className="filter-tabs">
          {[['all', '全部'], ['positive', '利多'], ['negative', '利空']].map(([v, l]) => (
            <button key={v} className={`filter-tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="news-list">
        {filtered.map(n => (
          <div key={n.id} className="news-item card">
            <div className="news-meta">
              <span className="news-source">{n.source}</span>
              <span className="news-time">{n.time}</span>
              {n.category && <span className="news-category">{n.category}</span>}
              <span className="news-sentiment" style={{
                color: SENTIMENT_COLORS[n.sentiment],
                background: `${SENTIMENT_COLORS[n.sentiment]}15`,
                border: `1px solid ${SENTIMENT_COLORS[n.sentiment]}30`
              }}>
                {SENTIMENT_LABELS[n.sentiment]}
              </span>
            </div>
            <div className="news-title">{n.title}</div>
            {n.stock && (
              <button className="news-stock-btn" onClick={() => {
                const s = liveQuotes[n.stock] || { code: n.stock, name: n.stock }
                openStockDetail(s)
              }}>
                ▸ {n.stock}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
