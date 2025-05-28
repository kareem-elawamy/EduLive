import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ValidationError } from '../../interface/validation-error';
import { NgIf } from '@angular/common';
import { Register } from '../../interface/register';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-regster',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NavbarComponent,RouterLink],
  templateUrl: './regster.component.html',
  styleUrls: ['./regster.component.css']
})
export class RegsterComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  form!: FormGroup;
  router = inject(Router);

  errors!: ValidationError[];

  registerUser() {
    const formData = new FormData();

    formData.append('userName', this.form.get('username')?.value);
    formData.append('email', this.form.get('email')?.value);
    formData.append('password', this.form.get('password')?.value);
    formData.append('phoneNumber', this.form.get('phonenumber')?.value);
    formData.append('profileImage', this.form.get('profilePicture')?.value);

    this.auth.regsiterUser(formData).subscribe({
      next: (res) => {
        alert(res.message);
        this.router.navigate(['/home']);

      },
      error: (er) => {
        if (er.status === 400) {
          this.errors = er.error;
          console.log(this.errors);
          console.log(er.message);
        }
      },
      complete: () => console.log("Register success")
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      phonenumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      profilePicture: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmpassword = form.get('confirmPassword')?.value;
    if (password !== confirmpassword) {
      return { passwordMatch: true };
    }
    return null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ profilePicture: file });
      this.form.get('profilePicture')?.updateValueAndValidity();
    }
  }

  showPassword() {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordField = document.getElementById('confirmPassword') as HTMLInputElement;

    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      confirmPasswordField.type = 'text';
    } else {
      passwordField.type = 'password';
      confirmPasswordField.type = 'password';
    }
  }
}
