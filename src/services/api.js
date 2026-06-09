import {
  MOCK_STOCKS, MOCK_INSTITUTIONAL, MOCK_MARGIN, MOCK_STRONG_STOCKS,
  MOCK_BIG_PLAYERS, MOCK_ETF, MOCK_TRADING_STATS, MOCK_NEWS,
  MOCK_PRICE_HISTORY, MOCK_INDICES
} from './mock.js'

const isDev = import.meta.env.DEV

// TWSE OpenAPI 有 CORS，可直接呼叫
const TWSE_BASE   = isDev ? '/api/twse' : 'https://openapi.twse.com.tw/v1'
// FinMind 直接呼叫（需 token 才能使用大多數資料集）
const FINMIND_BASE = isDev ? '/api/finmind' : 'https://api.finmindtrade.com/api/v4'
// TWSE 歷史行情（月份資料，有 CORS）
const TWSE_HIST   = 'https://www.twse.com.tw/exchangeReport/STOCK_DAY'

function getToken() {
  try { return localStorage.getItem('finmind_token') || '' } catch { return '' }
}

async function fetchTWSE(endpoint) {
  const res = await fetch(`${TWSE_BASE}${endpoint}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`TWSE ${res.status}`)
  return res.json()
}

async function fetchFinmind(dataset, params = {}) {
  const token = getToken()
  const q = new URLSearchParams({ dataset, ...(token ? { token } : {}), ...params })
  const res = await fetch(`${FINMIND_BASE}/data?${q}`)
  if (!res.ok) throw new Error(`FinMind ${res.status}`)
  return res.json()
}

// ── 即時報價：TWSE 即時盤中資訊
async function fetchTWSEQuote(code) {
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_${code}.tw&json=1&delay=0`
  const res = await fetch(url)
  if (!res.ok) throw new Error('MIS error')
  const data = await res.json()
  const item = data?.msgArray?.[0]
  if (!item) throw new Error('No data')
  const price = parseFloat(item.z || item.y)   // z=最新成交, y=昨收
  const prev  = parseFloat(item.y)
  return {
    code,
    name:      item.n,
    price,
    change:    parseFloat((price - prev).toFixed(2)),
    changePct: parseFloat(((price - prev) / prev * 100).toFixed(2)),
    volume:    parseInt(item.v || 0) * 1000,
  }
}

// ── 搜尋：優先從本地股票庫找，找不到再打 TWSE
export async function searchStocks(query) {
  if (!query) return []
  const q = query.trim()
  // 1. 本地庫（包含 ETF 代號）
  const local = MOCK_STOCKS.filter(s =>
    s.code.startsWith(q) || s.name.includes(q)
  ).slice(0, 10)
  if (local.length >= 5) return local

  // 2. 試呼叫 TWSE 全股清單補充
  try {
    const data = await fetchTWSE('/opendata/t187ap03_L')   // 上市公司基本資料
    if (Array.isArray(data)) {
      return data
        .filter(d => d['公司代號']?.startsWith(q) || d['公司簡稱']?.includes(q))
        .slice(0, 10)
        .map(d => ({
          code:      d['公司代號'],
          name:      d['公司簡稱'],
          price:     0,
          changePct: 0,
          change:    0,
        }))
    }
  } catch { /* fallback 到本地 */ }
  return local
}

// ── 單股報價
export async function getStockQuote(code) {
  try { return await fetchTWSEQuote(code) }
  catch { return MOCK_STOCKS.find(s => s.code === code) || { code, name: code, price: 0, change: 0, changePct: 0 } }
}

export async function getMultipleQuotes(codes) {
  return Promise.all(codes.map(c => getStockQuote(c)))
}

// ── 全股清單
export async function getAllStocks() {
  try {
    const data = await fetchTWSE('/opendata/t187ap03_L')
    if (!Array.isArray(data)) return MOCK_STOCKS
    return data.map(d => ({
      code:      d['公司代號'] || '',
      name:      d['公司簡稱'] || '',
      price:     0, change: 0, changePct: 0,
    })).filter(d => d.code)
  } catch {
    return MOCK_STOCKS
  }
}

// ── 價格歷史：TWSE 月份資料（3個月）
export async function getPriceHistory(code) {
  try {
    const months = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}01`
      const url = `${TWSE_HIST}?response=json&date=${dateStr}&stockNo=${code}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.stat === 'OK' && Array.isArray(json.data)) {
        json.data.forEach(row => {
          // row: [日期, 成交股數, 成交金額, 開盤, 最高, 最低, 收盤, 漲跌, 成交筆數]
          const close = parseFloat(row[6]?.replace(/,/g, ''))
          if (!close) return
          months.push({
            date:   row[0].replace(/\//g, '-').replace(/^(\d+)/, y => String(parseInt(y) + 1911)),
            open:   parseFloat(row[3]?.replace(/,/g, '')) || close,
            high:   parseFloat(row[4]?.replace(/,/g, '')) || close,
            low:    parseFloat(row[5]?.replace(/,/g, '')) || close,
            close,
            price:  close,
            volume: parseInt(row[1]?.replace(/,/g, '')) || 0,
          })
        })
      }
    }
    if (months.length > 0) return months
    throw new Error('no data')
  } catch {
    return MOCK_PRICE_HISTORY(code)
  }
}

// ── 三大法人
export async function getInstitutionalInvestors() {
  try {
    const data = await fetchTWSE('/fund/TWT38U')
    if (Array.isArray(data) && data.length) return data
    throw new Error('empty')
  } catch {
    return MOCK_INSTITUTIONAL
  }
}

// ── 資券
export async function getMarginTrading() {
  try {
    const data = await fetchTWSE('/exchangeReport/MI_MARGN')
    if (Array.isArray(data) && data.length) return data
    throw new Error('empty')
  } catch {
    return MOCK_MARGIN
  }
}

// ── 強勢股（需 FinMind token）
export async function getStrongStocks() {
  try {
    const data = await fetchFinmind('TaiwanStockStrongStock')
    return data.data?.length ? data.data : MOCK_STRONG_STOCKS
  } catch {
    return MOCK_STRONG_STOCKS
  }
}

// ── 大戶持股
export async function getBigPlayers() {
  try {
    const data = await fetchFinmind('TaiwanStockShareholderStructure')
    return data.data?.length ? data.data : MOCK_BIG_PLAYERS
  } catch {
    return MOCK_BIG_PLAYERS
  }
}

// ── ETF
export async function getETFList() {
  try {
    const data = await fetchTWSE('/exchangeReport/ETF_DAY')
    return Array.isArray(data) && data.length ? data : MOCK_ETF
  } catch {
    return MOCK_ETF
  }
}

// ── 市場統計
export async function getTradingStats() {
  try {
    const data = await fetchTWSE('/exchangeReport/FMTQIK')
    return data || MOCK_TRADING_STATS
  } catch {
    return MOCK_TRADING_STATS
  }
}

// ── 新聞（需 FinMind token）
export async function getMarketNews() {
  try {
    const data = await fetchFinmind('TaiwanStockNews')
    return data.data?.length ? data.data : MOCK_NEWS
  } catch {
    return MOCK_NEWS
  }
}

export { MOCK_STOCKS as STOCK_DB }
