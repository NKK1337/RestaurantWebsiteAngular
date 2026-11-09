import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

const COOLDOWN_SECONDS = 60;
const CODE_REGEX = /^\d{6}$/;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-verify-email',
  styleUrl: './verify-email.css',
  templateUrl: './verify-email.html',
})
export class VerifyEmail {
  private fb = inject(FormBuilder);
  private service = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private timerId: ReturnType<typeof setInterval> | null = null;

  public email = this.route.snapshot.queryParamMap.get('email');

  public loading = signal(false);
  public resending = signal(false);
  public resent = signal(false);
  public errorMessage = signal<string | null>(null);
  public cooldown = signal(0);

  public form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(CODE_REGEX)]],
  });

  constructor() {
    this.startCooldown();
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  onCodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);

    if (input.value !== digitsOnly) {
      this.form.controls.code.setValue(digitsOnly);
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.email) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.resent.set(false);

    this.service
      .verifyEmail({ email: this.email, code: this.form.controls.code.value })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const body = err.error;
          const message = typeof body === 'string' ? body : body?.detail ?? body?.title;
          this.errorMessage.set(message ?? 'Invalid or expired code. Try again.');
        },
      });
  }

  resend() {
    if (!this.email || this.resending() || this.cooldown() > 0) {
      return;
    }

    this.resending.set(true);
    this.resent.set(false);
    this.errorMessage.set(null);

    this.service.resendVerification(this.email).subscribe({
      next: (res) => {
        this.resending.set(false);

        if (res.isSuccess) {
          this.resent.set(true);
          this.startCooldown();
        } else {
          this.errorMessage.set(res.error ?? 'Could not send the email. Try again.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.resending.set(false);
        const body = err.error;
        const message = typeof body === 'string' ? body : body?.detail ?? body?.title;
        this.errorMessage.set(message ?? 'Could not send the email. Try again.');
      },
    });
  }

  private startCooldown() {
    this.clearTimer();
    this.cooldown.set(COOLDOWN_SECONDS);

    this.timerId = setInterval(() => {
      this.cooldown.update((value) => value - 1);

      if (this.cooldown() <= 0) {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
