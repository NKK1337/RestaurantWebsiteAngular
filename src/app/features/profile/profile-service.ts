import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import {
    ActionResponse,
    ChangePasswordRequest,
    CurrentUser,
    EditProfileRequest,
    Profile,
} from './profile.model';

@Service()
export class ProfileService {
    public http = inject(HttpClient);
    private baseUrl = "https://restaurantapi.stepacademy.ge/api/users";

    getCurrentUser() {
        return this.http
            .get<ApiResponse<CurrentUser>>(`${this.baseUrl}/me`)
            .pipe(map((res) => res.data));
    }

    getProfile() {
        return this.http
            .get<ApiResponse<Profile>>(`${this.baseUrl}/profile`)
            .pipe(map((res) => res.data));
    }

    editProfile(body: EditProfileRequest) {
        return this.http.put<ActionResponse>(`${this.baseUrl}/edit`, body);
    }

    changePassword(body: ChangePasswordRequest) {
        return this.http.put<ActionResponse>(`${this.baseUrl}/change-password`, body);
    }

    deleteAccount() {
        return this.http.delete<ActionResponse>(`${this.baseUrl}/delete`);
    }
}