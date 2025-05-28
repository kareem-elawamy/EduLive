import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../interface/user-profile';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdatePassword } from '../../interface/update-password';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { CourseService } from '../../services/course.service';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, NgIf, NavbarComponent, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  fb = inject(FormBuilder)

  selectedFile: File | null = null;
  auth = inject(AuthService)
  userProfile: any
  message: string = ''
  student = inject(StudentService)
  task = inject(TasksService)
  tasks: any
  studentQuizzes: any
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.profileForm = this.fb.group({
        userName: ['', Validators.required]
      })
      this.auth.getUserProfile().subscribe((data) => {
        this.userProfile = data;
        console.log(data);

      }, (error) => console.log(error)
      )
      if (!this.auth.isAdmin() || !this.auth.isTeacher()) {

        this.student.getAllResult().subscribe((data) => {
          this.studentQuizzes = data
        }, error => {
          console.log(error.message);

        }
        )
        this.task.getAllDegree().subscribe(data => this.tasks = data)
      }
    }
    if (this.auth.isAdmin() || this.auth.isTeacher()) {

    }
  }
  onSubmit() {
    const formData = new FormData()
    formData.append('userName', this.profileForm.get('userName')?.value);
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }
    this.auth.updateProfile(formData).subscribe({
      next: (res) => {
        this.message = res.message
      },
      error: err => {
        this.message = 'حدث خطأ أثناء التحديث';
        console.error(err);
      }
    })
  }

  profileImg(img: string) {
    if (img.length == 0) {
      return 'Edulive.png';
    } else {
      return 'https://localhost:7089' + img;
    }
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  updateProfile() {

  }


}
