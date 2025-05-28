import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MeetingService } from '../../services/meeting.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@Component({
  selector: 'app-create-meeting',
  imports: [NavbarComponent, CommonModule, NgIf, QRCodeComponent,
    FormsModule, RouterLink, MatSnackBarModule,
  ],
  templateUrl: './create-meeting.component.html',
  styleUrl: './create-meeting.component.css'
})
export class CreateMeetingComponent implements OnInit {
  snackBar = inject(MatSnackBar)
  auth = inject(AuthService)
  router = inject(Router)
  meetings: any[] = [];
  filteredMeetings: any[] = [];
  meeting = {
    meetingName: '',
    startTime: '',
    endTime: ''
  };
  searchTerm = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  successMessage = '';

  constructor(private meetingService: MeetingService) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.meetingService.getMeetings().subscribe(res => {
        this.meetings = res.meetings;
      });

      setInterval(() => {
        this.meetings = [...this.meetings];
      }, 60000);
    }
    else {
      this.router.navigate(['/login'])
    }
  }


  createMeeting() {
    if (this.auth.isAdmin() || this.auth.isTeacher()) {
      this.meetingService.createMeeting(this.meeting).subscribe({
        next: res => {
          this.successMessage = res.message;
          this.snackBar.open(res.message, 'colose', {
            duration: 3000, // 3 ثوانٍ
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.meeting = { meetingName: '', startTime: '', endTime: '' };
          this.ngOnInit();
        },
        error: err => alert('An error occurred: ' + err.error)
      });
    }
  }
  getMeetingStatus(start: any, end: any): string {
    const now = Date.now();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now >= startTime && now < endTime) return 'The meeting is ongoing';
    if (now < startTime) return 'Not started yet';
    return 'The meeting ended';
  }

  applyFilters() {
    this.filteredMeetings = this.meetings
      .filter(m => m.meetingName.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .sort((a, b) => {
        const aTime = new Date(a.startTime).getTime();
        const bTime = new Date(b.startTime).getTime();
        return this.sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      });
  }

  // Apply filters when input changes
  ngDoCheck() {
    this.applyFilters();
  }
  canJoinMeeting(start: any, end: any): boolean {
    const now = Date.now();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return now >= startTime && now < endTime;
  }
  getTimeRemaining(start: any): string {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const timeDiff = startTime - now;

    if (timeDiff <= 0) return '';

    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const hours = Math.floor((timeDiff / 1000 / 60 / 60) % 24);
    const days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);

    let result = '';
    if (days > 0) result += `${days} day `;
    if (hours > 0) result += `${hours} hour `;
    if (minutes > 0) result += `${minutes} minute`;

    return result.trim();
  }

}
