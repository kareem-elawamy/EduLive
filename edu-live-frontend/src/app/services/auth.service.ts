export interface JwtPayload {
  role: string[]; // مهم: لأنك شايف من التوكن إنها Array
  name: string;
  nameid: string;
  email: string;
  exp: number;
  [key: string]: any;
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../interface/register';
import { map, Observable, Subject } from 'rxjs';
import { AuthResponse } from '../interface/auth-response';
import { Login } from '../interface/login';
import { UpdatePassword } from '../interface/update-password';
import { UpdateProfile } from '../interface/update-profile';
import { jwtDecode } from 'jwt-decode';
import { UserProfile } from '../interface/user-profile';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userUpdated = new Subject<void>();
  userUpdated$ = this.userUpdated.asObservable();

  emitUserUpdated() {
    this.userUpdated.next();
  }
  private UrlApi = "https://localhost:7089/api/Account/"
  constructor(private _http: HttpClient) { }
  private tokenKey = 'token';
  regsiterUser(data: FormData): Observable<any> {
    return this._http.post<AuthResponse>(`${this.UrlApi}Register`, data);
  }

  loginUser(data: Login): Observable<AuthResponse> {
    return this._http.post<AuthResponse>(`${this.UrlApi}Login`, data).pipe(
      map((res) => {
        if (res.isSuccess) {
          localStorage.setItem(this.tokenKey, res.tokens);
          console.log(res.tokens);
        }
        console.log(res.message);

        return res;
      }))
  }
  getToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const currentTime = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < currentTime) {
        this.logout();
        return false;
      }
      return true
    } catch (error) {
      console.error('Failed to decode token', error);
      this.logout()
      return false;
    }

  }
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
  updatePassword(data: any): Observable<any> {
    return this._http.put<any>(`${this.UrlApi}UpdatePassword`, data);
  }
  updateProfile(data: FormData): Observable<any> {
    return this._http.put<any>(`${this.UrlApi}UpdateProfile`, data)
  }

  getUserProfile(): Observable<any> {
    return this._http.get<any>(`${this.UrlApi}GetUserProfile`)
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role || [];
    } catch (error) {
      console.error('Failed to decode token', error);
      return [];
    }
  }
  getImageUrl(): string {
    const token = this.getToken();
    if (!token) return 'Edulive.png';
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded['profileImageUrl'] || 'Edulive.png';
    } catch (error) {
      console.error('Failed to decode token', error);
      return 'Edulive.png';
    }
  }
  getUserId(): string | '' {
    const token = this.getToken();
    if (token === '') return '';

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.nameid || '';
    } catch (error) {
      console.error('Failed to decode token', error);
      return '';
    }
  }

  isAdmin(): boolean {
    return this.getUserRoles().includes('Admin');
  }

  isTeacher(): boolean {
    return this.getUserRoles().includes('Teacher');
  }
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.email || null;
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  }

  getUserName(): string {
    const token = this.getToken();
    if (token == '') return '';

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.name || '';
    } catch (error) {
      console.error('Failed to decode token', error);
      return '';
    }
  }
  getUserImage(): string {
    const token = this.getToken();
    if (!token) return 'Edulive.png';
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded['profileImageUrl'] || 'Edulive.png';
    } catch (error) {
      console.error('Failed to decode token', error);
      return 'Edulive.png';
    }
  }

}
