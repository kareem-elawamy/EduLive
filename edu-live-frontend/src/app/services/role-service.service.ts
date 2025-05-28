import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {
  private api = "https://localhost:7089/api/Dashpord/Roles/"


  constructor(private _http: HttpClient) { }
  createRole(rloe: string): Observable<any> {
    return this._http.post(`${this.api}CreateRole`, { name: rloe });
  }
  getRoles(): Observable<any> {
    return this._http.get(`${this.api}GetRoles`);
  }

  assignRole(data: any): Observable<any> {
    return this._http.post(`${this.api}AssignRole`, data);
  }
  GetRoleUsers(rloeName: string): Observable<any> {
    return this._http.get(`${this.api}GetRoleUsers/${rloeName}`);
  }
}
