import { Component, inject, OnInit } from '@angular/core';
import { TasksService } from '../../services/tasks.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormBuilder, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TaskFilterPipe } from "../../pipe/task-filter.pipe";

@Component({
  selector: 'app-task-courses',
  standalone: true,
  imports: [NgFor, NavbarComponent, DatePipe, FormsModule, NgIf, TaskFilterPipe],
  templateUrl: './task-courses.component.html',
  styleUrl: './task-courses.component.css'
})
export class TaskCoursesComponent implements OnInit {
  degree: any
  taskId = 0;
  showForm = false;
  tasks: any[] = [];
  originalTasks: any[] = [];
  auth = inject(AuthService);
  taskBuilder = inject(FormBuilder);
  selectedFile: File | null = null;
  task = inject(TasksService);
  searchQuery = '';
  selectedLevel = '';
  isCompleted: boolean = false;
  taskStatusMap: { [key: number]: boolean } = {};
  taskSubmit: any
  d: boolean = false
  degreeStatusMap: { [key: number]: boolean } = {};

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadTasks();
      this.task.getAllsubmit().subscribe((data) => {
        this.taskSubmit = data
        this.taskSubmit.forEach((submit: any) => {
          this.task.DegreeDone(submit.id).subscribe((data: boolean) => {
            this.degreeStatusMap[submit.id] = data;
          });
        });
      })
    }
  }
  loading: boolean = false;
  loadTasks() {
    this.loading = true;
    this.task.getAllTasks().subscribe(res => {
      this.tasks = res;
      this.loading = false;
    });
  }
  deletedTaskIds = new Set<number>();

  deleteTaskWithAnimation(taskId: number) {
    this.deleteTask(taskId)
    this.deletedTaskIds.add(taskId);
    setTimeout(() => {
      this.deleteTask(taskId);
      this.deletedTaskIds.delete(taskId);
      this.showDeleteToast();
    }, 300);

  }


  searchCourse() {
    this.tasks = this.originalTasks.filter((task) => {
      const matchesName = this.searchQuery
        ? task.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;

      const matchesLevel = this.selectedLevel
        ? task.level == this.selectedLevel
        : true;

      return matchesName && matchesLevel;
    });
  }

  filterByDeadline() {
    const today = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2);

    this.tasks = this.originalTasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline >= today && deadline <= twoDaysLater;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submit(id: number) {
    this.taskId = id;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedFile = null;
  }

  deleteTask(id: number) {
    this.task.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter(task => task.id !== id);
      this.originalTasks = this.originalTasks.filter(task => task.id !== id);

    });
  }
  addDegree(id: number) {
    if (!id) {
      alert("Please select a file before submitting.");
      return;
    }
    const fd = new FormData;
    fd.append('SubmitId', id.toString());
    this.degree = prompt("Add Degree")
    fd.append('SubmitDegree', this.degree.toString())
    this.task.addDegree(fd).subscribe({
      next: () => alert("Done"),
      error: (err) => console.log(err)

    })

  }
  sendTask() {
    if (!this.taskId || !this.selectedFile) {
      alert("Please select a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append('TaskId', this.taskId.toString());
    formData.append('FillUrl', this.selectedFile);

    this.task.submitTask(formData).subscribe({
      next: () => {
        alert('The task has been submitted successfully.');
        this.closeForm();
        this.checkTaskStatus(this.taskId);
      },
      error: err => {
        console.error(err);
        alert('Failed to submit the task');
      }
    });
  }

  getUserImage(imgName: string): string {
    return `https://localhost:7089${imgName}`;
  }

  checkTaskStatus(taskId: number) {
    this.task.isTaskCompleted(taskId).subscribe(
      (data) => {
        this.taskStatusMap[taskId] = data;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  showToast = false;

  showDeleteToast() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
  isDegree(id: number): boolean {
    this.task.DegreeDone(id).subscribe((data) => {
      this.d = data;
    })
    return this.d;
  }
}
