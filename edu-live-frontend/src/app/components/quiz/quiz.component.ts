import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { QuizService } from '../../services/quiz.service';
import { DatePipe, NgFor, NgForOf, NgIf } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quiz',
  imports: [NavbarComponent, NgForOf, NgIf, DatePipe, FormsModule,RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  auth = inject(AuthService);
  quiz = inject(QuizService)
  quizzes: any[] = [];
  // component.ts
  //searchText: string = '';
  searchQuery: string = '';

  ngOnInit(): void {
    
    this.quiz.getAllQuizzes().subscribe((res) => {
      this.quizzes = res;
      console.log(this.quizzes);
    }, (error) => {
      console.log(error);
    }
    );

  }
  editQuiz(id: any) {
    throw new Error('Method not implemented.');
  }
  deleteQuiz(id: number) {
    this.quiz.deleteQuiz(id).subscribe((res) => {
      console.log(res);
      this.ngOnInit();
    }, (error) => {
      console.log(error);
    });

  }

  // searchCourse
  searchCourse() {
    if (this.searchQuery) {
      this.quizzes = this.quizzes.filter((quiz) => {
        return quiz.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    } else {
      this.ngOnInit();
    }
  }



}
