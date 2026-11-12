import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { catchError, forkJoin, of, tap, throwError } from 'rxjs';
import { Cart, AddToCartRequest, EditQuantityRequest, CartActionResponse } from '../../shared/models/cart';
import { ApiResponse } from '../../shared/models/api-response';

@Service()
export class CartService {
    public http = inject(HttpClient);
    private baseUrl = "https://restaurantapi.stepacademy.ge/api";

    cart = signal<Cart | null>(null);
    count = computed(() => this.cart()?.items.length ?? 0);

    getCart() {
        return this.http.get<ApiResponse<Cart>>(
            `${this.baseUrl}/cart`
        ).pipe(
            tap((res) => this.cart.set(res.data))
        )
    }

    addToCart(data: AddToCartRequest) {
        return this.http.post<CartActionResponse>(
            `${this.baseUrl}/cart/add-to-cart`, data
        ).pipe(
            tap(() => this.refresh())
        )
    }

    editQuantity(data: EditQuantityRequest) {
        this.updateLocal((items) =>
            items.map((item) =>
                item.id === data.itemId ? { ...item, quantity: data.quantity } : item
            )
        );

        return this.http.put<CartActionResponse>(
            `${this.baseUrl}/cart/edit-quantity`, data
        ).pipe(
            catchError((err) => {
                this.refresh();
                return throwError(() => err);
            })
        )
    }

    removeItem(itemId: number) {
        this.updateLocal((items) => items.filter((item) => item.id !== itemId));

        return this.http.delete<CartActionResponse>(
            `${this.baseUrl}/cart/remove-from-cart/${itemId}`
        ).pipe(
            catchError((err) => {
                this.refresh();
                return throwError(() => err);
            })
        )
    }

    clearCart() {
        const items = this.cart()?.items ?? [];
        if (items.length === 0) return of([] as CartActionResponse[]);

        this.updateLocal(() => []);

        return forkJoin(
            items.map((item) =>
                this.http.delete<CartActionResponse>(
                    `${this.baseUrl}/cart/remove-from-cart/${item.id}`
                )
            )
        ).pipe(
            catchError((err) => {
                this.refresh();
                return throwError(() => err);
            })
        );
    }

    refresh() {
        this.getCart().subscribe({ error: () => { } });
    }

    clear() {
        this.cart.set(null);
    }

    private updateLocal(change: (items: Cart['items']) => Cart['items']) {
        const current = this.cart();
        if (!current) return;

        const items = change(current.items);
        const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

        this.cart.set({ ...current, items, totalPrice });
    }
}