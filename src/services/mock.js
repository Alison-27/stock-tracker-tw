// Mock / 離線資料 — API 失敗時使用，也作為本地搜尋的股票庫

export const MOCK_STOCKS = [
  // ── 半導體 ──
  { code: '2330', name: '台積電',   price: 980.00, change:  15.00, changePct:  1.55, volume: 28543100, pe: 28.4, pb: 8.2,  marketCap: 25420 },
  { code: '2454', name: '聯發科',   price: 1250.0, change:  35.00, changePct:  2.88, volume:  9876500, pe: 22.1, pb: 5.3,  marketCap:  1984 },
  { code: '2303', name: '聯電',     price:  58.10, change:   1.20, changePct:  2.11, volume: 78432100, pe: 14.2, pb: 2.1,  marketCap:  1384 },
  { code: '2379', name: '瑞昱',     price: 620.00, change:  22.00, changePct:  3.67, volume:  3456700, pe: 18.5, pb: 3.4,  marketCap:   480 },
  { code: '3711', name: '日月光投控', price: 175.00, change:   3.50, changePct:  2.04, volume: 12345600, pe: 16.2, pb: 2.8,  marketCap:  1230 },
  { code: '2408', name: '南亞科',   price:  68.50, change:   2.10, changePct:  3.16, volume: 23456700, pe: 12.8, pb: 2.3,  marketCap:   420 },
  { code: '3034', name: '聯詠',     price: 380.00, change:  12.00, changePct:  3.26, volume:  4567800, pe: 15.4, pb: 4.1,  marketCap:   340 },
  { code: '6770', name: '力積電',   price:  43.20, change:   1.50, changePct:  3.60, volume: 34567800, pe: 10.2, pb: 1.8,  marketCap:   280 },
  { code: '2344', name: '華邦電',   price:  35.80, change:  -0.50, changePct: -1.38, volume: 45678900, pe: 13.5, pb: 2.0,  marketCap:   310 },
  { code: '2385', name: '群光',     price: 210.00, change:   5.00, changePct:  2.44, volume:  2345600, pe: 17.8, pb: 2.6,  marketCap:   190 },
  // ── 電子製造 ──
  { code: '2317', name: '鴻海',     price: 188.50, change:  -1.50, changePct: -0.79, volume: 52341200, pe: 11.2, pb: 1.8,  marketCap:  2614 },
  { code: '2382', name: '廣達',     price: 345.00, change:  10.50, changePct:  3.13, volume:  8765400, pe: 19.3, pb: 5.1,  marketCap:   900 },
  { code: '2357', name: '華碩',     price: 580.00, change:  14.00, changePct:  2.47, volume:  4567800, pe: 14.7, pb: 2.3,  marketCap:   480 },
  { code: '2308', name: '台達電',   price: 382.00, change:   8.00, changePct:  2.14, volume:  5432100, pe: 31.5, pb: 6.8,  marketCap:   932 },
  { code: '2354', name: '鴻準',     price:  92.50, change:   1.50, changePct:  1.65, volume:  9876500, pe: 15.3, pb: 2.1,  marketCap:   320 },
  { code: '4938', name: '和碩',     price:  98.50, change:   4.00, changePct:  4.23, volume: 15432100, pe: 13.8, pb: 2.4,  marketCap:   380 },
  { code: '2353', name: '宏碁',     price:  36.50, change:   0.80, changePct:  2.24, volume: 23456700, pe: 12.4, pb: 1.6,  marketCap:   280 },
  { code: '2352', name: '佳世達',   price:  40.20, change:  -0.30, changePct: -0.74, volume: 12345600, pe: 14.2, pb: 1.9,  marketCap:   150 },
  { code: '2395', name: '研華',     price: 390.00, change:   8.00, changePct:  2.10, volume:  2345600, pe: 28.4, pb: 6.2,  marketCap:   380 },
  { code: '3231', name: '緯創',     price:  82.50, change:   2.00, changePct:  2.49, volume: 18765400, pe: 11.6, pb: 2.2,  marketCap:   460 },
  // ── 光學 / 零組件 ──
  { code: '3008', name: '大立光',   price: 2540.0, change: -20.00, changePct: -0.78, volume:  1234500, pe: 42.3, pb: 9.1,  marketCap:   851 },
  { code: '2451', name: '創見',     price: 158.00, change:   3.50, changePct:  2.27, volume:  2345600, pe: 16.8, pb: 2.8,  marketCap:    90 },
  { code: '3045', name: '台灣大',   price: 112.50, change:   0.50, changePct:  0.45, volume:  6789000, pe: 22.3, pb: 4.1,  marketCap:   410 },
  // ── 電信 ──
  { code: '2412', name: '中華電',   price: 122.00, change:   0.50, changePct:  0.41, volume:  6543200, pe: 25.8, pb: 2.9,  marketCap:   950 },
  { code: '4904', name: '遠傳',     price:  72.40, change:   0.40, changePct:  0.56, volume:  5678900, pe: 20.5, pb: 3.4,  marketCap:   310 },
  // ── 金融 ──
  { code: '2882', name: '國泰金',   price:  78.20, change:   0.80, changePct:  1.03, volume: 41235600, pe: 15.3, pb: 1.4,  marketCap:  1023 },
  { code: '2881', name: '富邦金',   price:  95.40, change:  -0.60, changePct: -0.62, volume: 23456700, pe: 13.8, pb: 1.6,  marketCap:  1421 },
  { code: '2891', name: '中信金',   price:  36.80, change:   0.20, changePct:  0.55, volume: 45678900, pe: 11.5, pb: 1.2,  marketCap:   896 },
  { code: '2886', name: '兆豐金',   price:  43.25, change:   0.35, changePct:  0.82, volume: 34567800, pe: 12.1, pb: 1.3,  marketCap:   634 },
  { code: '2884', name: '玉山金',   price:  30.60, change:   0.15, changePct:  0.49, volume: 56789000, pe: 14.2, pb: 1.5,  marketCap:   520 },
  { code: '2885', name: '元大金',   price:  30.85, change:   0.25, changePct:  0.82, volume: 45678900, pe: 11.8, pb: 1.4,  marketCap:   480 },
  { code: '2892', name: '第一金',   price:  35.20, change:   0.20, changePct:  0.57, volume: 34567800, pe: 12.5, pb: 1.3,  marketCap:   410 },
  { code: '2887', name: '台新金',   price:  18.95, change:   0.10, changePct:  0.53, volume: 67890000, pe: 12.8, pb: 1.2,  marketCap:   320 },
  { code: '2883', name: '開發金',   price:  16.50, change:  -0.05, changePct: -0.30, volume: 78901000, pe: 13.2, pb: 1.1,  marketCap:   280 },
  { code: '2880', name: '華南金',   price:  24.80, change:   0.15, changePct:  0.61, volume: 45678900, pe: 13.5, pb: 1.2,  marketCap:   340 },
  { code: '5880', name: '合庫金',   price:  30.40, change:   0.20, changePct:  0.66, volume: 34567800, pe: 12.0, pb: 1.1,  marketCap:   380 },
  { code: '2888', name: '新光金',   price:  10.45, change:  -0.10, changePct: -0.95, volume: 89012000, pe: 14.5, pb: 1.0,  marketCap:   180 },
  // ── 傳產石化 ──
  { code: '6505', name: '台塑化',   price: 115.00, change:  -2.00, changePct: -1.71, volume:  8234500, pe: 18.7, pb: 2.1,  marketCap:   967 },
  { code: '1301', name: '台塑',     price:  82.50, change:  -0.50, changePct: -0.60, volume: 12345600, pe: 16.5, pb: 2.0,  marketCap:  1070 },
  { code: '1303', name: '南亞',     price:  71.20, change:  -0.30, changePct: -0.42, volume: 18765400, pe: 17.8, pb: 1.9,  marketCap:   980 },
  { code: '1326', name: '台化',     price:  74.80, change:  -0.20, changePct: -0.27, volume: 10234500, pe: 15.3, pb: 1.8,  marketCap:   870 },
  { code: '1101', name: '台泥',     price:  38.20, change:   0.20, changePct:  0.53, volume: 23456700, pe: 14.2, pb: 1.5,  marketCap:   420 },
  { code: '1102', name: '亞泥',     price:  44.50, change:   0.30, changePct:  0.68, volume: 12345600, pe: 15.8, pb: 1.7,  marketCap:   310 },
  { code: '2002', name: '中鋼',     price:  26.80, change:  -0.20, changePct: -0.74, volume: 56789000, pe: 12.3, pb: 1.3,  marketCap:   690 },
  // ── 航運 ──
  { code: '2603', name: '長榮',     price: 198.00, change:   8.50, changePct:  4.49, volume: 34567800, pe:  6.2, pb: 1.8,  marketCap:   710 },
  { code: '2609', name: '陽明',     price:  68.30, change:   3.20, changePct:  4.92, volume: 45678900, pe:  5.8, pb: 1.5,  marketCap:   295 },
  { code: '2615', name: '萬海',     price:  72.50, change:   2.80, changePct:  4.02, volume: 23456700, pe:  6.5, pb: 1.6,  marketCap:   210 },
  { code: '2610', name: '華航',     price:  24.50, change:   0.45, changePct:  1.87, volume: 34567800, pe: 18.5, pb: 2.1,  marketCap:   240 },
  { code: '2618', name: '長榮航',   price:  34.80, change:   0.80, changePct:  2.35, volume: 23456700, pe: 14.2, pb: 2.3,  marketCap:   220 },
  // ── 生技 ──
  { code: '2347', name: '聯強',     price: 108.00, change:   1.50, changePct:  1.41, volume:  5678900, pe: 12.5, pb: 1.8,  marketCap:   280 },
  { code: '4711', name: '旭富',     price:  88.50, change:   2.50, changePct:  2.91, volume:  2345600, pe: 20.3, pb: 3.2,  marketCap:    45 },
  { code: '1786', name: '科妍',     price: 245.00, change:  10.00, changePct:  4.26, volume:  1234500, pe: 32.5, pb: 8.4,  marketCap:    38 },
  // ── 電商/軟體 ──
  { code: '3673', name: 'TPK-KY',  price:  48.50, change:  -0.50, changePct: -1.02, volume:  4567800, pe: 13.5, pb: 1.4,  marketCap:   120 },
  { code: '5347', name: '世界',     price:  82.30, change:   2.30, changePct:  2.88, volume:  3456700, pe: 16.8, pb: 2.5,  marketCap:    90 },
  // ── 綠能 ──
  { code: '6282', name: '康舒',     price:  82.50, change:   2.00, changePct:  2.49, volume:  3456700, pe: 14.5, pb: 2.1,  marketCap:    75 },
  { code: '3576', name: '聯合再生', price:  18.30, change:   0.30, changePct:  1.67, volume: 12345600, pe: 22.3, pb: 2.8,  marketCap:    42 },
  { code: '6244', name: '茂迪',     price:  52.80, change:   1.20, changePct:  2.33, volume:  4567800, pe: 18.5, pb: 2.3,  marketCap:    38 },
  // ── 其他科技 ──
  { code: '2392', name: '正崴',     price:  68.50, change:   1.50, changePct:  2.24, volume:  5678900, pe: 15.2, pb: 2.1,  marketCap:    92 },
  { code: '2376', name: '技嘉',     price: 245.00, change:   8.00, changePct:  3.37, volume:  3456700, pe: 14.8, pb: 2.9,  marketCap:   230 },
  { code: '3考', name: '威盛',      price:  28.50, change:   0.50, changePct:  1.79, volume:  6789000, pe: 20.5, pb: 2.4,  marketCap:    55 },
  { code: '2388', name: '威盛',     price:  28.50, change:   0.50, changePct:  1.79, volume:  6789000, pe: 20.5, pb: 2.4,  marketCap:    55 },
  { code: '2337', name: '旺宏',     price:  46.80, change:   1.30, changePct:  2.86, volume: 18765400, pe: 11.8, pb: 1.9,  marketCap:   180 },
  { code: '2404', name: '漢唐',     price: 198.00, change:   5.00, changePct:  2.59, volume:  2345600, pe: 22.5, pb: 4.8,  marketCap:    72 },
]

// 重複代號清理（威盛只保留一筆）
const seen = new Set()
const _filtered = MOCK_STOCKS.filter(s => {
  if (seen.has(s.code)) return false
  seen.add(s.code)
  return true
})
MOCK_STOCKS.length = 0
_filtered.forEach(s => MOCK_STOCKS.push(s))

export const MOCK_INDICES = [
  { name: '加權指數', value: 22145.32, change: 187.45, changePct: 0.85 },
  { name: '櫃買指數', value: 248.73,   change:   3.21, changePct: 1.31 },
  { name: '台灣50',   value: 198.45,   change:   1.87, changePct: 0.95 },
]

export const MOCK_INSTITUTIONAL = [
  { code: '2330', name: '台積電', foreign:  25430000000, trust:  3210000000, dealer:  -890000000, total:  27750000000 },
  { code: '2454', name: '聯發科', foreign:   8760000000, trust:  1230000000, dealer:  -340000000, total:   9650000000 },
  { code: '2317', name: '鴻海',   foreign:  -3210000000, trust:  -560000000, dealer:   230000000, total:  -3540000000 },
  { code: '2882', name: '國泰金', foreign:   2340000000, trust:   450000000, dealer:  -120000000, total:   2670000000 },
  { code: '2308', name: '台達電', foreign:   1560000000, trust:   320000000, dealer:    90000000, total:   1970000000 },
  { code: '2303', name: '聯電',   foreign:  -1890000000, trust:  -210000000, dealer:   150000000, total:  -1950000000 },
  { code: '3008', name: '大立光', foreign:    980000000, trust:  -120000000, dealer:    45000000, total:    905000000 },
  { code: '6505', name: '台塑化', foreign:   -890000000, trust:   230000000, dealer:   -67000000, total:   -727000000 },
  { code: '2382', name: '廣達',   foreign:   3450000000, trust:   560000000, dealer:  -230000000, total:   3780000000 },
  { code: '2603', name: '長榮',   foreign:   5670000000, trust:   890000000, dealer:  -345000000, total:   6215000000 },
]

export const MOCK_MARGIN = [
  { code: '2330', name: '台積電', marginBuy: 125430, marginBuyChange:  3210, shortSell:  45670, shortSellChange:  -890, coverRatio: 2.75 },
  { code: '2454', name: '聯發科', marginBuy:  87650, marginBuyChange:  1230, shortSell:  23450, shortSellChange:   560, coverRatio: 3.74 },
  { code: '2317', name: '鴻海',   marginBuy: 234560, marginBuyChange: -5640, shortSell:  89320, shortSellChange:  2340, coverRatio: 2.63 },
  { code: '2882', name: '國泰金', marginBuy: 189320, marginBuyChange:  4500, shortSell:  67890, shortSellChange: -1230, coverRatio: 2.79 },
  { code: '2303', name: '聯電',   marginBuy: 345670, marginBuyChange:  8900, shortSell: 156780, shortSellChange:  3450, coverRatio: 2.21 },
  { code: '3008', name: '大立光', marginBuy:  12340, marginBuyChange:  -450, shortSell:   5670, shortSellChange:   120, coverRatio: 2.18 },
  { code: '6505', name: '台塑化', marginBuy:  98760, marginBuyChange: -2340, shortSell:  34560, shortSellChange:   890, coverRatio: 2.86 },
  { code: '2308', name: '台達電', marginBuy:  67890, marginBuyChange:  1560, shortSell:  23450, shortSellChange:  -340, coverRatio: 2.90 },
  { code: '2603', name: '長榮',   marginBuy: 234560, marginBuyChange: 12300, shortSell:  78900, shortSellChange:  4560, coverRatio: 2.97 },
  { code: '2609', name: '陽明',   marginBuy: 189320, marginBuyChange:  8900, shortSell:  67890, shortSellChange:  3450, coverRatio: 2.79 },
]

export const MOCK_STRONG_STOCKS = [
  { code: '2330', name: '台積電', price:  980, changePct: 1.55, rs: 94, volume: 28543100, volumeRatio: 2.3, signal: '突破' },
  { code: '2454', name: '聯發科', price: 1250, changePct: 2.88, rs: 91, volume:  9876500, volumeRatio: 3.1, signal: '強勢' },
  { code: '4938', name: '和碩',   price:   99, changePct: 4.21, rs: 89, volume: 15432100, volumeRatio: 4.5, signal: '放量' },
  { code: '2308', name: '台達電', price:  382, changePct: 2.14, rs: 87, volume:  5432100, volumeRatio: 1.8, signal: '強勢' },
  { code: '2379', name: '瑞昱',   price:  620, changePct: 3.67, rs: 86, volume:  3456700, volumeRatio: 2.7, signal: '突破' },
  { code: '3711', name: '日月光', price:  175, changePct: 1.98, rs: 84, volume: 12345600, volumeRatio: 1.5, signal: '強勢' },
  { code: '2382', name: '廣達',   price:  345, changePct: 3.13, rs: 83, volume:  8765400, volumeRatio: 2.1, signal: '放量' },
  { code: '2603', name: '長榮',   price:  198, changePct: 4.49, rs: 82, volume: 34567800, volumeRatio: 3.5, signal: '突破' },
]

export const MOCK_BIG_PLAYERS = [
  { code: '2330', name: '台積電', concentration: 78.4, bigPlayerBuy: 34500000000, bigPlayerSell: 12300000000, netBuy:  22200000000, holdingChange:  0.8 },
  { code: '2454', name: '聯發科', concentration: 65.2, bigPlayerBuy:  8900000000, bigPlayerSell:  3200000000, netBuy:   5700000000, holdingChange:  1.2 },
  { code: '2317', name: '鴻海',   concentration: 42.1, bigPlayerBuy:  5600000000, bigPlayerSell:  7800000000, netBuy:  -2200000000, holdingChange: -0.5 },
  { code: '3008', name: '大立光', concentration: 71.3, bigPlayerBuy:  1200000000, bigPlayerSell:   450000000, netBuy:    750000000, holdingChange:  0.3 },
  { code: '2308', name: '台達電', concentration: 58.7, bigPlayerBuy:  2300000000, bigPlayerSell:   890000000, netBuy:   1410000000, holdingChange:  0.6 },
  { code: '6505', name: '台塑化', concentration: 38.9, bigPlayerBuy:  1100000000, bigPlayerSell:  1450000000, netBuy:   -350000000, holdingChange: -0.2 },
  { code: '2603', name: '長榮',   concentration: 52.4, bigPlayerBuy:  6700000000, bigPlayerSell:  2300000000, netBuy:   4400000000, holdingChange:  1.5 },
]

export const MOCK_ETF = [
  { code: '0050',   name: '元大台灣50',       price: 198.45, nav: 197.83, premium:  0.31, changePct: 0.95, volume: 12345600, aum: 3456780, category: '寬基' },
  { code: '0056',   name: '元大高股息',       price:  45.32, nav:  45.18, premium:  0.31, changePct: 0.42, volume: 45678900, aum: 2345670, category: '股息' },
  { code: '00878',  name: '國泰永續高股息',   price:  23.45, nav:  23.38, premium:  0.30, changePct: 0.64, volume: 78901234, aum: 1987650, category: '股息' },
  { code: '00881',  name: '國泰台灣5G+',      price:  18.76, nav:  18.69, premium:  0.37, changePct: 1.35, volume: 34567890, aum:  567890, category: '主題' },
  { code: '00892',  name: '富邦台灣半導體',   price:  28.90, nav:  28.72, premium:  0.63, changePct: 2.13, volume: 23456780, aum:  456780, category: '產業' },
  { code: '00733',  name: '富邦台灣中小',     price:  48.65, nav:  48.42, premium:  0.48, changePct: 1.67, volume:  8765430, aum:  345670, category: '規模' },
  { code: '006208', name: '富邦台灣採樣50',   price:  96.80, nav:  96.55, premium:  0.26, changePct: 0.89, volume:  5678900, aum:  678900, category: '寬基' },
  { code: '00919',  name: '群益台灣精選高息', price:  22.30, nav:  22.18, premium:  0.54, changePct: 1.12, volume: 56789000, aum:  890120, category: '股息' },
  { code: '00929',  name: '復華台灣科技優息', price:  19.85, nav:  19.74, premium:  0.56, changePct: 1.38, volume: 45678900, aum:  756780, category: '股息' },
  { code: '00679B', name: '元大美債20年',     price:  27.45, nav:  27.38, premium:  0.26, changePct: 0.18, volume: 23456700, aum:  456780, category: '債券' },
]

export const MOCK_TRADING_STATS = {
  date: '2024-06-09',
  totalVolume: 289543210000, totalTurnover: 456789012345,
  advances: 687, declines: 312, unchanged: 98, limitUp: 23, limitDown: 5,
  foreignNetBuy: 38900000000, trustNetBuy: 5670000000, dealerNetBuy: -2340000000,
  marginBalance: 1234567890000, shortBalance: 345678900000,
  buyByType: [
    { type: '外資',  buy: 125430000000, sell:  86530000000, net:  38900000000 },
    { type: '投信',  buy:  23450000000, sell:  17780000000, net:   5670000000 },
    { type: '自營商',buy:  45670000000, sell:  48010000000, net:  -2340000000 },
    { type: '散戶',  buy: 156780000000, sell: 161200000000, net:  -4420000000 },
  ],
  sectorPerformance: [
    { sector: '半導體', changePct: 2.34 }, { sector: '電子',   changePct: 1.87 },
    { sector: '金融',   changePct: 0.92 }, { sector: '傳產',   changePct: -0.45 },
    { sector: '鋼鐵',   changePct: -1.23 }, { sector: '航運',  changePct: 3.45 },
    { sector: '生技',   changePct: 0.67 }, { sector: '建材',   changePct: -0.89 },
  ],
}

export const MOCK_NEWS = [
  { id: 1, title: '台積電法說會：2024下半年業績看旺，AI需求強勁',          source: '工商時報', time: '10分鐘前', category: 'AI',   sentiment: 'positive', stock: '2330' },
  { id: 2, title: '聯發科新款天璣晶片搶攻AI手機市場',                      source: '電子時報', time: '25分鐘前', category: '半導體',sentiment: 'positive', stock: '2454' },
  { id: 3, title: '鴻海汽車業務拓展，與多家車廠洽談合作',                   source: '財訊',    time: '1小時前',  category: '電動車',sentiment: 'neutral',  stock: '2317' },
  { id: 4, title: '外資連續三日買超台股，資金持續回流新興市場',             source: '聯合財經', time: '2小時前',  category: '外資',  sentiment: 'positive', stock: null },
  { id: 5, title: '美聯準會降息預期升溫，台股受惠上揚',                     source: '工商時報', time: '3小時前',  category: '總經',  sentiment: 'positive', stock: null },
  { id: 6, title: '大立光Q2出貨量不如預期，獲利恐下修',                    source: '電子時報', time: '4小時前',  category: '光學',  sentiment: 'negative', stock: '3008' },
  { id: 7, title: '航運股受惠運費回升，長榮、陽明雙雙大漲',               source: '財訊',    time: '5小時前',  category: '航運',  sentiment: 'positive', stock: '2603' },
  { id: 8, title: '廣達AI伺服器訂單持續增加，目標價上調',                  source: '工商時報', time: '6小時前',  category: 'AI',    sentiment: 'positive', stock: '2382' },
]

export const MOCK_PRICE_HISTORY = (code) => {
  const basePrice = MOCK_STOCKS.find(s => s.code === code)?.price || 100
  const days = 90
  const data = []
  let price = basePrice * 0.85
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.48) * price * 0.02
    price = Math.max(price + change, 1)
    data.push({
      date: date.toISOString().split('T')[0],
      price:  parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 5000000,
      open:   parseFloat((price * (1 - Math.random() * 0.01)).toFixed(2)),
      high:   parseFloat((price * (1 + Math.random() * 0.015)).toFixed(2)),
      low:    parseFloat((price * (1 - Math.random() * 0.015)).toFixed(2)),
      close:  parseFloat(price.toFixed(2)),
    })
  }
  return data
}
