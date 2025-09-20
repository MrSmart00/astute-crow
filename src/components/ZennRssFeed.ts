import { ZennRssState, ZennRssArticle, ErrorState } from '../types/zenn';
import { rssZennService } from '../services/rssZennService';

export class ZennRssFeed {
  private container: HTMLElement;
  private state: ZennRssState = {
    articles: [],
    loading: { isLoading: false },
    error: null,
    lastUpdated: null,
  };

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }
    this.container = element;
  }

  // スケルトンカードを作成
  private createSkeletonCard(): string {
    return `
      <div class="article-card skeleton">
        <div class="article-image skeleton-image"></div>
        <div class="article-content">
          <div class="skeleton-text skeleton-title"></div>
          <div class="skeleton-text skeleton-description"></div>
          <div class="article-meta">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-text skeleton-author"></div>
            <div class="skeleton-text skeleton-date"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ローディング状態を作成
  private createLoadingState(message?: string): string {
    const skeletonCards = Array(6).fill(this.createSkeletonCard()).join('');

    return `
      <div class="loading-container">
        <div class="loading-message">
          <div class="loading-spinner"></div>
          <span>${message || 'RSS記事を取得中...'}</span>
        </div>
        <div class="article-grid">
          ${skeletonCards}
        </div>
      </div>
    `;
  }

  // 記事カードを作成
  private createArticleCard(article: ZennRssArticle): string {
    const publishedDate = new Date(article.pubDate);
    const timeAgo = this.getTimeAgo(publishedDate);
    const avatarUrl = article.avatarUrl;

    return `
      <article class="article-card" data-article-id="${this.escapeHtml(article.id)}" data-site="zenn">
        <a href="${this.escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="article-link">
          <div class="article-content">
            <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
            <p class="article-description">${this.escapeHtml(article.description)}</p>
            <div class="article-meta">
              <div class="author-info">
                ${avatarUrl ? `
                  <img src="${this.escapeHtml(avatarUrl)}" alt="${this.escapeHtml(article.author)}"
                       class="author-avatar" onerror="this.style.display='none'" />
                ` : ''}
                <span class="author-name">${this.escapeHtml(article.author)}</span>
              </div>
              <span class="article-date">${timeAgo}</span>
              <span class="article-site">${this.escapeHtml(article.siteName)}</span>
            </div>
          </div>
        </a>
      </article>
    `;
  }

  // エラー状態を作成
  private createErrorState(error: ErrorState): string {
    return `
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>${error.message}</h3>
          ${error.subMessage ? `<p>${error.subMessage}</p>` : ''}
          ${error.showRetryButton ? `
            <button class="retry-button" onclick="window.zennRssFeed?.refresh()">
              再試行
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 成功状態を作成
  private createSuccessState(): string {
    if (this.state.articles.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>記事が見つかりませんでした</h3>
          <p>RSSフィードから記事を取得できませんでした。</p>
        </div>
      `;
    }

    const articlesHtml = this.state.articles.map(article => this.createArticleCard(article)).join('');
    const lastUpdated = this.state.lastUpdated ? new Date(this.state.lastUpdated).toLocaleString('ja-JP') : '';

    return `
      <div class="articles-container">
        <div class="articles-header">
          <h2>📡 Zenn RSS フィード</h2>
          ${lastUpdated ? `<div class="last-updated">最終更新: ${lastUpdated}</div>` : ''}
        </div>
        <div class="article-grid">
          ${articlesHtml}
        </div>
      </div>
    `;
  }

  // HTMLエスケープ
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 時間差を計算
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  // レンダリング
  private render(): void {
    let content = '';

    if (this.state.loading.isLoading) {
      content = this.createLoadingState(this.state.loading.message);
    } else if (this.state.error) {
      content = this.createErrorState(this.state.error);
    } else {
      content = this.createSuccessState();
    }

    this.container.innerHTML = content;
  }

  // 初期化
  async init(): Promise<void> {
    this.render();
    await this.loadRssArticles();
  }

  // RSS記事をロード
  async loadRssArticles(): Promise<void> {
    this.state.loading = { isLoading: true, message: 'RSS記事を取得中...' };
    this.state.error = null;
    this.render();

    try {
      console.log('RSS記事の取得を開始します...');

      const response = await rssZennService.fetchWithFallback();

      this.state.articles = response.articles;
      this.state.loading = { isLoading: false };
      this.state.lastUpdated = response.fetchedAt;
      this.render();

      console.log(`RSS記事を取得完了: ${response.articles.length}件`);

    } catch (error) {
      console.error('RSS記事の取得に失敗しました:', error);
      this.state.loading = { isLoading: false };
      this.state.error = {
        type: 'error',
        message: 'RSS記事の取得に失敗しました',
        subMessage: error instanceof Error ? error.message : 'しばらく時間をおいて再度お試しください。',
        showRetryButton: true,
      };
      this.render();
    }
  }

  // リフレッシュ
  async refresh(): Promise<void> {
    await this.loadRssArticles();
  }
}