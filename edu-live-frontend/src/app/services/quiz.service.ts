import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private UrlApi = "https://localhost:7089/api/Quiz/";

  constructor(private _http: HttpClient) { }
  createQuiz(quiz: any): Observable<any> {
    console.log('quizData:', quiz);

    return this._http.post(`${this.UrlApi}create`, quiz);
  }
  getAllQuizzes(): Observable<any> {
    return this._http.get(`${this.UrlApi}getAllQuizzes`);
  }
  deleteQuiz(id: number): Observable<any> {
    return this._http.delete(`${this.UrlApi}deleteQuiz/${id}`);
  }
  getQuizById(id: number): Observable<any> {
    return this._http.get(`${this.UrlApi}getQuizById/${id}`);
  }
  addQuestion(data: any): Observable<any> {
    return this._http.post(`${this.UrlApi}addQuestion`, data);
  }
  deleteQuestion(id: number): Observable<any> {
    return this._http.delete(`${this.UrlApi}deleteQuestion/${id}`);
  }

getQuizStudentById(id: number): Observable<any> {
    return this._http.get(`${this.UrlApi}getQuizStudentById/${id}`);
  }
}
