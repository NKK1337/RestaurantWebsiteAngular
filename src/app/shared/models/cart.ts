import { Product } from './product';

export interface CartItem {
    id: number;
    quantity: number;
    product: Product;
}

/** GET /api/cart */
export interface Cart {
    totalItems: number;
    totalPrice: number;
    items: CartItem[];
}

export interface AddToCartRequest {
    productId: number;
    quantity: number;
}

export interface EditQuantityRequest {
    itemId: number;
    quantity: number;
}

export interface CartActionResponse {
    isSuccess: boolean;
    error?: {
        message: string;
        statusCode: number;
    };
}