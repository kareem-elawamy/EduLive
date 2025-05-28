import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-stert-quiz',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './stert-quiz.component.html',
  styleUrl: './stert-quiz.component.css'
})
export class StertQuizComponent implements OnInit {
  quiz: any;
  minutes: number = 0;
  seconds: number = 0;
  totalSeconds: number = 0;
  timeUp: boolean = false;
  route = inject(ActivatedRoute);
  router = inject(Router)
  quizService = inject(QuizService)
  student = inject(StudentService)
  auth = inject(AuthService)
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      const id = this.route.snapshot.paramMap.get('id');

      if (id) {
        this.quizService.getQuizStudentById(Number(id)).subscribe((res) => {
          this.quiz = res;
          console.log(this.quiz);
          this.totalSeconds = this.quiz.duration * 60;
          this.startTimer();
        }
          , (error) => {
            console.log(error);
          });
      }
    }
    else {
      this.router.navigate(['/login'])
    }
  }

  startTimer() {
    const timer = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.minutes = Math.floor(this.totalSeconds / 60);
        this.seconds = this.totalSeconds % 60;
      } else {
        clearInterval(timer);
        this.timeUp = true;
        this.submitQuiz();
      }
    }, 1000);
  }

  getDifficultyClass(level: number): string {
    switch (level) {
      case 1: return 'bg-green-100';
      case 2: return 'bg-yellow-100';
      case 3: return 'bg-orange-100';
      case 4: return 'bg-red-100';
      case 5: return 'bg-red-200';
      default: return 'bg-gray-100';
    }
  }
  saveAnswer(questionId: number, answer: string) {
    this.student.saveStudentAnswer(questionId, answer).subscribe({
      next: (res) => console.log(`Saved answer for Q${questionId}`),
      error: (err) => console.log('Error body:', err.error)
    });
  }
  submitQuiz() {
    if (this.timeUp) return; // Prevent duplicate submission
    this.timeUp = true; // حتى لو ضغط الزر، مرة واحدة تكفي

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.student.GetQuizResult(id).subscribe({
      next: (res) => {
        this.alertCreated(
          `Quiz submitted!`,
          `Title: ${res.quizTitle}\nScore: ${res.totalMarksObtained}/${res.totalMarks}\nStatus: ${res.isPassed ? '✅ Passed' : '❌ Failed'}`,
          res.isPassed ? '#d4edda' : '#f8d7da'
        );
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.alertCreated("Error", err.error, "#f8d7da");
        console.log(err.error);
      }
    });

    this.snakBar(`Quiz`, "Quiz submitted successfully", "#d4edda")
  }

  // component.ts
  getUserImage(imgName: string | undefined): string {
    return `https://localhost:7089${imgName}`;
  }
  alertCreated(title: string, message: string, color: string) {
    // create alert d
    const alert = document.createElement('div');
    alert.className = title;
    alert.innerHTML = `
      <strong>${title}</strong>
      <p>${message}</p>
    `;
    alert.style.position = 'fixed';
    alert.style.top = '10px';
    alert.style.right = '10px';
    alert.style.zIndex = '1000';
    alert.style.backgroundColor = color;
    alert.style.color = '#721c24';
    alert.style.padding = '10px';
    alert.style.border = '1px solid #f5c6cb';
    alert.style.borderRadius = '5px';
    alert.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    alert.style.transition = 'opacity 0.5s ease-in-out';
    alert.style.opacity = '1';
    document.body.appendChild(alert);
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(alert);
      }, 500);
    }, 3000);

  }
  snakBar(title: string, message: string, color: string) {
    // create alert d
    const alert = document.createElement('div');
    alert.className = title;
    alert.innerHTML = `
      <strong>${title}</strong>
      <p>${message}</p>
    `;
    alert.style.position = 'fixed';
    alert.style.bottom = '10px';
    alert.style.right = '10px';
    alert.style.zIndex = '1000';
    alert.style.backgroundColor = color;
    alert.style.color = '#721c24';
    alert.style.padding = '10px';
    alert.style.border = '1px solid #f5c6cb';
    alert.style.borderRadius = '5px';
    alert.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    alert.style.transition = 'opacity 0.5s ease-in-out';
    alert.style.opacity = '1';
    document.body.appendChild(alert);

  }


}
