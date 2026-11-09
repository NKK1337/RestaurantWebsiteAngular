import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-signin',
  styleUrl: './signin.css',
  templateUrl: './signin.html',
})
export class Signin {
  private fb = inject(FormBuilder);
  private service = inject(AuthService);
  private router = inject(Router);

  public loading = signal(false);
  public errorMessage = signal<string | null>(null);
  public showPassword = signal(false);

  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    password: ['', Validators.required],
  });

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

    this.service.signin(this.form.getRawValue()).subscribe({
      next: (res) => {
        console.log('isVerified:', res.isVerified, typeof res.isVerified);
        console.log('keys:', Object.keys(res));
        console.log('full:', JSON.stringify(res));
        this.loading.set(false);

        if (res.isVerified) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/verifyemail'], {
            queryParams: { email: this.form.controls.email.value },
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error;
        const message = typeof body === 'string' ? body : body?.detail ?? body?.title;
        this.errorMessage.set(message ?? 'Login failed. Check your email and password.');
      },
    });
  }
}