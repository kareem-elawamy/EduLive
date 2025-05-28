import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private UrlApi = "https://localhost:7089/api/StudentQuizAnswer/"
  constructor(private _http: HttpClient) { }
  saveStudentAnswer(questionId: number, answer: string): Observable<any> {
    return this._http.post<any>(`${this.UrlApi}SubmitQuizAnswer`, {
      questionId: questionId,
      answer: answer
    })
  }
  GetQuizResult(id: number): Observable<any> {
    console.log(id);
    return this._http.get<any>(`${this.UrlApi}GetQuizResult/${id}`);

  }
  getAllResult(): Observable<any> {
    return this._http.get(`${this.UrlApi}GetAllResult`);
  }
  isGreenOrRed(): Observable<boolean> {
    return this._http.get<boolean>(`${this.UrlApi}isGreenOrRed`)
  }
}
