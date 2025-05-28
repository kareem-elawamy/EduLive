import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-course',
  imports: [DatePipe, NgFor, NgIf, NavbarComponent],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent implements OnInit {
  courseid: number = 0;
  course = inject(CourseService)
  router = inject(ActivatedRoute)
  dataCourse: any
  dataTask: any
  constructor() { }
  ngOnInit(): void {
    this.courseid = Number(this.router.snapshot.paramMap.get('id'));
    this.course.getAllQuizFromCourse(this.courseid).subscribe((data) => {
      this.dataCourse = data;
      console.log(this.dataCourse);

    }
      , (error) => {
        console.log(error);
      });
    this.course.getAllTasksFromCourse(this.courseid).subscribe((data) => {
      this.dataTask = data;
      console.log(this.dataTask);

    }
      , (error) => {
        console.log(error);
      });

  }
  // component.ts
  getUserImage(imgName: string | undefined): string {
    return `https://localhost:7089${imgName}`;
  }

}
