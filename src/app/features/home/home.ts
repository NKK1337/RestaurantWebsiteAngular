import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant-service';
import { CartService } from '../../core/services/cart-service';
import { AuthService } from '../../core/services/auth-service';
import { Product } from '../../shared/models/product';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private service = inject(RestaurantService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private router = inject(Router);

  public products = signal<Product[]>([]);
  public addingId = signal<number | null>(null);
  public addedId = signal<number | null>(null);

  constructor() {
    this.service.getProducts(6, 1).subscribe(res => {
      this.products.set([...res.data.products].sort((a, b) => b.rate - a.rate));
    });
  }

  addToCart(product: Product) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return;
    }

    this.addingId.set(product.id);

    this.cartService.addToCart({ productId: product.id, quantity: 1 }).subscribe({
      next: () => {
        this.addingId.set(null);
        this.addedId.set(product.id);
        setTimeout(() => this.addedId.set(null), 1500);
      },
      error: () => this.addingId.set(null),
    });
  }
}