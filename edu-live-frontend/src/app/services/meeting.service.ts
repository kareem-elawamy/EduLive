import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { Meeting } from '../interface/meeting';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private UrlApi = "https://localhost:7089/api/Meetings"
  constructor(private _http: HttpClient) { }
  getMeetings(): Observable<any> {
    return this._http.get(this.UrlApi);
  }
  createMeeting(meeting: any): Observable<any> {
    return this._http.post(this.UrlApi, meeting);
  }
  getMeetingById(id: number): Observable<any> {
    return this._http.get(`${this.UrlApi}/${id}`);
  }
  stertTiem(roomId: string): Observable<any> {
    return this._http.get(`${this.UrlApi}/StartTime`, {
      params: {
        roomId: roomId
      }
    });
  }
}
