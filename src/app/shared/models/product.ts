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