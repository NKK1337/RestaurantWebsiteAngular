export interface Product {
    id: number;
    name: string;
    description: string;
    vegeterian: boolean;
    spiciness: number;
    rate: number;
    price: number;
    image: string;
    canDelete: boolean;
}

export interface ProductsData {
    products: Product[];
}

export interface Meta {
    name: string;
    description: string;
    website: string;
    location: string;
    email: string;
}

export interface APIResponse<T> {
    data: T;
    meta?: Meta;
}