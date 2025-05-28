import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ValidationError } from '../../interface/validation-error';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf, NavbarComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginWithGoogle() {
    throw new Error('Method not implemented.');
  }
  showPass = false;
  fb = inject(FormBuilder)
  form!: FormGroup
  auth = inject(AuthService)
  router = inject(Router)
  errors!: ValidationError[]
  logIn() {
    this.auth.loginUser(this.form.value).subscribe({
      next: (res) => {
        this.router.navigate(['/home'])
        console.log(res.message)
        console.log(res.tokens)

      },
      error: (er) => {
        if (er.status == 400) {
          this.errors = er.error
          console.log(this.errors);
        }
      },
    })
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }
  show() {
    this.showPass = !this.showPass;
    const passwordField = this.form.get('password');
    if (passwordField) {
      passwordField.setValue(passwordField.value);
    }
    if (this.showPass) {
      document.getElementById('password')!.setAttribute('type', 'text');
    }
    else {
      document.getElementById('password')!.setAttribute('type', 'password');
    }
  }
}
