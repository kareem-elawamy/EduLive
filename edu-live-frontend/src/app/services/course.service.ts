import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Course } from '../interface/course';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private http: HttpClient) { }
  private UrlApi = "https://localhost:7089/api/Quiz/";

  getAllCourses() {
    return this.http.get<Course[]>(this.UrlApi + "getAllCourse");
  }
  // Create a new course
  create(course: FormData): Observable<any> {
    return this.http.post(`${this.UrlApi}createCourse`, course);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.UrlApi}deleteCourse/${id}`);
  }
  // assign Course To Teacher
  assignCourseToTeacher(courseId: number, teacherEmail: string): Observable<any> {
    const data = {
      courseId: courseId,
      teacherEmail: teacherEmail
    };
    return this.http.post(`${this.UrlApi}assignCourseToTeacher`, data);
  }
  // get course by id
  getAllCoursesTeacher() {
    return this.http.get<Course[]>(this.UrlApi + "getAllCourseTeacher");
  }
  getAllCoursesTeacherById(id: string): Observable<any> {
    return this.http.get(this.UrlApi + "getAllCoursesTeacher/" + id);
  }
  getAllQuizFromCourse(id: number): Observable<any> {
    return this.http.get(this.UrlApi + "getAllQuizFromCourse/" + id);
  }
  getAllTasksFromCourse(id: number): Observable<any> {
    return this.http.get("https://localhost:7089/api/Tasks/GetAllCourseTask/" + id);
  }


}
