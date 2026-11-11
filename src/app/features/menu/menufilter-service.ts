import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Category, ProductDetails, ProductFilterParams, ProductsList } from './menu.model';
import { ApiResponse } from '../../shared/models/api-response';

@Service()
export class MenufilterService {
    public http = inject(HttpClient)
    private baseUrl = 'https://restaurantapi.stepacademy.ge/api';

    getProductsFilter(filters: ProductFilterParams = {}) {
        let params = new HttpParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, String(value));
            }
        });

        return this.http.get<ApiResponse<ProductsList>>(
            `${this.baseUrl}/products/filter`, { params }
        );
    }

    getProductById(id: number) {
        return this.http.get<ApiResponse<ProductDetails>>(
            `${this.baseUrl}/products/${id}`
        );
    }

    getCategories() {
        return this.http.get<ApiResponse<Category[]>>(
            `${this.baseUrl}/categories`
        )
    }
}
