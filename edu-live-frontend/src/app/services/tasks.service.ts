import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private baseUrl = 'https://localhost:7089/api';
  private teacherTasksUrl = `${this.baseUrl}/Tasks`;
  private studentTasksUrl = `${this.baseUrl}/TaskStudent`;
  private submitTaskUrl = `${this.teacherTasksUrl}/SubmitTask`;

  constructor(private _http: HttpClient) { }

  // ========== Teacher ==========

  addTask(data: any): Observable<any> {
    return this._http.post(this.teacherTasksUrl, data);
  }

  getAllTasks(): Observable<any> {
    return this._http.get(this.teacherTasksUrl);
  }

  deleteTask(id: number): Observable<any> {
    return this._http.delete(`${this.teacherTasksUrl}/delete/${id}`);
  }

  getTasksByDeadline(date: string): Observable<any> {
    const formattedDate = date.split('T')[0];
    return this._http.get(`${this.teacherTasksUrl}/deadline?dateTime=${formattedDate}`);
  }
  DegreeDone(id: number): Observable<any> {
    return this._http.get(`${this.teacherTasksUrl}/DegreeDone/${id}`)
  }
  submitTask(formData: FormData): Observable<any> {
    return this._http.post(this.submitTaskUrl, formData);
  }

  isTaskCompleted(id: number): Observable<any> {
    return this._http.get(`${this.teacherTasksUrl}/taskIsDone/${id}`);
  }
  addDegree(data: any): Observable<any> {
    return this._http.post(this.teacherTasksUrl + "/addDegree", data)
  }
  getAllsubmit(): Observable<any> {
    return this._http.get(this.teacherTasksUrl + "/getAllTaskSubmit")
  }
  // ========== Student ==========

  getStudentTasks(): Observable<any> {
    return this._http.get(this.studentTasksUrl);
  }

  markTaskAsDone(id: number): Observable<any> {
    return this._http.put(`${this.studentTasksUrl}/taskDone/${id}`, null);
  }

  markTaskAsNotDone(id: number): Observable<any> {
    return this._http.put(`${this.studentTasksUrl}/taskNotDone/${id}`, null);
  }

  addStudentTask(data: any): Observable<any> {
    return this._http.post(this.studentTasksUrl, data);
  }

  deleteStudentTask(id: number): Observable<any> {
    return this._http.delete(`${this.studentTasksUrl}/delete/${id}`);
  }
  getAllDegree(): Observable<any> {
    return this._http.get(this.studentTasksUrl + "/getAllDegree")
  }
}
