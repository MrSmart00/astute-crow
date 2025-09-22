import './style.css'
import { ZennTrends } from './components/ZennTrends'
import { UnifiedRssFeed } from './components/UnifiedRssFeed'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <section id="zenn-trends"></section>
    <section id="unified-rss-feed"></section>
  </div>
`

// ZennTrendsコンポーネントを初期化
const zennTrends = new ZennTrends('zenn-trends');
zennTrends.init().catch(console.error);

// 統合RSSフィードコンポーネントを初期化
const unifiedRssFeed = new UnifiedRssFeed('unified-rss-feed');
unifiedRssFeed.init().catch(console.error);

// グローバルアクセス用（リフレッシュボタンから参照）
(window as any).unifiedRssFeed = unifiedRssFeed;