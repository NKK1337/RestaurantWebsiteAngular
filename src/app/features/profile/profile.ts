import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProfileService } from './profile-service';
import { AuthService } from '../../core/services/auth-service';
import {
  ChangePasswordRequest,
  EditProfileRequest,
  Profile as UserProfile,
} from './profile.model';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function passwordsMatch(form: AbstractControl): ValidationErrors | null {
  const newPassword = form.get('newPassword')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { mismatch: true };
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);
  private router = inject(Router);

  profile = signal<UserProfile | null>(null);

  activeTab = signal<'personal' | 'password' | 'account'>('personal');

  isLoading = signal(true);
  isSaving = signal(false);
  isChangingPassword = signal(false);
  isDeleting = signal(false);

  showDeleteModal = signal(false);

  loadError = signal('');
  successMessage = signal('');
  errorMessage = signal('');

  pictureUrl = signal('');
  pictureFailed = signal(false);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  editForm = new FormGroup({
    picture: new FormControl(''),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phoneNumber: new FormControl(''),
    address: new FormControl(''),
    age: new FormControl<number | null>(null, [Validators.min(1), Validators.max(120)]),
  });

  passwordForm = new FormGroup(
    {
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordsMatch }
  );

  ngOnInit() {
    this.editForm.controls.picture.valueChanges.subscribe((value) => {
      this.pictureUrl.set((value ?? '').trim());
      this.pictureFailed.set(false);
    });

    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.loadError.set('');

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.fillForm(profile);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.loadError.set(this.getErrorText(error));
        this.isLoading.set(false);
      },
    });
  }

  fillForm(profile: UserProfile) {
    this.editForm.setValue({
      picture: profile.picture ?? '',
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber ?? '',
      address: profile.address ?? '',
      age: profile.age,
    });
  }

  setTab(tab: 'personal' | 'password' | 'account') {
    this.activeTab.set(tab);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  isInvalid(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }

  saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const form = this.editForm.value;

    const body: EditProfileRequest = {
      firstName: form.firstName?.trim() ?? '',
      lastName: form.lastName?.trim() ?? '',
      phoneNumber: form.phoneNumber?.trim() || null,
      picture: form.picture?.trim() || null,
      address: form.address?.trim() || null,
      age: form.age ?? null,
    };

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.profileService.editProfile(body).subscribe({
      next: (response) => {
        this.isSaving.set(false);

        if (response.isSuccess) {
          this.successMessage.set('გაგანახლე ნაცნობო.');
          this.loadProfileSilently();
        } else {
          this.errorMessage.set(response.error?.message ?? 'ვერ გაგანახლე მეგობარო.');
        }
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(this.getErrorText(error));
      },
    });
  }

  loadProfileSilently() {
    this.profileService.getProfile().subscribe((profile) => {
      this.profile.set(profile);
      this.fillForm(profile);
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const form = this.passwordForm.value;

    const body: ChangePasswordRequest = {
      oldPassword: form.oldPassword ?? '',
      newPassword: form.newPassword ?? '',
      confirmPassword: form.confirmPassword ?? '',
    };

    this.isChangingPassword.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.profileService.changePassword(body).subscribe({
      next: (response) => {
        this.isChangingPassword.set(false);

        if (response.isSuccess) {
          this.successMessage.set('შევცვალეთ არ ტეხავს.');
          this.passwordForm.reset();
        } else {
          this.errorMessage.set(response.error?.message ?? 'ვერ შევცავლეთ ტეხავსს.');
        }
      },
      error: (error) => {
        this.isChangingPassword.set(false);
        this.errorMessage.set(this.getErrorText(error));
      },
    });
  }

  openDeleteModal() {
    this.errorMessage.set('');
    this.showDeleteModal.set(true);
  }

  @HostListener('document:keydown.escape')
  closeDeleteModal() {
    if (this.isDeleting()) return;
    this.showDeleteModal.set(false);
  }

  deleteAccount() {
    this.isDeleting.set(true);
    this.errorMessage.set('');

    this.profileService.deleteAccount().subscribe({
      next: (response) => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);

        if (response.isSuccess) {
          this.auth.logout();
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set(response.error?.message ?? 'ვერა რაა ვერ წავშალეთ.');
        }
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.errorMessage.set(this.getErrorText(error));
      },
    });
  }

  getErrorText(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;

      if (body?.errors) {
        const firstList = Object.values(body.errors)[0] as string[] | undefined;
        if (firstList?.length) return firstList[0];
      }

      if (body?.detail) return body.detail;
      if (body?.title) return body.title;
      if (body?.error?.message) return body.error.message;

      if (error.status === 401) return 'შედიიიიიიიიი.';
    }

    return 'შეცდომა სცადე ან არსცადო დდ.';
  }
}