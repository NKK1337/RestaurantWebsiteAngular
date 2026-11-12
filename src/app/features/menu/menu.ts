import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';
import { MenufilterService } from './menufilter-service';
import { CartService } from '../../core/services/cart-service';
import { AuthService } from '../../core/services/auth-service';
import { Category, Product, ProductFilterParams } from './menu.model';

@Component({
  imports: [],
  selector: 'app-menu',
  styleUrl: './menu.css',
  templateUrl: './menu.html',
})
export class Menu {
  private menuService = inject(MenufilterService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly pageSize = 10;
  readonly maxPrice = 100;

  search = signal('');
  categoryId = signal<number | null>(null);
  vegetarianOnly = signal(false);
  spiciness = signal(0);
  minRating = signal(0);
  minPrice = signal(0);
  maxPriceValue = signal(0);
  page = signal(1);
  loading = signal(true);

  filtersOpen = signal(false);

  // cart button state
  addingId = signal<number | null>(null);
  addedId = signal<number | null>(null);

  toggleFilters() {
    this.filtersOpen.update((open) => !open);
  }

  closeFilters() {
    this.filtersOpen.set(false);
  }

  categories = toSignal(
    this.menuService.getCategories().pipe(
      map((res) => res.data),
      catchError(() => of([] as Category[]))
    ),
    { initialValue: [] as Category[] }
  );

  private params = computed<ProductFilterParams>(() => ({
    Query: this.search().trim() || undefined,
    CategoryId: this.categoryId() ?? undefined,
    Vegetarian: this.vegetarianOnly() ? true : undefined,
    Spiciness: this.spiciness() > 0 ? this.spiciness() : undefined,
    Rate: this.minRating() > 0 ? this.minRating() : undefined,
    MinPrice: this.minPrice() > 0 ? this.minPrice() : undefined,
    MaxPrice: this.maxPriceValue() > 0 ? this.maxPriceValue() : undefined,
    Take: this.pageSize,
    Page: this.page(),
  }));

  private response = toSignal(
    toObservable(this.params).pipe(
      debounceTime(300),
      tap(() => this.loading.set(true)),
      switchMap((params) =>
        this.menuService.getProductsFilter(params).pipe(catchError(() => of(null)))
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: null }
  );

  products = computed(() => this.response()?.data.products ?? []);
  hasMore = computed(() => this.response()?.data.hasMore ?? false);

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

  private setFilter<T>(state: WritableSignal<T>, value: T) {
    state.set(value);
    this.page.set(1);
  }

  private numberFrom(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }

  onSearch(event: Event) {
    this.setFilter(this.search, (event.target as HTMLInputElement).value);
  }

  onCategory(id: number) {
    this.setFilter(this.categoryId, this.categoryId() === id ? null : id);
  }

  onVegetarian(event: Event) {
    this.setFilter(this.vegetarianOnly, (event.target as HTMLInputElement).checked);
  }

  onSpiciness(event: Event) {
    this.setFilter(this.spiciness, this.numberFrom(event));
  }

  onRating(event: Event) {
    this.setFilter(this.minRating, this.numberFrom(event));
  }

  onMinPrice(event: Event) {
    const value = this.numberFrom(event);
    this.setFilter(this.minPrice, value);
    if (this.maxPriceValue() > 0 && value > this.maxPriceValue()) {
      this.maxPriceValue.set(value);
    }
  }

  onMaxPrice(event: Event) {
    const value = this.numberFrom(event);
    this.setFilter(this.maxPriceValue, value);
    if (value > 0 && value < this.minPrice()) {
      this.minPrice.set(value);
    }
  }

  clearFilters() {
    this.search.set('');
    this.categoryId.set(null);
    this.vegetarianOnly.set(false);
    this.spiciness.set(0);
    this.minRating.set(0);
    this.minPrice.set(0);
    this.maxPriceValue.set(0);
    this.page.set(1);
  }

  nextPage() {
    if (!this.hasMore()) return;
    this.page.update((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage() {
    if (this.page() <= 1) return;
    this.page.update((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}