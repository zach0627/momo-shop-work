// 外框上的靜態文字。都不是連結：這個專案只有商品卡可點

export const TOP_BAR_SHORTCUTS = [
  'momo富立保險',
  'APP下載',
  '點點賺分潤計劃',
  '書店',
];

export const TOP_BAR_ACCOUNT = [
  '登入',
  '註冊',
  '會員中心',
  '查訂單',
  '追蹤清單',
  '折價券',
  '購物車 (0)',
];

export const TOP_BAR_CAMPAIGN = '登記活動';

export const SEARCH_PLACEHOLDER = 'iPhone 18 Pro';

export const HOT_KEYWORDS = [
  'iphone18pro 512g',
  'goodsome 酪梨油',
  'tender leaf',
];

export const FRAUD_NOTICE =
  '防詐騙提醒：momo絕不會以電話或簡訊通知訂單/分期出錯、或變更付款方式，更不會要您前往ATM進行任何操作！不應在momo以外的任何地方輸入momo帳密(例如非政府官方的電子發票app)，以免權益受損！';

export const FOOTER_COLUMNS: { heading: string; items: string[] }[] = [
  {
    heading: '關於我們',
    items: ['momo官網', '招商專區', '人才招募', 'mo店+開店'],
  },
  {
    heading: '特色服務',
    items: ['異業合作', 'mo幣企業採購', '點點賺分潤計劃'],
  },
  {
    heading: '會員權益',
    items: [
      '客戶隱私權政策',
      '客戶權利義務',
      '網路安全標章',
      '包裝減量標章',
      '防詐騙宣導',
      '碳足跡標籤',
    ],
  },
  {
    heading: '系列網站',
    items: ['momoFB粉絲團', 'momo好物交流社團', 'momo官方IG', 'momo富立保險'],
  },
  {
    heading: '客戶服務',
    items: [
      '訂單/配送進度查詢',
      '取消訂單/退貨',
      '更改配送地址',
      '追蹤清單',
      '快速到貨服務',
      '折價券說明',
      'FAQ常見問題',
      '聯絡我們',
    ],
  },
];

export const APP_COLUMN_HEADING = '行動購物APP';

/** 「首頁」在每一頁都維持作用中，同真站。 */
export const ACTIVE_CATEGORY_ID = 'home';

// 相對於 <base href>，packages 不需要知道 app 部署在哪個子路徑
export const LOGO_SRC = 'assets/brand/momo-logo.png';
export const APP_QR_SRC = 'assets/footer/app-qr.jpg';
