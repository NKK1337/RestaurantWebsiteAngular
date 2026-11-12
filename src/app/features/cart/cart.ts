import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart-service';
import { CartItem } from '../../shared/models/cart';

@Component({
  imports: [RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  private cartService = inject(CartService);
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly taxRate = 0.1;
  readonly maxQuantity = 20;

  cart = this.cartService.cart;
  checkingOut = signal(false);
  toastVisible = signal(false);

  items = computed(() => this.cart()?.items ?? []);
  totalItems = computed(() => this.items().length);

  subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );
  tax = computed(() => this.subtotal() * this.taxRate);
  total = computed(() => this.subtotal() + this.tax());

  constructor() {
    this.cartService.refresh();
  }

  increase(item: CartItem) {
    if (item.quantity >= this.maxQuantity) return;
    this.cartService.editQuantity({ itemId: item.id, quantity: item.quantity + 1 }).subscribe({ error: () => { } });
  }

  decrease(item: CartItem) {
    if (item.quantity <= 1) return;
    this.cartService.editQuantity({ itemId: item.id, quantity: item.quantity - 1 }).subscribe({ error: () => { } });
  }

  remove(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe({ error: () => { } });
  }

  checkout() {
    if (this.checkingOut() || this.items().length === 0) return;

    this.checkingOut.set(true);

    this.cartService.clearCart().subscribe({
      next: () => {
        this.checkingOut.set(false);
        this.showToast();
      },
      error: () => this.checkingOut.set(false),
    });
  }

  showToast() {
    clearTimeout(this.toastTimer);
    this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 4000);
  }

  closeToast() {
    clearTimeout(this.toastTimer);
    this.toastVisible.set(false);
  }
}