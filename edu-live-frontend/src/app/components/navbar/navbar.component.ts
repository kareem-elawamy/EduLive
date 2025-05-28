import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf, RouterModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  dropdownOpen = false;
  isLogged = false;
  email: string | null = '';
  userName: string | null = '';
  image: string = ''; // تقدر تحدثه لو جبت صورة المستخدم من السيرفر
  isDarkMode = false;
  constructor() { }
  authService = inject(AuthService)

  ngOnInit(): void {
    this.isLogged = this.authService.isLoggedIn();
    if (this.isLogged) {
      this.email = this.authService.getUserEmail();
      this.userName = this.authService.getUserName();
      this.image = this.authService.getUserImage();
    }
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.updateThemeClass();
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateThemeClass();
  }
  updateThemeClass() {
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  logout(): void {
    this.authService.logout();
    location.reload();
  }
  profileImg(img: string) {
    if (img.length == 0) {
      return 'Edulive.png';
    } else {
      return 'https://localhost:7089' + img;
    }

  }
  @Output() toggleSidebar = new EventEmitter<void>();

}
