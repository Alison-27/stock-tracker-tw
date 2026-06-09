import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { useApp } from '../../store/AppContext.jsx'
import { getPriceHistory, getDailyInstitutional, getStockQuote, getStockMargin, getStockPER, getStockInstitutionalSummary } from '../../services/api.js'
import { MOCK_PRICE_HISTORY, MOCK_INSTITUTIONAL, MOCK_MARGIN, MOCK_STRONG_STOCKS } from '../../services/mock.js'

const TABS = [
  { id: 'price', label: '量價' },
  { id: 'chip', label: '籌碼' },
  { id: 'fundamental', label: '基本' },
  { id: 'institutional', label: '當日法人' },
  { id: 'strategy', label: '交易策略' },
]

// ── 計算均線
function calcMA(data, period) {
  return data.map((d, i) => {
    if (i < period - 1) return null
    const avg = data.slice(i - period + 1, i + 1).reduce((s, x) => s + x.close, 0) / period
    return parseFloat(avg.toFixed(2))
  })
}

// ── 策略分析引擎
function generateStrategy(stock, history, inst, margin) {
  const price = stock.price || 0
  const changePct = stock.changePct || 0
  const strong = MOCK_STRONG_STOCKS.find(s => s.code === stock.code)

  // 計算均線
  const ma5  = history.length >= 5  ? calcMA(history, 5).filter(Boolean).slice(-1)[0]  : null
  const ma10 = history.length >= 10 ? calcMA(history, 10).filter(Boolean).slice(-1)[0] : null
  const ma20 = history.length >= 20 ? calcMA(history, 20).filter(Boolean).slice(-1)[0] : null

  // 近期最高/最低（若歷史均價與即時價偏差 >20%，判定為無效 mock 資料，改用即時價估算）
  const recent20 = history.slice(-20)
  const histAvg = recent20.length
    ? recent20.reduce((s, d) => s + (d.close || d.price), 0) / recent20.length
    : 0
  const histValid = price > 0 && histAvg > 0 && Math.abs(histAvg - price) / price < 0.2

  const recentHigh = histValid && recent20.length
    ? Math.max(...recent20.map(d => d.high || d.price))
    : price * 1.06
  const recentLow = histValid && recent20.length
    ? Math.min(...recent20.map(d => d.low  || d.price))
    : price * 0.94

  // 支撐與壓力
  const support    = parseFloat((recentLow  * 0.995).toFixed(2))
  const resistance = parseFloat((recentHigh * 1.005).toFixed(2))

  // 趨勢判斷
  let trend = 'neutral'
  let trendLabel = '盤整'
  let trendColor = '#ffb830'
  const aboveMA5  = ma5  && price > ma5
  const aboveMA20 = ma20 && price > ma20
  if (changePct >= 2 && aboveMA5 && aboveMA20) { trend = 'bull'; trendLabel = '多頭趨勢'; trendColor = '#00d68a' }
  else if (changePct >= 0.5 && aboveMA5)        { trend = 'weak_bull'; trendLabel = '偏多'; trendColor = '#00d68a' }
  else if (changePct <= -2)                      { trend = 'bear'; trendLabel = '空頭趨勢'; trendColor = '#ff3d5a' }
  else if (changePct < 0 && !aboveMA5)           { trend = 'weak_bear'; trendLabel = '偏空'; trendColor = '#ff3d5a' }

  // 法人立場
  const instBull = inst && inst.total > 0
  const instLabel = inst
    ? inst.total > 5e9 ? '法人大幅買超' : inst.total > 0 ? '法人小幅買超' : '法人賣超'
    : '法人資料無'

  // 進場合理價
  const entryLow  = parseFloat((support * 1.002).toFixed(2))
  const entryHigh = parseFloat((price * 0.995).toFixed(2))
  const stopLoss  = parseFloat((support * 0.97).toFixed(2))
  const target1   = parseFloat((price + (price - stopLoss) * 1.5).toFixed(2))
  const target2   = parseFloat((resistance).toFixed(2))
  const rrRatio   = price > 0 ? ((target1 - price) / (price - stopLoss)).toFixed(1) : '-'

  // 策略類型
  let strategyType = '觀察等待'
  let strategyDesc = '目前訊號不明確，建議觀察量能是否放大再決定進場。'
  if (trend === 'bull' && instBull) {
    strategyType = '順勢多單'
    strategyDesc = '多頭趨勢配合法人買超，可考慮順勢布局多單，以均線扣抵為進場依據。'
  } else if (trend === 'weak_bull') {
    strategyType = '低接策略'
    strategyDesc = '偏多格局但力道偏弱，建議在支撐區低接，控制部位大小。'
  } else if (trend === 'bear') {
    strategyType = '空方觀察'
    strategyDesc = '空頭格局，多單暫緩，等待技術修復後再評估。'
  }

  return {
    trend, trendLabel, trendColor,
    ma5, ma10, ma20,
    support, resistance,
    entryLow, entryHigh,
    stopLoss, target1, target2, rrRatio,
    instLabel, instBull,
    strategyType, strategyDesc,
    marginClean: margin && margin.marginBuyChange < 0,
    rs: strong?.rs,
  }
}

export default function StockAnalysisModal() {
  const { stockModal, closeStockModal } = useApp()
  const [tab, setTab] = useState('price')

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeStockModal() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeStockModal])
  const [history, setHistory] = useState([])
  const [instData, setInstData] = useState([])
  const [loading, setLoading] = useState(false)
  const [liveStock, setLiveStock] = useState(null)
  const [liveInst, setLiveInst] = useState(null)
  const [liveMargin, setLiveMargin] = useState(null)
  const [livePER, setLivePER] = useState(null)

  const stock = liveStock || stockModal

  // 以 stockModal 為開關依據（liveStock 有殘留時不影響關閉）
  useEffect(() => {
    if (!stockModal?.code) {
      setLiveStock(null)
      setHistory([])
      setInstData([])
      setLiveInst(null)
      setLiveMargin(null)
      setLivePER(null)
      return
    }
    setTab('price')
    setHistory([])
    setInstData([])
    setLiveStock(null)
    setLiveInst(null)
    setLiveMargin(null)
    setLivePER(null)
    setLoading(true)
    Promise.all([
      getStockQuote(stockModal.code).catch(() => stockModal),
      getPriceHistory(stockModal.code).catch(() => MOCK_PRICE_HISTORY(stockModal.code)),
      getDailyInstitutional(stockModal.code).catch(() => []),
      getStockInstitutionalSummary(stockModal.code).catch(() => null),
      getStockMargin(stockModal.code).catch(() => null),
      getStockPER(stockModal.code).catch(() => null),
    ]).then(([quote, hist, instRaw, instSummary, margin, per]) => {
      setLiveStock({ ...stockModal, ...quote, ...(per ? { pe: per.pe, pb: per.pb } : {}) })
      setHistory(hist)
      setInstData(instRaw)
      setLiveInst(instSummary)
      setLiveMargin(margin)
      setLivePER(per)
    }).finally(() => setLoading(false))
  }, [stockModal?.code])

  // 優先使用真實 API 資料，fallback 到 mock
  const inst   = liveInst   || MOCK_INSTITUTIONAL.find(i => i.code === stock?.code)
  const margin = liveMargin || MOCK_MARGIN.find(m => m.code === stock?.code)
  const strat  = useMemo(() => {
    if (!stock || history.length === 0) return null
    return generateStrategy(stock, history, inst, margin)
  }, [stock, history, inst, margin])

  if (!stockModal) return null

  const up = stock.changePct >= 0
  const recent = history.slice(-30)
  const latest = history[history.length - 1] || {}

  const fmt = (n) => n != null ? Number(n).toLocaleString() : 'N/A'
  const fmtB = (n) => n ? `${(n / 1e8).toFixed(2)}億` : 'N/A'
  const fmtP = (n) => n != null ? `$${n}` : 'N/A'

  return (
    <div className="modal-overlay" onClick={closeStockModal}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-stock-id">
            <span className="modal-code">{stock.code}</span>
            <span className="modal-name">{stock.name}</span>
          </div>
          <div className="modal-price-block">
            <span className={`modal-price ${up ? 'up' : 'down'}`}>{stock.price?.toFixed(2)}</span>
            <span className={`modal-change ${up ? 'up' : 'down'}`}>
              {up ? '+' : ''}{stock.change?.toFixed(2)} ({up ? '+' : ''}{stock.changePct?.toFixed(2)}%)
            </span>
          </div>
          <button className="modal-close" onClick={closeStockModal}>✕</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`modal-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {loading && <div className="modal-loading">載入中...</div>}

          {/* ── 量價 ── */}
          {tab === 'price' && !loading && (
            <div>
              <div className="modal-ohlcv-row">
                {[
                  ['開盤', latest.open],
                  ['最高', latest.high],
                  ['最低', latest.low],
                  ['收盤', latest.close],
                  ['成交量', latest.volume ? `${(latest.volume / 1e6).toFixed(2)}M` : 'N/A'],
                ].map(([label, val]) => (
                  <div key={label} className="ohlcv-item">
                    <div className="ohlcv-label">{label}</div>
                    <div className="ohlcv-val">{val ?? 'N/A'}</div>
                  </div>
                ))}
              </div>
              <div className="modal-chart-title">近30日股價走勢</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={recent} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={up ? '#00d68a' : '#ff3d5a'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={up ? '#00d68a' : '#ff3d5a'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#5a7090' }} tickFormatter={v => v.slice(5)} interval={Math.floor(recent.length / 6)} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#5a7090' }} width={52} />
                  <Tooltip contentStyle={{ background: '#0f1628', border: '1px solid #1a2840', borderRadius: 6, color: '#c8d4e8', fontSize: 11 }} />
                  <Area type="monotone" dataKey="price" stroke={up ? '#00d68a' : '#ff3d5a'} fill="url(#mGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="modal-chart-title" style={{ marginTop: 8 }}>成交量</div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={recent} margin={{ top: 2, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#5a7090' }} tickFormatter={v => v.slice(5)} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: '#5a7090' }} width={52} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ background: '#0f1628', border: '1px solid #1a2840', borderRadius: 6, color: '#c8d4e8', fontSize: 11 }} formatter={v => [`${(v / 1e6).toFixed(2)}M`]} />
                  <Bar dataKey="volume" fill="#243860" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── 籌碼 ── */}
          {tab === 'chip' && !loading && (
            <div>
              <div className="modal-section-title">三大法人買賣超 <span style={{fontSize:10,color:liveInst?'#00d68a':'#ffb830',fontWeight:400}}>{liveInst ? '● 即時' : '○ 模擬'}</span></div>
              {inst ? (
                <div className="chip-grid">
                  {[
                    { label: '外資', value: inst.foreign, color: '#00c8f0' },
                    { label: '投信', value: inst.trust, color: '#00d68a' },
                    { label: '自營商', value: inst.dealer, color: '#ffb830' },
                    { label: '合計', value: inst.total, color: inst.total >= 0 ? '#00d68a' : '#ff3d5a' },
                  ].map(item => (
                    <div key={item.label} className="chip-card">
                      <div className="chip-label">{item.label}</div>
                      <div className="chip-value" style={{ color: item.color }}>
                        {item.value >= 0 ? '+' : ''}{fmtB(item.value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="modal-no-data">無法人資料</div>}
              <div className="modal-section-title" style={{ marginTop: 16 }}>融資融券 <span style={{fontSize:10,color:liveMargin?'#00d68a':'#ffb830',fontWeight:400}}>{liveMargin ? '● 即時' : '○ 模擬'}</span></div>
              {margin ? (
                <div className="chip-grid">
                  {[
                    { label: '融資餘額', value: `${fmt(margin.marginBuy)} 張`, sub: `${margin.marginBuyChange >= 0 ? '+' : ''}${fmt(margin.marginBuyChange)}`, up: margin.marginBuyChange >= 0 },
                    { label: '融券餘額', value: `${fmt(margin.shortSell)} 張`, sub: `${margin.shortSellChange >= 0 ? '+' : ''}${fmt(margin.shortSellChange)}`, up: margin.shortSellChange >= 0 },
                    { label: '資券比', value: `${margin.coverRatio?.toFixed(2)}x`, sub: null },
                  ].map(item => (
                    <div key={item.label} className="chip-card">
                      <div className="chip-label">{item.label}</div>
                      <div className="chip-value" style={{ color: '#c8d4e8' }}>{item.value}</div>
                      {item.sub && <div className={`chip-sub ${item.up ? 'up' : 'down'}`}>{item.up ? '▲' : '▼'} {item.sub}</div>}
                    </div>
                  ))}
                </div>
              ) : <div className="modal-no-data">無融資券資料</div>}
            </div>
          )}

          {/* ── 基本 ── */}
          {tab === 'fundamental' && !loading && (
            <div>
              <div className="modal-section-title">基本面資訊</div>
              <div className="fund-modal-grid">
                {[
                  ['本益比 P/E', stock.pe?.toFixed(1)],
                  ['股價淨值比 P/B', stock.pb?.toFixed(2)],
                  ['殖利率', livePER?.div ? `${livePER.div.toFixed(2)}%` : null],
                  ['市值', stock.marketCap ? `${stock.marketCap.toLocaleString()} 億` : null],
                  ['現價', stock.price?.toFixed(2)],
                  ['漲跌', `${up ? '+' : ''}${stock.change?.toFixed(2)}`],
                  ['漲跌幅', `${up ? '+' : ''}${stock.changePct?.toFixed(2)}%`],
                  ['成交量', stock.volume ? `${(stock.volume / 1e6).toFixed(2)} M` : null],
                  ['近期最高', latest.high?.toFixed(2)],
                  ['近期最低', latest.low?.toFixed(2)],
                  ['資料日期', livePER?.date || '-'],
                ].map(([label, val]) => (
                  <div key={label} className="fund-modal-item">
                    <div className="fund-modal-label">{label}</div>
                    <div className="fund-modal-val">{val ?? 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 當日法人 ── */}
          {tab === 'institutional' && !loading && (
            <div>
              <div className="modal-section-title">當日法人買賣原始資料（FinMind）</div>
              {instData.length > 0 ? (
                <div className="inst-raw-wrap">
                  <table className="inst-raw-table">
                    <thead>
                      <tr><th>日期</th><th>法人別</th><th>買進</th><th>賣出</th><th>買賣超</th></tr>
                    </thead>
                    <tbody>
                      {instData.slice().reverse().map((row, i) => {
                        const net = (row.buy || 0) - (row.sell || 0)
                        return (
                          <tr key={i}>
                            <td>{row.date}</td>
                            <td>{row.name}</td>
                            <td className="mono">{fmt(row.buy)}</td>
                            <td className="mono">{fmt(row.sell)}</td>
                            <td className={`mono ${net >= 0 ? 'up' : 'down'}`}>{net >= 0 ? '+' : ''}{fmt(net)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="modal-no-data">暫無資料（盤後約 18:00 更新，或 FinMind token 未設定）</div>
              )}
            </div>
          )}

          {/* ── 交易策略 ── */}
          {tab === 'strategy' && !loading && strat && (
            <div className="strategy-wrap">

              {/* 總覽建議 */}
              {(() => {
                const cfg = {
                  bull:      { dot: '#00d68a', label: '建議進場', desc: '多頭趨勢，法人站多，可考慮布局多單' },
                  weak_bull: { dot: '#00c8f0', label: '偏向買進', desc: '偏多格局，建議在支撐區低接，控制部位' },
                  neutral:   { dot: '#ffb830', label: '中性觀察', desc: '多空不明，訊號平淡，等候明確方向再行動' },
                  weak_bear: { dot: '#ff8c42', label: '謹慎操作', desc: '偏空格局，多單暫緩，觀察技術面修復' },
                  bear:      { dot: '#ff3d5a', label: '暫不進場', desc: '空頭趨勢，建議場外觀望，等待轉機訊號' },
                }[strat.trend] || { dot: '#ffb830', label: '中性觀察', desc: '訊號不明確，建議觀察量能放大後再決定' }
                return (
                  <div className="strat-overview" style={{ borderColor: cfg.dot + '50', background: cfg.dot + '0d' }}>
                    <div className="strat-overview-left">
                      <span className="strat-ov-dot" style={{ background: cfg.dot }} />
                      <div>
                        <div className="strat-ov-label" style={{ color: cfg.dot }}>{cfg.label}</div>
                        <div className="strat-ov-desc">{cfg.desc}</div>
                      </div>
                    </div>
                    <div className="strat-ov-score" style={{ color: strat.trendColor }}>
                      <span className="strat-ov-trend">{strat.trendLabel}</span>
                    </div>
                  </div>
                )
              })()}

              {/* 1. 趨勢判斷 */}
              <div className="strat-section">
                <div className="strat-section-title">① 趨勢判斷</div>
                <div className="strat-trend-row">
                  <span className="trend-badge" style={{ color: strat.trendColor, borderColor: strat.trendColor + '40', background: strat.trendColor + '15' }}>
                    {strat.trendLabel}
                  </span>
                  <div className="trend-ma-row">
                    {strat.ma5  && <span className="ma-tag">MA5 <b>{strat.ma5}</b></span>}
                    {strat.ma10 && <span className="ma-tag">MA10 <b>{strat.ma10}</b></span>}
                    {strat.ma20 && <span className="ma-tag">MA20 <b>{strat.ma20}</b></span>}
                  </div>
                </div>
                <div className="strat-rows">
                  <div className="strat-row"><span className="sr-k">法人動向</span><span className="sr-v" style={{ color: strat.instBull ? '#00d68a' : '#ff3d5a' }}>{strat.instLabel}</span></div>
                  <div className="strat-row"><span className="sr-k">籌碼狀態</span><span className="sr-v" style={{ color: strat.marginClean ? '#00d68a' : '#ffb830' }}>{strat.marginClean ? '融資減少（籌碼乾淨）' : '融資持平或增加'}</span></div>
                  {strat.rs && <div className="strat-row"><span className="sr-k">強勢指標</span><span className="sr-v">RS 強度 {strat.rs}</span></div>}
                </div>
              </div>

              {/* 2. 關鍵價位 */}
              <div className="strat-section">
                <div className="strat-section-title">② 關鍵價位</div>
                <div className="key-price-grid">
                  {[
                    { label: '壓力位', val: strat.resistance, color: '#ff3d5a' },
                    { label: '現價',   val: stock.price?.toFixed(2), color: up ? '#00d68a' : '#ff3d5a' },
                    { label: '支撐位', val: strat.support, color: '#00c8f0' },
                    { label: '止損位', val: strat.stopLoss, color: '#ff3d5a' },
                  ].map(item => (
                    <div key={item.label} className="kp-item">
                      <div className="kp-label">{item.label}</div>
                      <div className="kp-val" style={{ color: item.color }}>${item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 進場合理價格 */}
              <div className="strat-section">
                <div className="strat-section-title">③ 進場合理價格</div>
                <div className="entry-zone">
                  <div className="ez-bar">
                    <div className="ez-label left">低估區</div>
                    <div className="ez-range">
                      <span className="ez-low">${strat.entryLow}</span>
                      <span className="ez-arrow">～</span>
                      <span className="ez-high">${strat.entryHigh}</span>
                    </div>
                    <div className="ez-label right">合理區上緣</div>
                  </div>
                  <div className="ez-note">建議在此區間分批進場，避免追高</div>
                </div>
              </div>

              {/* 4. 交易策略 */}
              <div className="strat-section">
                <div className="strat-section-title">④ 交易策略</div>
                <div className="strat-strategy-box">
                  <span className="strategy-type-badge">{strat.strategyType}</span>
                  <p className="strategy-desc">{strat.strategyDesc}</p>
                </div>
              </div>

              {/* 5. 風險管理 */}
              <div className="strat-section">
                <div className="strat-section-title">⑤ 風險管理</div>
                <div className="strat-rows">
                  <div className="strat-row"><span className="sr-k">停損點</span><span className="sr-v down">${strat.stopLoss}（跌破支撐 -3%）</span></div>
                  <div className="strat-row"><span className="sr-k">目標一</span><span className="sr-v up">${strat.target1}（風報比 1:1.5）</span></div>
                  <div className="strat-row"><span className="sr-k">目標二</span><span className="sr-v up">${strat.target2}（近期壓力位）</span></div>
                  <div className="strat-row"><span className="sr-k">風報比</span><span className="sr-v" style={{ color: Number(strat.rrRatio) >= 1.5 ? '#00d68a' : '#ffb830' }}>1 : {strat.rrRatio}</span></div>
                  <div className="strat-row"><span className="sr-k">建議倉位</span><span className="sr-v">{Number(strat.rrRatio) >= 2 ? '可至 30% 倉位' : Number(strat.rrRatio) >= 1.5 ? '建議 20% 倉位' : '小倉試探，10% 以內'}</span></div>
                </div>
              </div>

              {/* 6. 進場計畫(範例) */}
              <div className="strat-section">
                <div className="strat-section-title">⑥ 進場計畫（範例）</div>
                <div className="plan-box">
                  <div className="plan-step">
                    <span className="ps-num">第一筆</span>
                    <span className="ps-text">價格回到 <b>${strat.entryLow}</b> 附近，買進半倉（觀察量能是否縮量）</span>
                  </div>
                  <div className="plan-step">
                    <span className="ps-num">第二筆</span>
                    <span className="ps-text">站穩 <b>${strat.entryHigh}</b> 且量能放大，加碼至全倉</span>
                  </div>
                  <div className="plan-step">
                    <span className="ps-num">停損</span>
                    <span className="ps-text down">收盤跌破 <b>${strat.stopLoss}</b>，無條件出場</span>
                  </div>
                  <div className="plan-step">
                    <span className="ps-num">獲利</span>
                    <span className="ps-text up">到達 <b>${strat.target1}</b> 先出半倉，剩餘續抱至 ${strat.target2}</span>
                  </div>
                </div>
              </div>

              {/* 7. 執行紀律 */}
              <div className="strat-section">
                <div className="strat-section-title">⑦ 執行紀律</div>
                <div className="discipline-list">
                  {[
                    '停損必須嚴格執行，不可因情感因素凍結',
                    '不追高，只在計畫價位進場',
                    '分批進場，降低單筆風險',
                    '量能不配合時，寧可不進場',
                    '有倉位時每日檢視法人動態',
                    '獲利超過 15% 考慮部分出場鎖利',
                  ].map((rule, i) => (
                    <div key={i} className="disc-item">
                      <span className="disc-dot" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. 觀察重點 */}
              <div className="strat-section">
                <div className="strat-section-title">⑧ 觀察重點</div>
                <div className="strat-rows">
                  <div className="strat-row"><span className="sr-k">量能</span><span className="sr-v">成交量需較前日放大，確認方向有效</span></div>
                  <div className="strat-row"><span className="sr-k">法人</span><span className="sr-v">外資連續買超 3 日以上為強烈訊號</span></div>
                  <div className="strat-row"><span className="sr-k">均線</span><span className="sr-v">MA5 &gt; MA10 &gt; MA20 多頭排列最佳</span></div>
                  <div className="strat-row"><span className="sr-k">籌碼</span><span className="sr-v">融資持續減少代表散戶出清、籌碼乾淨</span></div>
                  <div className="strat-row"><span className="sr-k">大盤</span><span className="sr-v">加權指數若走弱，個股多單需降低倉位</span></div>
                </div>
              </div>

              {/* 9. 備註・核心原則 */}
              <div className="strat-section">
                <div className="strat-section-title">⑨ 備註・核心原則</div>
                <div className="core-principle-box">
                  <div className="cp-item accent">
                    <span className="cp-icon">◈</span>
                    <span>趨勢為王：順勢而為，不與市場對抗</span>
                  </div>
                  <div className="cp-item">
                    <span className="cp-icon">◈</span>
                    <span>資金管理優先於選股，單筆虧損不超過總資金 2%</span>
                  </div>
                  <div className="cp-item">
                    <span className="cp-icon">◈</span>
                    <span>計畫先行：沒有計畫不進場，有計畫就按計畫執行</span>
                  </div>
                  <div className="cp-item">
                    <span className="cp-icon">◈</span>
                    <span>此分析為輔助工具，不構成投資建議，請自行承擔風險</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {tab === 'strategy' && !loading && !strat && (
            <div className="modal-no-data">資料載入中，請稍後...</div>
          )}
        </div>
      </div>
    </div>
  )
}
