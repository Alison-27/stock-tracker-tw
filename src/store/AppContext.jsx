import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { MOCK_STOCKS } from '../services/mock.js'
import { searchStocks } from '../services/api.js'

const AppContext = createContext(null)

const DEFAULT_WATCHLIST_GROUPS = [
  { id: 'g1', name: '半導體', stocks: ['2330', '2454', '2303', '2379'] },
  { id: 'g2', name: '金融', stocks: ['2882', '2881', '2886', '2891'] },
  { id: 'g3', name: '自選清單', stocks: ['2317', '3008', '2412'] },
]

const DEFAULT_PORTFOLIO = [
  { code: '2330', name: '台積電', shares: 100, avgCost: 850, currentPrice: 980 },
  { code: '2454', name: '聯發科', shares: 50, avgCost: 1100, currentPrice: 1250 },
  { code: '2882', name: '國泰金', shares: 500, avgCost: 72, currentPrice: 78.2 },
]

const DEFAULT_ASSET_ALLOCATION = [
  { code: '2330', name: '台積電', value: 98000, color: '#06b6d4' },
  { code: '2454', name: '聯發科', value: 62500, color: '#10b981' },
  { code: '2882', name: '國泰金', value: 39100, color: '#f59e0b' },
  { code: 'cash', name: '現金', value: 50000, color: '#8b5cf6' },
]

const DEFAULT_ALERTS = [
  { id: 'a1', code: '2330', name: '台積電', type: 'above', price: 1000, active: true },
  { id: 'a2', code: '2454', name: '聯發科', type: 'below', price: 1200, active: true },
]

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedStock, setSelectedStock] = useState(null)
  const [stockModal, setStockModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const [watchlistGroups, setWatchlistGroups] = useLocalStorage('watchlist_groups', DEFAULT_WATCHLIST_GROUPS)
  const [portfolio, setPortfolio] = useLocalStorage('portfolio', DEFAULT_PORTFOLIO)
  const [assetAllocation, setAssetAllocation] = useLocalStorage('asset_allocation', DEFAULT_ASSET_ALLOCATION)
  const [alerts, setAlerts] = useLocalStorage('price_alerts', DEFAULT_ALERTS)
  const [finmindToken, setFinmindToken] = useLocalStorage('finmind_token', '')

  const [liveQuotes, setLiveQuotes] = useState({})
  const [marketStatus, setMarketStatus] = useState('closed')

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    const isWeekday = day >= 1 && day <= 5
    const isMarketHours = hour >= 9 && hour < 14
    setMarketStatus(isWeekday && isMarketHours ? 'open' : 'closed')
  }, [])

  useEffect(() => {
    const allCodes = [
      ...new Set([
        ...portfolio.map(p => p.code),
        ...watchlistGroups.flatMap(g => g.stocks),
        ...assetAllocation.filter(a => a.code !== 'cash').map(a => a.code),
      ])
    ]
    const quotes = {}
    MOCK_STOCKS.forEach(s => {
      if (allCodes.includes(s.code)) {
        quotes[s.code] = s
      }
    })
    setLiveQuotes(quotes)
  }, [portfolio, watchlistGroups, assetAllocation])

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    if (!query || query.length < 1) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchStocks(query)
      setSearchResults(results)
    } catch {
      const filtered = MOCK_STOCKS.filter(s =>
        s.code.includes(query) || s.name.includes(query)
      ).slice(0, 8)
      setSearchResults(filtered)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const openStockDetail = useCallback((stock) => {
    setSelectedStock(stock)
    setActiveTab('stockdetail')
  }, [])

  const openStockModal = useCallback((stock) => {
    setStockModal(stock)
  }, [])

  const closeStockModal = useCallback(() => {
    setStockModal(null)
  }, [])

  // Watchlist group operations
  const addWatchlistGroup = (name) => {
    const newGroup = { id: `g${Date.now()}`, name, stocks: [] }
    setWatchlistGroups(prev => [...prev, newGroup])
  }

  const removeWatchlistGroup = (groupId) => {
    setWatchlistGroups(prev => prev.filter(g => g.id !== groupId))
  }

  const renameWatchlistGroup = (groupId, newName) => {
    setWatchlistGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g))
  }

  const addStockToGroup = (groupId, code, name) => {
    setWatchlistGroups(prev => prev.map(g =>
      g.id === groupId && !g.stocks.includes(code)
        ? { ...g, stocks: [...g.stocks, code] }
        : g
    ))
  }

  const removeStockFromGroup = (groupId, code) => {
    setWatchlistGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, stocks: g.stocks.filter(s => s !== code) } : g
    ))
  }

  // Portfolio operations
  const addPortfolioItem = (item) => {
    setPortfolio(prev => {
      const existing = prev.find(p => p.code === item.code)
      if (existing) {
        const totalShares = existing.shares + item.shares
        const avgCost = (existing.avgCost * existing.shares + item.avgCost * item.shares) / totalShares
        return prev.map(p => p.code === item.code ? { ...p, shares: totalShares, avgCost } : p)
      }
      return [...prev, item]
    })
  }

  const removePortfolioItem = (code) => {
    setPortfolio(prev => prev.filter(p => p.code !== code))
  }

  // Asset allocation operations
  const addAssetItem = (item) => {
    setAssetAllocation(prev => {
      const existing = prev.find(a => a.code === item.code)
      if (existing) {
        return prev.map(a => a.code === item.code ? { ...a, value: item.value, name: item.name } : a)
      }
      const colors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#f97316', '#ec4899']
      return [...prev, { ...item, color: colors[prev.length % colors.length] }]
    })
  }

  const removeAssetItem = (code) => {
    setAssetAllocation(prev => prev.filter(a => a.code !== code))
  }

  const updateAssetItem = (code, updates) => {
    setAssetAllocation(prev => prev.map(a => a.code === code ? { ...a, ...updates } : a))
  }

  // Alert operations
  const addAlert = (alert) => {
    setAlerts(prev => [...prev, { ...alert, id: `a${Date.now()}` }])
  }

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      selectedStock, setSelectedStock, openStockDetail,
      stockModal, openStockModal, closeStockModal,
      searchQuery, searchResults, isSearching, handleSearch,
      watchlistGroups, addWatchlistGroup, removeWatchlistGroup, renameWatchlistGroup,
      addStockToGroup, removeStockFromGroup,
      portfolio, addPortfolioItem, removePortfolioItem,
      assetAllocation, addAssetItem, removeAssetItem, updateAssetItem,
      alerts, addAlert, removeAlert, toggleAlert,
      liveQuotes, marketStatus,
      finmindToken, setFinmindToken,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
