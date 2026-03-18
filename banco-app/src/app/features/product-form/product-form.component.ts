import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, map, catchError, switchMap, debounceTime, distinctUntilChanged, first } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { FinancialProduct } from '../../core/models/product.interface';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  isSubmitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    this.initForm();

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [
        { value: '', disabled: this.isEditMode },
        [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        this.isEditMode ? [] : [this.uniqueIdValidator()]
      ],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', [Validators.required]],
      date_release: ['', [Validators.required, this.minTodayValidator()]],
      date_revision: [{ value: '', disabled: true }]
    });

    this.form.get('date_release')?.valueChanges.subscribe(value => {
      if (value) {
        const release = new Date(value);
        const revision = new Date(release);
        revision.setFullYear(revision.getFullYear() + 1);
        const revisionStr = revision.toISOString().split('T')[0];
        this.form.get('date_revision')?.setValue(revisionStr, { emitEvent: false });
      }
    });
  }

  private minTodayValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(control.value + 'T00:00:00');
      return selected >= today ? null : { minDate: true };
    };
  }

  private uniqueIdValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) return of(null);
      return of(control.value).pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(id =>
          this.productService.verifyId(id).pipe(
            map(exists => exists ? { idExists: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  private loadProduct(id: string): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        const product = products.find(p => p.id === id);
        if (product) {
          this.form.patchValue({
            id: product.id,
            name: product.name,
            description: product.description,
            logo: product.logo,
            date_release: product.date_release,
            date_revision: product.date_revision
          });
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => this.router.navigate(['/'])
    });
  }

  get f() { return this.form.controls; }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Este campo es requerido';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres`;
    if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres`;
    if (ctrl.errors['idExists']) return 'ID no válido!';
    if (ctrl.errors['minDate']) return 'La fecha debe ser mayor o igual a hoy';
    return 'Campo inválido';
  }

  isIdChecking(): boolean {
    const ctrl = this.form.get('id');
    return !!(ctrl && ctrl.pending);
  }

  onReset(): void {
    this.form.reset();
    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.pending) return;

    this.isSubmitting = true;
    this.submitError = null;

    const rawVal = this.form.getRawValue();
    const payload: FinancialProduct = {
      id: rawVal.id,
      name: rawVal.name,
      description: rawVal.description,
      logo: rawVal.logo,
      date_release: rawVal.date_release,
      date_revision: rawVal.date_revision
    };

    const request$ = this.isEditMode && this.productId
      ? this.productService.updateProduct(this.productId, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Error al guardar el producto.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
