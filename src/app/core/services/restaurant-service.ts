import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ProductsData } from '../../shared/models/product';
import { ApiResponse } from '../../shared/models/api-response';

@Service()
export class RestaurantService {
    public http = inject(HttpClient);
    private baseUrl = "https://restaurantapi.stepacademy.ge/api";

    getProducts(take: number, page: number) {
        return this.http.get<ApiResponse<ProductsData>>(
            `${this.baseUrl}/products?Take=${take}&Page=${page}`
        )
    }
}