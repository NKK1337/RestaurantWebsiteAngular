import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { MenufilterService } from '../menu/menufilter-service';
import { CartService } from '../../core/services/cart-service';
import { AuthService } from '../../core/services/auth-service';
import { Product, ProductDetails as ProductDetailsModel } from '../menu/menu.model';

@Component({
  imports: [RouterLink],
  selector: 'app-product-details',
  styleUrl: './product-details.css',
  templateUrl: './product-details.html',
})
export class ProductDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private menuService = inject(MenufilterService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);

  readonly maxQuantity = 20;

  loading = signal(true);
  quantity = signal(1);

  addingId = signal<number | null>(null);
  addedId = signal<number | null>(null);

  product = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => Number(params.get('id'))),
      tap(() => {
        this.loading.set(true);
        this.quantity.set(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }),
      switchMap((id) =>
        id
          ? this.menuService.getProductById(id).pipe(
            map((res) => res.data),
            catchError(() => of(null))
          )
          : of(null)
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: null as ProductDetailsModel | null }
  );

  related = toSignal(
    toObservable(this.product).pipe(
      switchMap((p) =>
        p
          ? this.menuService.getProductsFilter({ CategoryId: p.categoryId, Take: 4 }).pipe(
            map((res) => res.data.products.filter((x) => x.id !== p.id).slice(0, 3)),
            catchError(() => of([] as Product[]))
          )
          : of([] as Product[])
      )
    ),
    { initialValue: [] as Product[] }
  );

  stars = computed(() => {
    const filled = Math.floor(this.product()?.rate ?? 0);
    return [0, 1, 2, 3, 4].map((i) => i < filled);
  });

  increase() {
    this.quantity.update((q) => Math.min(q + 1, this.maxQuantity));
  }

  decrease() {
    this.quantity.update((q) => Math.max(q - 1, 1));
  }

  addToCart(productId: number, quantity: number) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return;
    }

    this.addingId.set(productId);

    this.cartService.addToCart({ productId, quantity }).subscribe({
      next: () => {
        this.addingId.set(null);
        this.addedId.set(productId);
        setTimeout(() => this.addedId.set(null), 1500);
      },
      error: () => this.addingId.set(null),
    });
  }
}