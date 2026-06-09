import { useState, useMemo } from 'react'
import { useApp } from '../../store/AppContext.jsx'
import { MOCK_STOCKS, MOCK_INSTITUTIONAL, MOCK_MARGIN, MOCK_STRONG_STOCKS } from '../../services/mock.js'

const HOT_30 = [...MOCK_STOCKS].sort((a, b) => b.volume - a.volume).slice(0, 30)

function scoreStock(s) {
  let score = 0
  const signals = []

  if (s.changePct >= 3)      { score += 3; signals.push({ label: '強勢上漲', color: '#00d68a' }) }
  else if (s.changePct >= 1) { score += 2; signals.push({ label: '溫和上漲', color: '#00d68a' }) }
  else if (s.changePct >= 0) { score += 1 }
  else                        { signals.push({ label: '下跌', color: '#ff3d5a' }) }

  if (s.volume >= 20_000_000)     { score += 2; signals.push({ label: '爆量', color: '#ffb830' }) }
  else if (s.volume >= 8_000_000) { score += 1; signals.push({ label: '放量', color: '#f59e0b' }) }

  const inst = MOCK_INSTITUTIONAL.find(i => i.code === s.code)
  if (inst) {
    if (inst.total > 5_000_000_000)  { score += 2; signals.push({ label: '法人大買', color: '#00c8f0' }) }
    else if (inst.total > 0)         { score += 1; signals.push({ label: '法人買超', color: '#00c8f0' }) }
    else                             { signals.push({ label: '法人賣超', color: '#ff3d5a' }) }
  }

  const margin = MOCK_MARGIN.find(m => m.code === s.code)
  if (margin) {
    if (margin.marginBuyChange < 0) { score += 1; signals.push({ label: '籌碼乾淨', color: '#7c5cff' }) }
    if (margin.coverRatio >= 3)     { score += 1; signals.push({ label: '資券比高', color: '#7c5cff' }) }
  }

  const strong = MOCK_STRONG_STOCKS.find(ss => ss.code === s.code)
  if (strong?.rs >= 85) { score += 1; signals.push({ label: `RS ${strong.rs}`, color: '#ffb830' }) }

  return { score, signals }
}

const GRADE = [
  { min: 8, label: '強力進場', dot: '#00d68a', border: 'rgba(0,214,138,0.35)', bg: 'rgba(0,214,138,0.06)' },
  { min: 6, label: '建議進場', dot: '#00c8f0', border: 'rgba(0,200,240,0.30)', bg: 'rgba(0,200,240,0.05)' },
  { min: 4, label: '觀察中',   dot: '#ffb830', border: 'rgba(255,184,48,0.25)', bg: 'rgba(255,184,48,0.04)' },
  { min: 0, label: '暫不進場', dot: '#3a4a60', border: 'rgba(58,74,96,0.4)',   bg: 'transparent' },
]
function getGrade(score) { return GRADE.find(g => score >= g.min) }

export default function HotScanner() {
  const { openStockModal } = useApp()
  const [sortBy, setSortBy] = useState('score')
  const [filter, setFilter] = useState('all')

  const scored = useMemo(() => HOT_30.map(s => {
    const { score, signals } = scoreStock(s)
    return { ...s, score, signals, grade: getGrade(score) }
  }), [])

  const sorted = useMemo(() => {
    let list = [...scored]
    if (filter === 'strong') list = list.filter(s => s.score >= 6)
    if (filter === 'up')     list = list.filter(s => s.changePct > 0)
    if (sortBy === 'score')  list.sort((a, b) => b.score - a.score)
    else if (sortBy === 'change') list.sort((a, b) => b.changePct - a.changePct)
    else if (sortBy === 'volume') list.sort((a, b) => b.volume - a.volume)
    return list
  }, [scored, sortBy, filter])

  const topCount = scored.filter(s => s.score >= 6).length

  return (
    <div className="scanner-page">
      {/* 標題列 */}
      <div className="page-header">
        <h2 className="page-title">本日進場掃描</h2>
        <div className="scanner-summary">
          {[
            { val: topCount, label: '適合進場', color: '#00d68a' },
            { val: scored.length, label: '掃描檔數', color: null },
            { val: (scored.reduce((a, s) => a + s.score, 0) / scored.length).toFixed(1), label: '平均分數', color: null },
          ].map(item => (
            <div key={item.label} className="scanner-stat">
              <span className="ss-val" style={item.color ? { color: item.color } : {}}>{item.val}</span>
              <span className="ss-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 評分說明 */}
      <div className="scanner-legend card">
        <div className="legend-title">評分標準</div>
        <div className="legend-items">
          {[
            ['漲幅', '≥3% +3分，≥1% +2分'],
            ['成交量', '≥2千萬 +2分，≥800萬 +1分'],
            ['法人', '買超5億+ +2分，買超 +1分'],
            ['籌碼', '融資減少 +1分，資券比高 +1分'],
            ['強勢RS', 'RS≥85 +1分'],
          ].map(([k, v]) => (
            <div key={k} className="legend-item">
              <span className="li-key">{k}</span>
              <span className="li-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 過濾與排序 */}
      <div className="scanner-controls">
        <div className="scanner-filters">
          {[['all','全部'],['strong','適合進場'],['up','今日上漲']].map(([v,l]) => (
            <button key={v} className={`filter-btn ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <div className="scanner-sorts">
          <span className="sort-label">排序：</span>
          {[['score','評分'],['change','漲幅'],['volume','成交量']].map(([v,l]) => (
            <button key={v} className={`sort-btn ${sortBy===v?'active':''}`} onClick={() => setSortBy(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="scanner-cards">
        {sorted.map((s, idx) => {
          const up = s.changePct >= 0
          return (
            <div
              key={s.code}
              className="sc-card"
              style={{ borderColor: s.grade.border, background: s.grade.bg }}
              onClick={() => openStockModal(s)}
            >
              {/* 左：序號 + 股票資訊 */}
              <div className="sc-left">
                <span className="sc-rank">{idx + 1}</span>
                <div className="sc-identity">
                  <span className="sc-code">{s.code}</span>
                  <span className="sc-name">{s.name}</span>
                </div>
              </div>

              {/* 中：價格 */}
              <div className="sc-price-block">
                <span className={`sc-price ${up ? 'up' : 'down'}`}>{s.price?.toFixed(2)}</span>
                <span className={`sc-change ${up ? 'up' : 'down'}`}>
                  {up ? '▲' : '▼'} {Math.abs(s.changePct).toFixed(2)}%
                </span>
              </div>

              {/* 中右：訊號 tags */}
              <div className="sc-signals">
                {s.signals.slice(0, 3).map((sig, i) => (
                  <span key={i} className="sc-tag" style={{ color: sig.color, borderColor: sig.color + '50', background: sig.color + '12' }}>
                    {sig.label}
                  </span>
                ))}
              </div>

              {/* 右：建議 badge + 分數 */}
              <div className="sc-right">
                <div className="sc-badge" style={{ color: s.grade.dot, borderColor: s.grade.dot + '60', background: s.grade.dot + '18' }}>
                  <span className="sc-dot" style={{ background: s.grade.dot }} />
                  {s.grade.label}
                </div>
                <div className="sc-score-row">
                  <div className="sc-bar-wrap">
                    <div className="sc-bar-fill" style={{ width: `${s.score / 10 * 100}%`, background: s.grade.dot }} />
                  </div>
                  <span className="sc-score-num" style={{ color: s.grade.dot }}>{s.score}<span className="sc-score-max">/10</span></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
