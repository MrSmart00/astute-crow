import './style.css'
import { ZennTrends } from './components/ZennTrends'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <section id="zenn-trends"></section>
  </div>
`

// ZennTrendsコンポーネントを初期化
const zennTrends = new ZennTrends('zenn-trends');
zennTrends.init().catch(console.error);