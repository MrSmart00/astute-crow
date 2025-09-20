import './style.css'
import { ZennTrends } from './components/ZennTrends'
import { ZennRssFeed } from './components/ZennRssFeed'
import { QiitaRssFeed } from './components/QiitaRssFeed'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <section id="zenn-trends"></section>
    <section id="zenn-rss-feed"></section>
    <section id="qiita-rss-feed"></section>
  </div>
`

// ZennTrendsコンポーネントを初期化
const zennTrends = new ZennTrends('zenn-trends');
zennTrends.init().catch(console.error);

// ZennRssFeedコンポーネントを初期化
const zennRssFeed = new ZennRssFeed('zenn-rss-feed');
zennRssFeed.init().catch(console.error);

// QiitaRssFeedコンポーネントを初期化
const qiitaRssFeed = new QiitaRssFeed('qiita-rss-feed');
qiitaRssFeed.init().catch(console.error);

// グローバルアクセス用（リフレッシュボタンから参照）
(window as any).zennRssFeed = zennRssFeed;
(window as any).qiitaRssFeed = qiitaRssFeed;