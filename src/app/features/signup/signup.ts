import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth-service';

const NAME_REGEX = /^[A-Za-zა-ჰ]{2,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  private fb = inject(FormBuilder);
  private service = inject(AuthService);
  private router = inject(Router);

  public loading = signal(false);
  public errorMessage = signal<string | null>(null);
  public showPassword = signal(false);

  public form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.pattern(NAME_REGEX)]],
    lastName: ['', [Validators.required, Validators.pattern(NAME_REGEX)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_REGEX)]],
  });

  get hasMinLength(): boolean {
    return this.form.controls.password.value.length >= 8;
  }

  get hasUpperAndLower(): boolean {
    const value = this.form.controls.password.value;
    return /[a-z]/.test(value) && /[A-Z]/.test(value);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.form.controls.password.value);
  }

  togglePassword() {
    this.showPassword.update((value) => !value);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.service.signup(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/verifyemail'], {
          queryParams: { email: this.form.controls.email.value },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error;
        const message = typeof body === 'string' ? body : body?.detail ?? body?.title;
        this.errorMessage.set(message ?? 'Signup failed. Try again.');
      },
    });
  }
}