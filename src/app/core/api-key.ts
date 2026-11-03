import { HttpInterceptorFn } from "@angular/common/http"

const API_KEY = '318e799d-936a-463b-aa61-942539f4e1b5'

export const ApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.startsWith('https://restaurantapi.stepacademy.ge')) {
        req = req.clone({ setHeaders: { "X-STEP-KEY": API_KEY } })
    }
    return next(req)
}