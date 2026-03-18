import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { FinancialProduct } from '../../core/models/product.interface';
import { DeleteConfirmModalComponent } from '../../shared/components/delete-confirm-modal/delete-confirm-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteConfirmModalComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: FinancialProduct[] = [];
  filteredProducts: FinancialProduct[] = [];
  paginatedProducts: FinancialProduct[] = [];

  searchTerm = '';
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  currentPage = 1;

  isLoading = false;
  error: string | null = null;

  showModal = false;
  productToDelete: FinancialProduct | null = null;
  openMenuId: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los productos. Verifica que el servidor esté corriendo en localhost:3002.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = term
      ? this.products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term)
        )
      : [...this.products];
    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.paginate();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.paginate();
    this.cdr.detectChanges();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  navigateToAdd(): void {
    this.router.navigate(['/add']);
  }

  navigateToEdit(product: FinancialProduct): void {
    this.router.navigate(['/edit', product.id]);
    this.closeMenu();
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  confirmDelete(product: FinancialProduct): void {
    this.productToDelete = product;
    this.showModal = true;
    this.closeMenu();
  }

  onDeleteConfirmed(confirmed: boolean): void {
    this.showModal = false;
    if (confirmed && this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe({
        next: () => {
          this.loadProducts();
          this.productToDelete = null;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Error al eliminar el producto.';
          this.productToDelete = null;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.productToDelete = null;
    }
  }

  getLogoInitials(name: string): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  isImageUrl(logo: string): boolean {
    return logo?.startsWith('http') || logo?.startsWith('/') || logo?.endsWith('.png') || logo?.endsWith('.jpg') || logo?.endsWith('.svg');
  }
}