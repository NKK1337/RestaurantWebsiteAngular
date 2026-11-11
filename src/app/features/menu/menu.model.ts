/** (GET /api/products/filter) */
export interface Product {
    id: number;
    name: string;
    description: string;
    vegetarian: boolean;
    spiciness: number;
    rate: number;
    price: number;
    image: string;
    canDelete: boolean;
}

/** /api/products/filter */
export interface ProductsList {
    products: Product[];
    hasMore: boolean;
}

/** /api/products/filter */
export interface ProductFilterParams {
    Query?: string;
    Vegetarian?: boolean;
    Spiciness?: number;
    Rate?: number;
    MinPrice?: number;
    MaxPrice?: number;
    CategoryId?: number;
    Take?: number;
    Page?: number;
}

/** /api/categories */
export interface Category {
    id: number;
    name: string;
    canDelete: boolean;
}

/** (GET /api/products/{id}) */
export interface ProductCategory {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    isUserCreated: boolean;
    key: string;
    products?: string[];
}

/** /api/products/{id} */
export interface ProductDetails {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    vegetarian: boolean;
    spiciness: number;
    rate: number;
    price: number;
    image: string;
    method: string;
    ingredients: string[];
    isUserCreated: boolean;
    key: string;
    categoryId: number;
    category: ProductCategory;
}