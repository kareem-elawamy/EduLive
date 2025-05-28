import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private UrlApi = "https://localhost:7089/api/Dashpord/"
  constructor(private _http: HttpClient) { }
  getAllTeachers() {
    return this._http.get<any>(this.UrlApi + "GetAllTeacher");
  }
  getAllStudents() {
    return this._http.get<any>(this.UrlApi + "GetAllStudent");
  }
  getTotalTeacher() {
    return this._http.get<any>(this.UrlApi + "GetTotalTeacher");
  }
  getDashboardData() {
    return this._http.get<any>(this.UrlApi + "GetDashboardData");
  }
}
