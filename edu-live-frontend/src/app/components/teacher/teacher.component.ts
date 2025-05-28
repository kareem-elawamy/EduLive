import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-teacher',
  imports: [NavbarComponent, NgFor, RouterLink, DatePipe],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.css'
})
export class TeacherComponent implements OnInit {
  userId: string | null = null;
  route = inject(ActivatedRoute);
  course = inject(CourseService);
  dataTeacher: any
  constructor() { }
  ngOnInit(): void {
    this.userId = String(this.route.snapshot.paramMap.get('id'));

    this.course.getAllCoursesTeacherById(this.userId).subscribe((data) => {
      this.dataTeacher = data;
      console.log(this.dataTeacher);
    }, (error) => {
      console.log(error);
    });

  }
  // component.ts
  getUserImage(imgName: string | undefined): string {
    return `https://localhost:7089${imgName}`;
  }

}
