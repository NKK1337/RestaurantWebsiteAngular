import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../core/services/auth-service';

const API_URL = 'https://restaurantapi.stepacademy.ge';
const API_KEY = '318e799d-936a-463b-aa61-942539f4e1b5';

const addHeaders = (req: HttpRequest<unknown>, token: string | null) => {
    const headers: Record<string, string> = { 'X-STEP-KEY': API_KEY };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return req.clone({ setHeaders: headers });
};

export const ApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
    if (!req.url.startsWith(API_URL)) {
        return next(req);
    }

    const auth = inject(AuthService);

    if (req.url.includes('/auth/')) {
        const isRefresh = req.url.includes('/auth/refresh-access-token');
        return next(addHeaders(req, isRefresh ? auth.accessToken() : null));
    }

    return next(addHeaders(req, auth.accessToken())).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401 && auth.refreshToken()) {
                return auth.refresh().pipe(
                    switchMap(() => next(addHeaders(req, auth.accessToken()))),
                    catchError((refreshErr) => {
                        auth.logout();
                        return throwError(() => refreshErr);
                    })
                );
            }
            return throwError(() => err);
        })
    );
};