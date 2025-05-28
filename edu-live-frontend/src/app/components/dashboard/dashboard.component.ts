import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { RoleServiceService } from '../../services/role-service.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, NgFor, NgIf, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  roles = inject(RoleServiceService);
  auth = inject(AuthService)
  dash = inject(DashboardService)
  router = inject(Router);
  teachers: any[] = [];

  students: any[] = [];
  isCliked: boolean = false;
  data = {
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalLiveSessions: 0,
    totalQuestions: 0,
    totalStudentQuizAnswers: 0,
  }
  ngOnInit(): void {
    if (this.auth.isAdmin()) {

      this.loadTeacher();
      this.loadStudent();
      this.loadDashboardData();
    } else {
      this.router.navigate(['/login'])
    }
  }
  loadTeacher() {
    this.dash.getAllTeachers().subscribe({
      next: (res) => {
        this.teachers = res;
        console.log(this.teachers);
      },
      error: (er) => {
        console.log(er);
      }
    })
  }
  loadStudent() {
    this.dash.getAllStudents().subscribe({
      next: (res) => {
        this.students = res;
      },
      error: (er) => {
        console.log(er);
      }
    })
  }
  loadDashboardData() {
    this.dash.getDashboardData().subscribe({
      next: (res) => {
        this.data.totalStudents = res.totalStudents;
        this.data.totalTeachers = res.totalTeachers;
        this.data.totalCourses = res.totalCourses;
        this.data.totalQuizzes = res.totalQuizzes;
        this.data.totalLiveSessions = res.totalLiveSessions;
        this.data.totalQuestions = res.totalQuestions;
        this.data.totalStudentQuizAnswers = res.totalStudentQuizAnswers;

        console.log(this.data);
        console.log(res);
      },
      error: (er) => {
        console.log(er);
      }
    })
  }
  profileImg(img: string) {
    if (img.length == 0) {
      return 'Edulive.png';
    } else {
      return 'https://localhost:7089/' + img;
    }

  }
  toggleClick() {
    this.isCliked = !this.isCliked;
  }
  getRole(): string {
    const role = prompt("Enter Role", "Role is")
    return role ? role : ''
  }


}
