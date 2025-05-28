declare var JitsiMeetExternalAPI: any;

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from '../services/signalr.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MeetingService } from '../services/meeting.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavbarComponent } from "../components/navbar/navbar.component";

@Component({
  selector: 'app-meeting',
  imports: [NavbarComponent],
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.css'
})
export class MeetingComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  signalrService = inject(SignalrService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  meet = inject(MeetingService);

  roomId: string = ''
  userName: string = this.authService.getUserName();
  token: string = this.authService.getToken();
  domain: string = 'meet.jit.si';
  api: any;
  users: string[] = [];
  activeSpeaker: string = '';
  meetingStartTime!: Date;
  meetingEndTime!: Date;
  meetingStarted: boolean = false;
  checkInterval: any;
  meetingClosedByUser: boolean = false;

  ngOnInit(): void {
    this.roomId = String(this.route.snapshot.paramMap.get('id') ?? '');

    if (!this.roomId) {
      this.showSnack('رقم الغرفة غير موجود');
      this.router.navigate(['/home']);
      return;
    }
    console.log(this.roomId);

    this.meet.stertTiem(this.roomId).subscribe((data) => {
      this.meetingStartTime = new Date(data.startTime);
      this.meetingEndTime = new Date(data.endTime);
      console.log('⏰ Start Time:', this.meetingStartTime);
      console.log('⏰ End Time:', this.meetingEndTime);
    });

    this.checkInterval = setInterval(() => {
      const now = new Date();

      if (!this.meetingStarted && now >= this.meetingStartTime) {
        this.startMeeting();
        this.meetingStarted = true;
      }

      if (this.meetingStarted && this.meetingEndTime && now >= this.meetingEndTime) {
        this.endMeeting(true); // انتهاء تلقائي
        clearInterval(this.checkInterval);
      }
    }, 15000);

    if (this.roomId && this.userName && this.token) {
      this.signalrService.startConnection(this.token);

      setTimeout(() => {
        this.signalrService.joinRoom(this.roomId, this.userName);
      }, 1000);

      this.signalrService.onUserJoined(name => {
        if (!this.users.includes(name)) this.users.push(name);
        this.showSnack(`${name} انضم للاجتماع`);
      });

      this.signalrService.onUserLeft(name => {
        this.users = this.users.filter(u => u !== name);
        this.showSnack(`${name} غادر الاجتماع`);
      });

      this.signalrService.onUserMuteChanged((name, muted) => {
        const status = muted ? 'كتم صوته' : 'أعاد تشغيل الميكروفون';
        this.showSnack(`${name} ${status}`);
      });

      this.signalrService.onUserSpeaking(name => {
        this.activeSpeaker = name;
        this.showSnack(`${name} يتحدث الآن`);
      });

      this.signalrService.onUsersInCall(users => {
        this.users = users;
      });

      if (this.signalrService.hubConnection) {
        this.signalrService.hubConnection.on('UsersInCall', (list: any[]) => {
          this.users = list.map(u => u.UserName || u.userName || u);
        });
      }


    }
  }

  startMeeting() {
    console.log("🚀 Meeting started");
    const options = {
      roomName: this.roomId,
      width: '100%',
      height: 700,
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: this.userName
      },
      configOverwrite: {
        startWithAudioMuted: true,
        disableModeratorIndicator: false,
      }, onReadyToClose: () => {
        console.log("🛑 Meeting closed by user.");
        this.router.navigate(['/home']); // أو أي صفحة تانية
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#f0f4f8',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'chat', 'raisehand',
          'tileview', 'fullscreen', 'hangup'
        ],
        APP_NAME: 'EduLive',
        NATIVE_APP_NAME: 'EduLive Meeting',
      }
    };

    this.api = new JitsiMeetExternalAPI(this.domain, options);

    this.api.addListener('audioMuteStatusChanged', (e: any) => {
      this.signalrService.toggleMute(this.roomId, this.userName, e.muted);
    });

    this.api.addListener('dominantSpeakerChanged', (e: any) => {
      if (e.id) {
        this.signalrService.userSpeaking(this.roomId, this.userName);
      }
    });

    this.api.addListener('readyToClose', () => {
      this.meetingClosedByUser = true;
      this.endMeeting(true);
    });
  }

  endMeeting(navigatedByUser: boolean = false) {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }

    this.signalrService.leaveRoom(this.roomId, this.userName);
    this.showSnack('تم إنهاء الاجتماع');

    if (navigatedByUser) {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.checkInterval);
    if (!this.meetingClosedByUser) {
      this.endMeeting(true);
    }
  }

  showSnack(message: string) {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'left',
    });
  }
}
