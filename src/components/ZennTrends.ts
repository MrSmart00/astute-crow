import { zennService } from '../services/zennService';
import { ZennArticle, ZennTrendsState } from '../types/zenn';

export class ZennTrends {
  private state: ZennTrendsState = {
    articles: [],
    loading: { isLoading: false },
    error: null,
    lastUpdated: null
  };

  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
  }

  private createSkeletonCard(): string {
    return `
      <div class="zenn-card skeleton">
        <div class="zenn-card-header">
          <div class="skeleton-emoji"></div>
          <div class="skeleton-title"></div>
        </div>
        <div class="zenn-card-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div class="zenn-card-footer">
          <div class="skeleton-author">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-name"></div>
          </div>
          <div class="skeleton-likes"></div>
        </div>
      </div>
    `;
  }

  private createLoadingState(): string {
    const skeletonCards = Array.from({ length: 6 }, () => this.createSkeletonCard()).join('');

    return `
      <div class="zenn-trends-section">
        <h2 class="section-title">📈 Zennトレンド記事</h2>
        <p class="loading-message">トレンド記事を取得中...</p>
        <div class="zenn-cards-grid">
          ${skeletonCards}
        </div>
      </div>
    `;
  }

  private createArticleCard(article: ZennArticle): string {
    const articleUrl = `https://zenn.dev/${article.user.username}/articles/${article.slug}`;
    const publishedDate = new Date(article.publishedAt).toLocaleDateString('ja-JP');

    return `
      <a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="zenn-card">
        <div class="zenn-card-header">
          <div class="zenn-emoji">${article.emoji}</div>
          <h3 class="zenn-title">${this.escapeHtml(article.title)}</h3>
        </div>
        <div class="zenn-card-body">
          <div class="zenn-meta">
            <span class="published-date">${publishedDate}</span>
          </div>
        </div>
        <div class="zenn-card-footer">
          <div class="zenn-author">
            <img src="${article.user.avatarSmallUrl}" alt="${article.user.name}" class="author-avatar">
            <span class="author-name">${this.escapeHtml(article.user.name || article.user.username)}</span>
          </div>
          <div class="zenn-likes">
            <span class="like-icon">❤️</span>
            <span class="like-count">${article.likedCount}</span>
          </div>
        </div>
      </a>
    `;
  }

  private createErrorState(message: string, subMessage?: string, showRetry: boolean = true): string {
    return `
      <div class="zenn-trends-section">
        <h2 class="section-title">📈 Zennトレンド記事</h2>
        <div class="error-card">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">${message}</h3>
          ${subMessage ? `<p class="error-subtitle">${subMessage}</p>` : ''}
          ${showRetry ? `<button class="retry-button" onclick="window.zennTrends?.refresh()">再試行</button>` : ''}
          <a href="https://zenn.dev/topics/tech?order=trend" target="_blank" rel="noopener noreferrer" class="zenn-link-button">
            Zennサイトで確認
          </a>
        </div>
      </div>
    `;
  }

  private createSuccessState(): string {
    const cardsHtml = this.state.articles.map(article => this.createArticleCard(article)).join('');

    let statusMessage = '';
    if (this.state.lastUpdated) {
      statusMessage = `<p class="last-updated">最終更新: ${this.state.lastUpdated}</p>`;
    }

    return `
      <div class="zenn-trends-section">
        <h2 class="section-title">📈 Zennトレンド記事</h2>
        ${statusMessage}
        <div class="zenn-cards-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  private createCacheWarning(source: string, cacheAge?: number): string {
    let warningMessage = '';

    if (source === 'cache' && cacheAge !== undefined) {
      warningMessage = `最新データの取得に失敗したため、キャッシュを表示しています（${cacheAge}分前のデータ）`;
    } else if (source === 'extended-cache' && cacheAge !== undefined) {
      warningMessage = `最新データの取得に失敗したため、古いキャッシュを表示しています（${cacheAge}時間前のデータ）`;
    } else if (source === 'mock') {
      warningMessage = 'サンプルデータを表示しています（開発環境）';
    }

    return warningMessage ? `
      <div class="cache-warning">
        <span class="warning-icon">ℹ️</span>
        <span class="warning-text">${warningMessage}</span>
      </div>
    ` : '';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private render(): void {
    if (this.state.loading.isLoading) {
      this.container.innerHTML = this.createLoadingState();
      return;
    }

    if (this.state.error) {
      this.container.innerHTML = this.createErrorState(
        this.state.error.message,
        this.state.error.subMessage,
        this.state.error.showRetryButton
      );
      return;
    }

    this.container.innerHTML = this.createSuccessState();
  }

  async init(): Promise<void> {
    // グローバルに参照を保存（再試行ボタン用）
    (window as any).zennTrends = this;

    await this.loadTrends();
  }

  async loadTrends(): Promise<void> {
    this.state.loading = { isLoading: true, message: 'トレンド記事を取得中...' };
    this.state.error = null;
    this.render();

    try {
      const result = await zennService.getTrendArticles();

      this.state.articles = result.articles;
      this.state.loading = { isLoading: false };
      this.state.lastUpdated = new Date().toLocaleString('ja-JP');

      // キャッシュ使用時の警告表示
      if (result.source !== 'api') {
        const warningHtml = this.createCacheWarning(result.source, result.cacheAge);
        setTimeout(() => {
          const section = this.container.querySelector('.zenn-trends-section');
          if (section && warningHtml) {
            section.insertAdjacentHTML('afterbegin', warningHtml);
          }
        }, 100);
      }

    } catch (error) {
      console.error('Failed to load trends:', error);
      this.state.loading = { isLoading: false };
      this.state.error = {
        type: 'error',
        message: 'Zennのトレンド記事を取得できませんでした',
        subMessage: 'ネットワーク接続を確認してください',
        showRetryButton: true
      };
    }

    this.render();
  }

  async refresh(): Promise<void> {
    await this.loadTrends();
  }
}