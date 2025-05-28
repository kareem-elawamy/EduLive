import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hubConnection!: signalR.HubConnection;

  startConnection(token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7089/meetingHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error: ', err));
  }

  // Text Chat Methods
  joinRoom(roomName: string, userName: string) {
    this.hubConnection.invoke('JoinRoom', roomName, userName);
  }

  leaveRoom(roomName: string, userName: string) {
    this.hubConnection.invoke('LeaveRoom', roomName, userName);
  }

  sendMessage(roomId: string, userName: string, message: string) {
    this.hubConnection.invoke('SendMessage', roomId, userName, message);
  }

  // Video Call Methods
  joinCall(roomId: string, userName: string) {
    this.hubConnection.invoke('JoinCall', roomId, userName);
  }

  leaveCall(roomId: string, userName: string) {
    this.hubConnection.invoke('LeaveCall', roomId, userName);
  }

  sendOffer(roomId: string, targetUserId: string, offer: any) {
    this.hubConnection.invoke('SendOffer', roomId, targetUserId, offer);
  }

  sendAnswer(roomId: string, targetUserId: string, answer: any) {
    this.hubConnection.invoke('SendAnswer', roomId, targetUserId, answer);
  }

  sendIceCandidate(roomId: string, targetUserId: string, candidate: any) {
    this.hubConnection.invoke('SendIceCandidate', roomId, targetUserId, candidate);
  }

  signalingComplete(roomId: string, targetUserId: string) {
    this.hubConnection.invoke('SignalingComplete', roomId, targetUserId);
  }

  sendSignal(roomId: string, targetUserId: string, signal: any, type: string) {
    this.hubConnection.invoke('SendSignal', roomId, targetUserId, signal, type);
  }

  // Audio Control Methods
  toggleMute(roomName: string, userName: string, isMuted: boolean) {
    this.hubConnection.invoke('ToggleMute', roomName, userName, isMuted);
  }

  userSpeaking(roomName: string, userName: string) {
    this.hubConnection.invoke('UserSpeaking', roomName, userName);
  }

  // Event Handlers
  onUserJoined(callback: (userName: string) => void) {
    this.hubConnection.on('UserJoined', callback);
  }

  onUserLeft(callback: (userName: string) => void) {
    this.hubConnection.on('UserLeft', callback);
  }

  onUserMuteChanged(callback: (userName: string, isMuted: boolean) => void) {
    this.hubConnection.on('UserMuteChanged', callback);
  }

  onUserSpeaking(callback: (userName: string) => void) {
    this.hubConnection.on('UserSpeaking', callback);
  }

  // Video Call Event Handlers
  onUserJoinedCall(callback: (userId: string, userName: string) => void) {
    this.hubConnection.on('UserJoinedCall', callback);
  }

  onUserLeftCall(callback: (userId: string, userName: string) => void) {
    this.hubConnection.on('UserLeftCall', callback);
  }

  onUsersInCall(callback: (users: string[]) => void) {
    this.hubConnection.on('UsersInCall', callback);
  }

  onReceiveOffer(callback: (userId: string, offer: any) => void) {
    this.hubConnection.on('ReceiveOffer', callback);
  }

  onReceiveAnswer(callback: (userId: string, answer: any) => void) {
    this.hubConnection.on('ReceiveAnswer', callback);
  }

  onReceiveIceCandidate(callback: (userId: string, candidate: any) => void) {
    this.hubConnection.on('ReceiveIceCandidate', callback);
  }

  onSignalingComplete(callback: (userId: string) => void) {
    this.hubConnection.on('SignalingComplete', callback);
  }

  onReceiveSignal(callback: (userId: string, signal: any, type: string) => void) {
    this.hubConnection.on('ReceiveSignal', callback);
  }
}