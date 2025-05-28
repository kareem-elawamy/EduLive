import { Component, inject, OnInit } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-quiz-det',
  imports: [NgFor, NgIf, CommonModule, ReactiveFormsModule, DatePipe, NavbarComponent],
  templateUrl: './quiz-det.component.html',
  styleUrl: './quiz-det.component.css'
})
export class QuizDetComponent implements OnInit {
  s = 'Easy'
  sliderColor: string = '#22c55e';
  quiz: any;
  questionsBuilder = inject(FormBuilder);
  form!: FormGroup
  selecedQuestion: number | null = null;
  questions: any[] = [];
  quizService = inject(QuizService)
  auth = inject(AuthService)
  quizId!: number;
  route = inject(ActivatedRoute);
  router = inject(Router);
  showQuizForm = false;
  questionsForm = this.questionsBuilder.group({
    Text: [''],
    OptionA: [''],
    OptionB: [''],
    OptionC: [''],
    OptionD: [''],
    CorrectAnswer: [''],
    Marks: [0],
    DegreeOfDifficulty: [0],

  });
  ngOnInit(): void {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      this.quizId = Number(this.route.snapshot.paramMap.get('id'));
      this.quizService.getQuizById(this.quizId).subscribe((res) => {
        this.quiz = res;
        console.log(this.quiz);
      }, (error) => {
        console.log(error);
      })
    } else {
      this.router.navigate(['/login'])
    }
  }
  AddQuestions(id: number) {
    this.selecedQuestion = id;
    this.showQuizForm = true;
  }
  createQuestions() {
    if (this.questionsForm.valid && this.selecedQuestion) {
      const Questionsdata = {
        ...this.questionsForm.value,
        QuizId: this.quizId,
      }
      console.log(Questionsdata);
      this.quizService.addQuestion(Questionsdata).subscribe({
        next: (res) => {
          console.log(res);
          alert("Question added successfully");
          this.questionsForm.reset();
          this.closeQuizForm();
          this.ngOnInit();
        }, error: (er) => {
          console.log(er);
          console.log('Error body:', er.error);
          this.alertCreated("Error", er.error, "red")
        }
      });
    }
  }
  closeQuizForm() {
    this.showQuizForm = false;
  }

  updateSliderColor() {
    const value = this.questionsForm.get('DegreeOfDifficulty')?.value;
    this.sliderColor = this.getColorByLevel(value ?? 1);
  }

  getColorByLevel(level: number): string {
    switch (level) {
      case 1: {
        this.s = 'Easy'
        return '#22c55e'
      }; // أخضر
      case 2: {
        this.s = 'Medium'
        return '#84cc16'
      }; // لايم
      case 3: {
        this.s = 'Hard'
        return '#eab308'
      }; // أصفر
      case 4: {
        this.s = 'Very Hard'
        return '#f97316'
      }; // برتقالي
      case 5: {
        this.s = 'Extreme'
        return '#ef4444'
      }; // أحمر
      default: return '#22c55e';
    }
  }

  deleteQuestion(id: number) {
    this.quizService.deleteQuestion(id).subscribe((res) => {
      console.log(res);
      this.alertCreated("Question ", "deleted successfully", "#d4edda");
      this.ngOnInit();
    }, (error) => {
      console.log(error);
      alert("Error deleting question");
    }
    );
  }
  editQuestion(id: any) {
    throw new Error('Method not implemented.');
  }
  deleteQuiz(id: number) {
    {
      this.quizService.deleteQuiz(id).subscribe((res) => {
        console.log(res);
        this.alertCreated("Quiz ", "deleted successfully", "#d4edda");
        this.auth.isAdmin() ? this.router.navigate(['/dashboard']) : this.router.navigate(['/quiz']);
        this.ngOnInit();
      }, (error) => {
        console.log(error);
        alert("Error deleting quiz");
      });
    }
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
    alert.style.color = '#fff';
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
}

