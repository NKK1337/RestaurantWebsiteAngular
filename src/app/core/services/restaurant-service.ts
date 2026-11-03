import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { APIResponse, ProductsData } from '../../shared/models/product';

@Service()
export class RestaurantService {
    public http = inject(HttpClient);
    private baseUrl = "https://restaurantapi.stepacademy.ge/api";

    getProducts(take: number, page: number) {
        return this.http.get<APIResponse<ProductsData>>(
            `${this.baseUrl}/products?Take=${take}&Page=${page}`
        )
    }
}