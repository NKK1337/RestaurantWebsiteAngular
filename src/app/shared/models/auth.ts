export interface SignupRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface SignupResponse {
    token: string;
}

export interface SigninRequest {
    email: string;
    password: string;
}

export interface SigninResponse {
    accessToken: string;
    refreshToken: string;
    isVerified: boolean;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface ResendVerificationResponse {
    isSuccess: boolean;
    error: string | null;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}