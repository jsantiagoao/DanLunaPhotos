import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl: string;
  imageCredit: string;
  caption: string;
  createdAt: string;
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    @if (post) {
      <article class="blog-post">
        <div class="post-hero">
          <img [src]="post.imageUrl" [alt]="post.title">
        </div>
        <div class="post-header">
          <span class="post-category">{{ post.category }}</span>
          <h1>{{ post.title }}</h1>
          <span class="post-date">{{ post.createdAt | date:'d MMMM, yyyy':'UTC' }}</span>
        </div>
        <div class="post-content" [innerHTML]="renderedContent"></div>
        <div class="post-footer">
          <div class="follow-cta">
            <p>¿Te gustó este artículo?</p>
            <a href="https://www.instagram.com/danlunaphotos" target="_blank" class="ig-btn">
              Sígueme en Instagram &#64;danlunaphotos
            </a>
          </div>
          <div class="share-bar">
            <span>Compartir:</span>
            <a [href]="'https://wa.me/?text=' + encodeShare()" target="_blank" class="share-btn whatsapp">WhatsApp</a>
            <a [href]="'https://www.facebook.com/sharer/sharer.php?u=' + getPostUrl()" target="_blank" class="share-btn facebook">Facebook</a>
            <button class="share-btn copy" (click)="copyLink()">{{ copied ? '✓ Copiado' : 'Copiar link' }}</button>
          </div>
          <div class="post-meta">
            <span class="credit">Foto: {{ post.imageCredit }}</span>
            <a routerLink="/blog" class="back-link">← Volver al blog</a>
          </div>
        </div>
      </article>
    } @else if (!loading) {
      <div class="not-found">
        <h2>Post no encontrado</h2>
        <a routerLink="/blog">← Volver al blog</a>
      </div>
    }
    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; background: #fff; }
    .blog-post { max-width: 700px; margin: 0 auto; padding: 0 1rem 4rem; }
    .post-hero {
      width: 100vw; margin-left: calc(-50vw + 50%); height: 350px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .post-header {
      padding: 2rem 0 1rem; border-bottom: 1px solid #EAE7E1; margin-bottom: 2rem;
      h1 { font-family: 'Fraunces', serif; color: #2D2420; font-size: 2rem; margin: 0.5rem 0; line-height: 1.3; }
    }
    .post-category {
      font-size: 0.7rem; text-transform: uppercase; color: #AD8A6A;
      font-weight: 600; letter-spacing: 0.5px;
    }
    .post-date { color: #bbb; font-size: 0.85rem; }
    .post-content {
      line-height: 1.9; color: #2D2420; font-size: 1.05rem;
      ::ng-deep h2 { font-family: 'Fraunces', serif; color: #2D2420; margin: 2rem 0 0.8rem; font-size: 1.4rem; }
      ::ng-deep p { margin-bottom: 1.2rem; }
      ::ng-deep strong { color: #2D2420; }
    }
    .post-footer { margin-top: 3rem; }
    .follow-cta {
      text-align: center; padding: 2rem; background: #F9F5F2; border-radius: 12px; margin-bottom: 2rem;
      p { font-family: 'Fraunces', serif; font-size: 1.2rem; color: #2D2420; margin-bottom: 1rem; }
    }
    .ig-btn {
      display: inline-block; background: #AD8A6A; color: #fff; padding: 12px 28px;
      border-radius: 8px; text-decoration: none; font-weight: 600; font-family: 'DM Sans', sans-serif;
      transition: background 0.2s;
      &:hover { background: #2D2420; }
    }
    .post-meta {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 1rem; border-top: 1px solid #EAE7E1; margin-top: 1rem;
    }
    .share-bar {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;
      span { font-size: 0.85rem; color: #666; }
    }
    .share-btn {
      padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 500;
      text-decoration: none; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
    }
    .share-btn.whatsapp { background: #25D366; color: #fff; }
    .share-btn.facebook { background: #1877F2; color: #fff; }
    .share-btn.copy { background: #EAE7E1; color: #2D2420; }
    .credit { font-size: 0.8rem; color: #bbb; }
    .back-link { color: #AD8A6A; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
    .not-found { text-align: center; padding: 4rem 1rem; a { color: #AD8A6A; } }
    @media (max-width: 600px) {
      .post-hero { height: 220px; }
      .post-header h1 { font-size: 1.5rem; }
      .post-content { font-size: 1rem; }
    }
  `]
})
export class BlogPostComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  post: BlogPost | null = null;
  renderedContent = '';
  loading = true;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) { this.loading = false; return; }

    this.http.get<BlogPost>(`${environment.apiUrl}/blog/${slug}`).subscribe({
      next: (post) => {
        this.post = post;
        this.renderedContent = this.markdownToHtml(post.content);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  copied = false;

  getPostUrl(): string {
    return encodeURIComponent(`https://danlunaphoto.com/blog/${this.post?.slug}`);
  }

  encodeShare(): string {
    return encodeURIComponent(`${this.post?.title} 📸\nhttps://danlunaphoto.com/blog/${this.post?.slug}`);
  }

  copyLink() {
    navigator.clipboard.writeText(`https://danlunaphoto.com/blog/${this.post?.slug}`);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  private markdownToHtml(md: string): string {
    // Handle escaped newlines from JSON
    let html = md.replace(/\\n/g, '\n');
    html = html
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }
}
