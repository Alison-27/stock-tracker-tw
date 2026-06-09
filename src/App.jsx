import { AppProvider, useApp } from './store/AppContext.jsx'
import Sidebar from './components/Layout/Sidebar.jsx'
import TopBar from './components/Layout/TopBar.jsx'
import AssetAllocation from './components/AssetAllocation/AssetAllocation.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Portfolio from './components/Portfolio/Portfolio.jsx'
import Watchlist from './components/Watchlist/Watchlist.jsx'
import Institutional from './components/Institutional/Institutional.jsx'
import MarginTrading from './components/MarginTrading/MarginTrading.jsx'
import StrongStocks from './components/StrongStocks/StrongStocks.jsx'
import BigPlayers from './components/BigPlayers/BigPlayers.jsx'
import ETFTracker from './components/ETFTracker/ETFTracker.jsx'
import TradingStats from './components/TradingStats/TradingStats.jsx'
import Alerts from './components/Alerts/Alerts.jsx'
import News from './components/News/News.jsx'
import StockDetail from './components/StockDetail/StockDetail.jsx'
import StockAnalysisModal from './components/StockAnalysisModal/StockAnalysisModal.jsx'
import HotScanner from './components/HotScanner/HotScanner.jsx'

function MainContent() {
  const { activeTab } = useApp()
  const pages = {
    scanner: <HotScanner />,
    dashboard: <Dashboard />,
    portfolio: <Portfolio />,
    watchlist: <Watchlist />,
    institutional: <Institutional />,
    margin: <MarginTrading />,
    strong: <StrongStocks />,
    bigplayer: <BigPlayers />,
    etf: <ETFTracker />,
    trading: <TradingStats />,
    alerts: <Alerts />,
    news: <News />,
    stockdetail: <StockDetail />,
  }
  return pages[activeTab] || <Dashboard />
}

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <AssetAllocation />
        <main className="main-content">
          <MainContent />
        </main>
        <StockAnalysisModal />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
