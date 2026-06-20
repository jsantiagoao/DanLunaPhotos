import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  createdAt: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <section class="blog-hero">
      <h1>Blog</h1>
      <p>Tips, inspiración y detrás de cámaras</p>
    </section>

    <section class="blog-grid">
      @for (post of posts; track post._id) {
        <a [routerLink]="['/blog', post.slug]" class="blog-card">
          <div class="card-image">
            <img [src]="post.imageUrl" [alt]="post.title" loading="lazy">
          </div>
          <div class="card-body">
            <span class="card-category">{{ post.category }}</span>
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
            <span class="card-date">{{ post.createdAt | date:'d MMMM, yyyy':'UTC' }}</span>
          </div>
        </a>
      }

      @if (posts.length === 0 && !loading) {
        <div class="empty">
          <p>Próximamente publicaremos contenido. ¡Vuelve pronto!</p>
        </div>
      }
    </section>

    <section class="blog-footer-cta">
      <p>¿Quieres más tips como estos?</p>
      <a href="https://www.instagram.com/danlunaphotos" target="_blank" class="ig-btn">
        Sígueme en Instagram &#64;danlunaphotos
      </a>
    </section>

    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: block; background: #fff; }
    .blog-hero {
      text-align: center; padding: 4rem 1rem 2rem;
      h1 { font-family: 'Fraunces', serif; font-size: 2.5rem; color: #2D2420; }
      p { color: #999; margin-top: 0.5rem; font-size: 1rem; }
    }
    .blog-grid {
      max-width: 1100px; margin: 0 auto; padding: 0 1.5rem 3rem;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;
    }
    .blog-card {
      text-decoration: none; color: inherit; border-radius: 12px;
      overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s; background: #fff;
      &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    }
    .card-image {
      height: 200px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    }
    .blog-card:hover .card-image img { transform: scale(1.05); }
    .card-body {
      padding: 1.2rem 1.4rem;
      h2 { font-family: 'Fraunces', serif; font-size: 1.15rem; color: #2D2420; margin: 0.5rem 0; line-height: 1.4; }
      p { font-size: 0.9rem; color: #666; line-height: 1.5; margin: 0; }
    }
    .card-category {
      font-size: 0.7rem; text-transform: uppercase; color: #AD8A6A;
      font-weight: 600; letter-spacing: 0.5px;
    }
    .card-date { display: block; margin-top: 0.8rem; font-size: 0.8rem; color: #bbb; }
    .empty { grid-column: 1/-1; text-align: center; padding: 3rem; color: #666; }
    .blog-footer-cta {
      text-align: center; padding: 2.5rem 1rem 4rem; border-top: 1px solid #EAE7E1;
      max-width: 600px; margin: 0 auto;
      p { color: #2D2420; font-family: 'Fraunces', serif; font-size: 1.3rem; margin-bottom: 1rem; }
    }
    .ig-btn {
      display: inline-block; background: #AD8A6A; color: #fff; padding: 12px 28px;
      border-radius: 8px; text-decoration: none; font-weight: 600; font-family: 'DM Sans', sans-serif;
      transition: background 0.2s;
      &:hover { background: #2D2420; }
    }
    @media (max-width: 600px) {
      .blog-grid { grid-template-columns: 1fr; padding: 0 1rem 3rem; }
      .blog-hero h1 { font-size: 2rem; }
    }
  `]
})
export class BlogComponent implements OnInit {
  private http = inject(HttpClient);
  posts: BlogPost[] = [];
  loading = true;

  ngOnInit() {
    this.http.get<BlogPost[]>(`${environment.apiUrl}/blog`).subscribe({
      next: (posts) => { this.posts = posts; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
