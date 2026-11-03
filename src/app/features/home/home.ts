import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../core/services/restaurant-service';
import { Product } from '../../shared/models/product';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private service = inject(RestaurantService);
  public products = signal<Product[]>([]);

  constructor() {
    this.service.getProducts(6, 1).subscribe(res => {
      this.products.set([...res.data.products].sort((a, b) => b.rate - a.rate));
    });
  }

}