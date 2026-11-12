import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Signin } from './features/signin/signin';
import { Signup } from './features/signup/signup';
import { VerifyEmail } from './features/verify-email/verify-email';
import { ForgotPassword } from './features/forgot-password/forgot-password';
import { Profile } from './features/profile/profile';
import { Menu } from './features/menu/menu';
import { Cart } from './features/cart/cart';
import { ProductDetails } from './features/product-details/product-details';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'signin', component: Signin },
    { path: 'signup', component: Signup },
    { path: 'verifyemail', component: VerifyEmail },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'profile', component: Profile },
    { path: 'menu', component: Menu },
    { path: 'cart', component: Cart },
    { path: 'product', component: ProductDetails },
];
