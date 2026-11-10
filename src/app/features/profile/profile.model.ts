export interface ApiResponse<T> {
    data: T;
    meta?: {
        name: string;
        description: string;
        website: string;
        location: string;
        email: string;
    };
}

// GET /api/users/profile 
export interface Profile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    picture: string | null;
    address: string | null;
    age: number | null;
    createdAt: string;
    updatedAt: string;
}

// GET /api/users/me 
export interface CurrentUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

// PUT /api/users/edit 
export interface EditProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    picture: string | null;
    address: string | null;
    age: number | null;
}

// PUT change password 
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ActionResponse {
    isSuccess: boolean;
    error: {
        message: string;
        statusCode: number;
    } | null;
}