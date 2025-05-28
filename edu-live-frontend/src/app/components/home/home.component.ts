import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [NgFor, RouterLink, DatePipe, NavbarComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // component.ts
  courseService = inject(CourseService);
  auth = inject(AuthService);
  router = inject(Router);
  courses: any[] = [];


  ngOnInit(): void {
    this.courseService.getAllCourses().subscribe((data) => {
      this.courses = data;
      console.log(this.courses);
    }, (error) => {
      console.log(error);
    });
  }
  getUserImage(imgName: string | undefined): string {

    return `https://localhost:7089${imgName}`;
  }


}
