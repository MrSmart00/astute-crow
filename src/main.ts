import './style.css'
import { ZennTrends } from './components/ZennTrends'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <section class="hero-section">
      <h1>Hello World!</h1>
      <p class="subtitle">Welcome to Astute Crow</p>
      <p class="description">
        This is a TypeScript + Vite project created with Claude Code
      </p>
      <div class="features">
        <div class="feature-card">
          <h3>⚡ Vite</h3>
          <p>Lightning fast development server</p>
        </div>
        <div class="feature-card">
          <h3>🎯 TypeScript</h3>
          <p>Type-safe JavaScript development</p>
        </div>
        <div class="feature-card">
          <h3>🚀 Modern</h3>
          <p>ES2020 support and modern tooling</p>
        </div>
      </div>
    </section>

    <section id="zenn-trends"></section>
  </div>
`

// ZennTrendsコンポーネントを初期化
const zennTrends = new ZennTrends('zenn-trends');
zennTrends.init().catch(console.error);