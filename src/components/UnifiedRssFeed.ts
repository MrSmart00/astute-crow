import { UnifiedRssState, RssArticle, ErrorState } from '../types/rss';
import { unifiedRssService } from '../services/unifiedRssService';

export class UnifiedRssFeed {
  private container: HTMLElement;
  private state: UnifiedRssState = {
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
  private createArticleCard(article: RssArticle): string {
    const publishedDate = new Date(article.pubDate);
    const timeAgo = this.getTimeAgo(publishedDate);
    const avatarUrl = article.avatarUrl;

    // サイト別の表示調整
    const displayTitle = article.site === 'qiita' && article.metadata?.ogp?.title
      ? article.metadata.ogp.title
      : article.title;
    const displayDescription = article.site === 'qiita' && article.metadata?.ogp?.description
      ? article.metadata.ogp.description
      : article.description;

    return `
      <a href="${this.escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="zenn-card article" data-site="${article.site}">
        <div class="zenn-card-header">
          <h3 class="zenn-title">${this.escapeHtml(displayTitle)}</h3>
        </div>
        <div class="zenn-card-body">
          <div class="zenn-meta">
            <span class="published-date">${timeAgo}</span>
          </div>
        </div>
        <div class="zenn-card-footer">
          <div class="zenn-author">
            ${avatarUrl ? `
              <img src="${this.escapeHtml(avatarUrl)}" alt="${this.escapeHtml(article.author)}"
                   class="author-avatar" onerror="this.style.display='none'" />
            ` : ''}
            <span class="author-name">${this.escapeHtml(article.author)}</span>
          </div>
          <span class="article-site">${this.escapeHtml(article.siteName)}</span>
        </div>
      </a>
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
            <button class="retry-button" onclick="window.unifiedRssFeed?.refresh()">
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

    // サイト別の記事数を計算
    const qiitaCount = this.state.articles.filter(a => a.site === 'qiita').length;
    const zennCount = this.state.articles.filter(a => a.site === 'zenn').length;

    return `
      <div class="articles-container">
        <div class="articles-header">
          <h2>📡 RSS フィード</h2>
          <div class="feed-stats">
            <span class="feed-count">総計 ${this.state.articles.length}件</span>
            <span class="feed-breakdown">
              <span style="color: var(--qiita-color)">Qiita: ${qiitaCount}件</span>
              <span style="color: var(--zenn-color)">Zenn: ${zennCount}件</span>
            </span>
          </div>
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

  // 統合RSS記事をロード
  async loadRssArticles(): Promise<void> {
    this.state.loading = { isLoading: true, message: 'RSS記事を取得中...' };
    this.state.error = null;
    this.render();

    try {
      console.log('統合RSS記事の取得を開始します...');

      const response = await unifiedRssService.fetchUnifiedRssArticles();

      this.state.articles = response.articles;
      this.state.loading = { isLoading: false };
      this.state.lastUpdated = response.fetchedAt;
      this.render();

      console.log(`統合RSS記事を取得完了: 総計${response.totalCount}件 (Qiita: ${response.qiitaCount}件, Zenn: ${response.zennCount}件)`);

    } catch (error) {
      console.error('統合RSS記事の取得に失敗しました:', error);
      this.state.loading = { isLoading: false };
      this.state.error = {
        type: 'error',
        message: '統合RSS記事の取得に失敗しました',
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