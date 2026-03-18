import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { FinancialProduct } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = '/bp/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<FinancialProduct[]> {
    return this.http.get<{ data: FinancialProduct[] }>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  createProduct(product: FinancialProduct): Observable<{ message: string; data: FinancialProduct }> {
    return this.http.post<{ message: string; data: FinancialProduct }>(this.baseUrl, product);
  }

  updateProduct(id: string, product: Omit<FinancialProduct, 'id'>): Observable<{ message: string; data: FinancialProduct }> {
    return this.http.put<{ message: string; data: FinancialProduct }>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }
}
