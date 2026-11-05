import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  subscribed = false;
  newsletterForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  get email() {
    return this.newsletterForm.controls.email;
  }
  get emailInvalid(): boolean {
    return this.email.invalid && (this.email.dirty || this.email.touched);
  }
  onSubscribe(): void {
    if (this.newsletterForm.invalid) {
      this.newsletterForm.markAllAsTouched();
      return;
    }
    console.log('Subscribed:', this.email.value);
    this.subscribed = true;
    this.newsletterForm.reset();
  }
}