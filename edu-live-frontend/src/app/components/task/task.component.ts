import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { TasksService } from '../../services/tasks.service';
import { ValidationError } from '../../interface/validation-error';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-task',
  imports: [CommonModule,
    NavbarComponent,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',

})
export class TaskComponent implements OnInit {

  isCliked: boolean = false;
  private task = inject(TasksService)
  tasks: any
  errors!: ValidationError[];
  showForm = false
  taskBuilder = inject(FormBuilder)
  taskForm = this.taskBuilder.group({
    name: ['', Validators.required],
    description: [''],
    laval: [''],
    deadline: ['']
  })
  snackBar = inject(MatSnackBar)
  auth = inject(AuthService)
  router = inject(Router)
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {

      this.loadTask()
    } else {
      this.router.navigate(['/login'])
    }
  }
  loadTask() {
    this.task.getStudentTasks().subscribe((data) => {
      this.tasks = data
      console.log(data);
    }, (error) => {
      console.log(error.message);
    }
    )
  }
  addTask() {
    this.showForm = true
  }
  createTask() {
    if (this.taskForm.valid) {
      const taskData = {
        ...this.taskForm.value,
      };
      this.task.addStudentTask(taskData).subscribe({
        next: (res) => {
          console.log(res);
          this.snackBar.open(res.message, '', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          })
          this.taskForm.reset();
          this.closeTaskForm();
        },
        error: (er) => {
          console.log(er);
          alert("Error creating Task");
        },
        complete: () => console.log("Task created successfully")
      });

    }
  }
  closeTaskForm() {
    this.showForm = false
    this.loadTask();
  }
  taskDone(id: number) {
    this.task.markTaskAsDone(id).subscribe((next) => {
      if (next) {

        this.snackBar.open('Done', '', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        })
      }

    }, (err) => console.log(err.message)

    )
    this.loadTask();

  }
  taskNotDone(id: number) {
    this.task.markTaskAsNotDone(id).subscribe((next) => {
      if (next) {
        this.snackBar.open('Not Done', '', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        })
      }

    }, (err) => console.log(err.message)

    )
    this.loadTask();
  }
  delete(id: number) {
    this.task.deleteStudentTask(id).subscribe((next) => {
      this.snackBar.open('Delet', '', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      })
      this.loadTask()
    }, (err) => {
      console.log(err.message);

    })
    this.loadTask();
  }
  isDateFiltered = false;

  onDateChange(event: any) {
    const selectedDate: Date = event.value;

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      console.log("Filtered date:", formattedDate);

      this.task.getTasksByDeadline(formattedDate).subscribe({
        next: (res) => {
          this.tasks = res;
          this.isDateFiltered = true;
          console.log("Tasks on selected date:", this.tasks);
        },
        error: (err) => {
          console.error("Error fetching tasks:", err);
          this.tasks = [];
          this.isDateFiltered = true;
        }
      });
    }
  }

  toggleClick() {
    this.isCliked = !this.isCliked;
    this.isDateFiltered = false;
    this.loadTask();
  }


}
