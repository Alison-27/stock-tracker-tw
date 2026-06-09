import {
  MOCK_STOCKS, MOCK_INSTITUTIONAL, MOCK_MARGIN, MOCK_STRONG_STOCKS,
  MOCK_BIG_PLAYERS, MOCK_ETF, MOCK_TRADING_STATS, MOCK_NEWS, MOCK_PRICE_HISTORY,
  MOCK_INDICES
} from './mock.js'

const FINMIND_TOKEN = localStorage.getItem('finmind_token') || ''

async function fetchFinmind(dataset, params = {}) {
  const queryParams = new URLSearchParams({ dataset, token: FINMIND_TOKEN, ...params })
  const res = await fetch(`/api/finmind/data?${queryParams}`)
  if (!res.ok) throw new Error('FinMind API error')
  return res.json()
}

async function fetchTWSE(endpoint) {
  const res = await fetch(`/api/twse${endpoint}`)
  if (!res.ok) throw new Error('TWSE API error')
  return res.json()
}

async function fetchYahoo(symbol, range = '3mo', interval = '1d') {
  const res = await fetch(`/api/yahoo/v8/finance/chart/${symbol}.TW?range=${range}&interval=${interval}`)
  if (!res.ok) throw new Error('Yahoo Finance API error')
  return res.json()
}

export async function getMarketIndices() {
  try {
    const data = await fetchTWSE('/exchangeReport/FMTQIK')
    return data
  } catch {
    return MOCK_INDICES
  }
}

export async function getStockQuote(code) {
  try {
    const data = await fetchYahoo(code)
    const result = data.chart.result[0]
    const meta = result.meta
    return {
      code,
      name: meta.shortName || code,
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: meta.regularMarketVolume,
    }
  } catch {
    return MOCK_STOCKS.find(s => s.code === code) || MOCK_STOCKS[0]
  }
}

export async function getMultipleQuotes(codes) {
  try {
    const promises = codes.map(code => getStockQuote(code))
    return Promise.all(promises)
  } catch {
    return MOCK_STOCKS.filter(s => codes.includes(s.code))
  }
}

export async function getAllStocks() {
  try {
    const data = await fetchTWSE('/exchangeReport/STOCK_DAY_ALL')
    return data.map(item => ({
      code: item.Code,
      name: item.Name,
      price: parseFloat(item.ClosingPrice),
      change: parseFloat(item.Change),
      changePct: parseFloat(item.Change) / (parseFloat(item.ClosingPrice) - parseFloat(item.Change)) * 100,
      volume: parseInt(item.TradeVolume),
    }))
  } catch {
    return MOCK_STOCKS
  }
}

export async function getPriceHistory(code) {
  try {
    const data = await fetchYahoo(code, '3mo', '1d')
    const result = data.chart.result[0]
    const timestamps = result.timestamp
    const quotes = result.indicators.quote[0]
    return timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: parseFloat((quotes.open[i] || 0).toFixed(2)),
      high: parseFloat((quotes.high[i] || 0).toFixed(2)),
      low: parseFloat((quotes.low[i] || 0).toFixed(2)),
      close: parseFloat((quotes.close[i] || 0).toFixed(2)),
      volume: quotes.volume[i] || 0,
      price: parseFloat((quotes.close[i] || 0).toFixed(2)),
    }))
  } catch {
    return MOCK_PRICE_HISTORY(code)
  }
}

export async function getInstitutionalInvestors(date) {
  try {
    const d = date || new Date().toISOString().split('T')[0].replace(/-/g, '')
    const data = await fetchTWSE(`/fund/TWT38U?response=json&date=${d}`)
    return data
  } catch {
    return MOCK_INSTITUTIONAL
  }
}

export async function getMarginTrading() {
  try {
    const data = await fetchTWSE('/exchangeReport/MI_MARGN?response=json')
    return data
  } catch {
    return MOCK_MARGIN
  }
}

export async function getStrongStocks() {
  try {
    const data = await fetchFinmind('TaiwanStockStrongStock')
    return data.data || MOCK_STRONG_STOCKS
  } catch {
    return MOCK_STRONG_STOCKS
  }
}

export async function getBigPlayers() {
  try {
    const data = await fetchFinmind('TaiwanStockShareholderStructure')
    return data.data || MOCK_BIG_PLAYERS
  } catch {
    return MOCK_BIG_PLAYERS
  }
}

export async function getETFList() {
  try {
    const data = await fetchTWSE('/exchangeReport/ETF_DAY?response=json')
    return data || MOCK_ETF
  } catch {
    return MOCK_ETF
  }
}

export async function getTradingStats() {
  try {
    const data = await fetchTWSE('/exchangeReport/FMTQIK?response=json')
    return data || MOCK_TRADING_STATS
  } catch {
    return MOCK_TRADING_STATS
  }
}

export async function getMarketNews() {
  try {
    const data = await fetchFinmind('TaiwanStockNews')
    return data.data || MOCK_NEWS
  } catch {
    return MOCK_NEWS
  }
}

export async function searchStocks(query) {
  if (!query || query.length < 1) return []
  const all = await getAllStocks().catch(() => MOCK_STOCKS)
  return all.filter(s =>
    s.code.includes(query) || s.name.includes(query)
  ).slice(0, 10)
}
