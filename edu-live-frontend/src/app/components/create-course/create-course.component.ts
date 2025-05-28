import { Component, inject, OnInit } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ValidationError } from '../../interface/validation-error';
import { NavbarComponent } from "../navbar/navbar.component";
import { QuizService } from '../../services/quiz.service';
import { TasksService } from '../../services/tasks.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-course',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule, NgFor, NavbarComponent, RouterLink]
  ,
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.css'
})
export class CreateCourseComponent implements OnInit {
  fb = inject(FormBuilder);
  courseService = inject(CourseService);
  auth = inject(AuthService);
  form!: FormGroup;
  router = inject(Router);
  courses: any[] = [];
  errors!: ValidationError[];
  quiz = inject(QuizService)
  selectedCourseId: number | null = null;
  showQuizForm = false;
  quizBuilder = inject(FormBuilder);
  showtaskForm = false;
  taskBuilder = inject(FormBuilder);
  task = inject(TasksService)
  taskForm = this.taskBuilder.group({
    name: ['', Validators.required],
    description: [''],
    laval: [''],
    deadline: [''],
    degree: [0, Validators.required]

  })
  quizForm = this.quizBuilder.group({
    title: ['', Validators.required],
    description: [''],
    totalMarks: [0, [Validators.required, Validators.min(1)]],
    passingMarks: [0, [Validators.required]],
    duration: [0, [Validators.required, Validators.min(1)]]
  });


  createCourse() {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {

      const formData = new FormData();
      formData.append('title', this.form.get('title')?.value);
      formData.append('description', this.form.get('description')?.value);
      formData.append('Image', this.form.get('Image')?.value);
      this.courseService.create(formData).subscribe({
        next: (res) => {
          console.log(res);
          this.alert("Done", "success", "Course created successfully");
          this.loadCourses();
          this.clearForm();
        },
        error: (er) => {
          if (er.status === 400) {
            this.errors = er.error;
            console.log(this.errors);
            this.alert("Error", 'error', er.message)
            console.log(er.message);
          }
        },
        complete: () => console.log("Course created successfully")
      });
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', []],
      Image: ['', []]
    })
      ;

    this.courseService.getAllCourses().subscribe({
      next: (res) => {
        this.courses = res;
        console.log(res);
      },
      error: (er) => {
        console.log(er);
      },
      complete: () => console.log("Get all courses")
    });

    if (!this.auth.isAdmin() || this.auth.isTeacher()) {
      this.loadCourses();
    }
  }
  deleteCourse(id: number) {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      this.courseService.delete(id).subscribe({
        next: (res) => {
          console.log(res);
          this.alert("Done", 'success', "Course deleted successfully")
          this.courses = this.courses.filter(course => course.id !== id);
          console.log(this.courses);
        },
        error: (er) => {
          console.log(er);
          this.alert("Error", 'error', "Error deleting course");
        },
        complete: () => console.log("Course deleted successfully")
      });
    }
  }
  // assignCourseToTeacher
  assignCourseToTeacher(courseId: number) {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      const teacherEmail = prompt("Enter teacher email");
      if (!teacherEmail) {
        this.alert("warning", 'warning', "Teacher email is required");
        return;
      }
      this.courseService.assignCourseToTeacher(courseId, teacherEmail).subscribe({
        next: (res) => {
          console.log(res);
          this.alert("Assigned", 'success', "Course assigned to teacher successfully");
          this.loadCourses();
          this.courses = this.courses.filter(course => course.id !== courseId);


        },
        error: (er) => {
          console.log(er);

          this.errors = er.error;
          console.log(this.errors);
          this.alert("Error assigning course to teacher", 'error', er.message);
        },
        complete: () => console.log("Course assigned to teacher successfully")
      });
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ Image: file });
      this.form.get('Image')?.updateValueAndValidity();
    }
  }
  getUserImage(imgName: string | undefined): string {
    return `https://localhost:7089${imgName}`;
  }
  loadCourses() {
    this.courseService.getAllCourses().subscribe((data) => {
      this.courses = data;
      console.log(this.courses);
    }, (error) => {
      console.log(error);
    });
  }

  // مسح بيانات الحقول
  clearForm() {
    this.form.reset();
  }
  AddQuiz(id: number) {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      this.selectedCourseId = id;
      this.showQuizForm = true;
    }
  }
  addTask(id: number) {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      this.selectedCourseId = id;
      this.showtaskForm = true;
    }
  }
  createQuiz() {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      if (this.quizForm.valid && this.selectedCourseId) {
        const quizData = {
          ...this.quizForm.value,
          courseId: this.selectedCourseId
        };
        this.quiz.createQuiz(quizData).subscribe({
          next: (res) => {
            console.log(res);
            this.alert("Done", 'success', "Quiz created successfully");
            this.quizForm.reset();
            this.closeQuizForm();
          },
          error: (er) => {
            console.log(er);
            this.alert("Error", 'error', "Error creating quiz");
          },
          complete: () => console.log("Quiz created successfully")
        });

      }
    }
  }
  craeteTask() {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      if (this.taskForm.valid && this.selectedCourseId) {
        const taskData = {
          ...this.taskForm.value,
          courseId: this.selectedCourseId
        };
        this.task.addTask(taskData).subscribe({
          next: (res) => {
            console.log(res);
            this.alert("Done", 'success', "Task created successfully");
            this.taskForm.reset();
            this.closeQuizForm();
          },
          error: (er) => {
            console.log(er);
            this.alert("Error", 'error', "Error creating Task");
          },
          complete: () => console.log("Task created successfully")
        });
      }
    }
  }
  closeQuizForm() {
    this.showQuizForm = false;
    this.showtaskForm = false
  }
  alert(title: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question', text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      timer: 2000
    })
  }
}
