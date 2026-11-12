import { Component, effect, ElementRef, HostListener, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  public auth = inject(AuthService);
  public cartService = inject(CartService);
  private router = inject(Router);
  private host = inject(ElementRef);

  public menuOpen = signal(false);

  constructor() {
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();

      untracked(() => {
        if (loggedIn) {
          this.cartService.refresh();
        } else {
          this.cartService.clear();
        }
      });
    });
  }

  toggleMenu() {
    this.menuOpen.update((value) => !value);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}