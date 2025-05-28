import { Component, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../Games/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { ClickComponent } from '../Games/click/click.component';

@Component({
  selector: 'app-teak-break',
  imports: [NavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './teak-break.component.html',
  styleUrl: './teak-break.component.css'
})
export class TeakBreakComponent {
  sidebarOpen = false;
@ViewChild('game') game!: ClickComponent;

showScore() {
  alert('السكور: ' + this.game.getScore());
}
}
