import { ZennService } from '../services/zennService';
import { ZennArticle, ZennTrendsState } from '../types/zenn';

const zennService = new ZennService();

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
    const url = `https://zenn.dev/${article.user.username}/articles/${article.slug}`;
    const publishedDate = new Date(article.publishedAt).toLocaleDateString('ja-JP');

    // カテゴリバッジ
    const categoryBadge = this.getCategoryBadge(article);

    return `
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="zenn-card article">
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
          ${categoryBadge}
          <div class="zenn-likes">
            <span class="like-icon">❤️</span>
            <span class="like-count">${article.likedCount}</span>
          </div>
        </div>
      </a>
    `;
  }

  private getCategoryBadge(article: ZennArticle): string {
    const badgeClass = article.articleType === 'tech' ? 'tech' : 'idea';
    const badgeText = article.articleType === 'tech' ? 'Tech' : 'Idea';
    return `<span class="category-badge ${badgeClass}">${badgeText}</span>`;
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
      // Convex版のサービスを使用
      const articles = await zennService.getTrendArticles();

      this.state.articles = articles;
      this.state.loading = { isLoading: false };
      this.state.lastUpdated = new Date().toLocaleString('ja-JP');

      // Convex版では常にリアルタイムデータを取得するため、キャッシュ警告は不要

    } catch (error) {
      console.error('Failed to load trends:', error);
      this.state.loading = { isLoading: false };
      this.state.error = {
        type: 'error',
        message: 'Zennのトレンド記事を取得できませんでした',
        subMessage: 'Convexサーバーとの接続を確認してください',
        showRetryButton: true
      };
    }

    this.render();
  }

  async refresh(): Promise<void> {
    this.state.loading = { isLoading: true, message: 'データを更新中...' };
    this.state.error = null;
    this.render();

    try {
      // Convexの手動更新機能を使用
      const articles = await zennService.refreshTrends();

      this.state.articles = articles;
      this.state.loading = { isLoading: false };
      this.state.lastUpdated = new Date().toLocaleString('ja-JP');

    } catch (error) {
      console.error('Failed to refresh trends:', error);
      this.state.loading = { isLoading: false };
      this.state.error = {
        type: 'error',
        message: 'データの更新に失敗しました',
        subMessage: 'Convexサーバーとの接続を確認してください',
        showRetryButton: true
      };
    }

    this.render();
  }
}