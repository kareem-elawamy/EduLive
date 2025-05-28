import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-click',
  imports: [],
  templateUrl: './click.component.html',
  styleUrl: './click.component.css'
})
export class ClickComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef;
  private ctx!: CanvasRenderingContext2D;
  private circleX = 200;
  private circleY = 200;
  private radius = 30;
  score = 0;
  private maxClicks = 50;
  private clickCount = 0;
  private isGameRunning = false;

  private intervalId: any = null;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    this.ctx = canvas.getContext('2d')!;
    this.drawStartScreen();
  }

  startGame() {
    this.score = 0;
    this.clickCount = 0;
    this.isGameRunning = true;
    this.drawCircle();

    // بداية المؤقت
    this.intervalId = setInterval(() => {
      if (this.isGameRunning) {
        this.drawCircle();
      }
    }, 1500);
  }

  stopGame() {
    this.isGameRunning = false;
    this.drawEndScreen();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getScore() {
    return this.score;
  }

  showScore() {
    alert('score: ' + this.getScore());
  }

  private drawStartScreen() {
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#000';
    this.ctx.fillText('Click to Start Game', 60, 150);
  }

  private drawEndScreen() {
    this.clearCanvas();
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#000';

    this.score >= this.maxClicks / 2 ? this.ctx.fillText(`Win! Score: ${this.score}/${this.clickCount}`, 40, 150) : this.ctx.fillText(`Game Over! Score: ${this.score}/${this.clickCount} `, 40, 150)
  }

  private drawCircle() {
    this.clearCanvas();
    this.circleX = Math.random() * (this.canvasRef.nativeElement.width - 60) + 30;
    this.circleY = Math.random() * (this.canvasRef.nativeElement.height - 60) + 30;
    this.ctx.beginPath();
    this.ctx.arc(this.circleX, this.circleY, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#4ade80';
    this.ctx.shadowColor = '#34d399';
    this.ctx.shadowBlur = 20;
    this.ctx.fill();
    this.ctx.closePath();
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  handleClick(event: MouseEvent) {
    if (!this.isGameRunning) {
      this.startGame();
      return;
    }
    this.clickCount++;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const dist = Math.sqrt((x - this.circleX) ** 2 + (y - this.circleY) ** 2);
    if (dist <= this.radius) {
      this.score++;

      if (this.clickCount >= this.maxClicks) {
        this.stopGame();
      } else {

        this.drawCircle();
      }
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

