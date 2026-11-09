import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth-service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.css',
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private service = inject(AuthService);

  public loading = signal(false);
  public sent = signal(false);
  public errorMessage = signal<string | null>(null);

  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.service.forgotPassword(this.form.controls.email.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const body = err.error;
        const message = typeof body === 'string' ? body : body?.detail ?? body?.title;
        this.errorMessage.set(message ?? 'Could not send the reset link. Try again.');
      },
    });
  }
}