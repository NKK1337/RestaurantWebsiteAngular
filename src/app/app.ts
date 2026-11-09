import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { Footer } from './core/layout/footer/footer';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private router = inject(Router)

  private hiddenLayoutRoutes = ['/signin', '/signup', '/verifyemail', '/forgot-password'];

  get hideLayout(): boolean {
    const url = this.router.url.split('?')[0];
    return this.hiddenLayoutRoutes.includes(url);
  }
}
