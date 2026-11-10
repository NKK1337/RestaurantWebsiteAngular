import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import {
    ResendVerificationResponse,
    ResetPasswordRequest,
    SigninRequest,
    SigninResponse,
    SignupRequest,
    SignupResponse,
    VerifyEmailRequest,
} from '../../shared/models/auth';
import { map, tap, throwError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';

@Service()
export class AuthService {
    public http = inject(HttpClient);
    private baseUrl = 'https://restaurantapi.stepacademy.ge/api';

    accessToken = signal<string | null>(localStorage.getItem('accessToken'));
    refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));
    isLoggedIn = computed(() => !!this.accessToken());

    signup(data: SignupRequest) {
        return this.http.post<SignupResponse>(`${this.baseUrl}/auth/register`, data);
    }

    signin(data: SigninRequest) {
        return this.http
            .post<ApiResponse<SigninResponse>>(`${this.baseUrl}/auth/login`, data)
            .pipe(
                map((res) => res.data),
                tap((data) => {
                    if (data.isVerified) {
                        this.saveTokens(data.accessToken, data.refreshToken);
                    }
                })
            );
    }

    verifyEmail(data: VerifyEmailRequest) {
        return this.http
            .put<ApiResponse<SigninResponse>>(`${this.baseUrl}/auth/verify-email`, data)
            .pipe(
                map((res) => res.data),
                tap((data) => this.saveTokens(data.accessToken, data.refreshToken))
            );
    }

    resendVerification(email: string) {
        return this.http.post<ResendVerificationResponse>(
            `${this.baseUrl}/auth/resend-email-verification/${encodeURIComponent(email)}`,
            null
        );
    }

    refresh() {
        const token = this.refreshToken();

        if (!token) {
            return throwError(() => new Error('არ არის Refresh Token'));
        }

        return this.http
            .post<ApiResponse<SigninResponse>>(
                `${this.baseUrl}/auth/refresh-access-token/${encodeURIComponent(token)}`,
                null
            )
            .pipe(
                map((res) => res.data),
                tap((data) => this.saveTokens(data.accessToken, data.refreshToken))
            );
    }

    forgotPassword(email: string) {
        return this.http
            .post<ApiResponse<string>>(
                `${this.baseUrl}/auth/forgot-password/${encodeURIComponent(email)}`,
                null
            )
            .pipe(map((res) => res.data));
    }

    resetPassword(data: ResetPasswordRequest) {
        return this.http.put(`${this.baseUrl}/auth/reset-password`, data, {
            responseType: 'text',
        });
    }

    private nameClaims = computed<string[]>(() => {
        const token = this.accessToken();
        if (!token) return [];

        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            const payload = JSON.parse(new TextDecoder().decode(bytes));
            const raw = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

            if (Array.isArray(raw)) return raw;
            return raw ? [raw] : [];
        } catch {
            return [];
        }
    });

    userName = computed(() => this.nameClaims()[0] ?? null);
    fullName = computed(() => this.nameClaims().join(' ') || null);

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.accessToken.set(null);
        this.refreshToken.set(null);
    }

    private saveTokens(accessToken: string, refreshToken: string | null) {
        localStorage.setItem('accessToken', accessToken);
        this.accessToken.set(accessToken);

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            this.refreshToken.set(refreshToken);
        }
    }
}