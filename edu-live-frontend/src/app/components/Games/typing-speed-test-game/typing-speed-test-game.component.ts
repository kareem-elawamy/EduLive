import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartDataset, ChartOptions } from 'chart.js';

type LevelName = 'Easy' | 'Normal' | 'Hard';

@Component({
  selector: 'app-typing-speed-test-game',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule, NgChartsModule],
  templateUrl: './typing-speed-test-game.component.html',
  styleUrl: './typing-speed-test-game.component.css'
})
export class TypingGameComponent {
  wordStartTime: number = 0;
  levels: Record<LevelName, number> = { Easy: 10, Normal: 5, Hard: 2 };
  defaultLevelName: LevelName = 'Normal';
  startTime: number = 0;
  chartType: 'line' | 'bar' | 'doughnut' | 'radar' = 'line';

  get defaultLevelSeconds(): number {
    return this.levels[this.defaultLevelName];
  }

  allWords: string[] = [
    "Hello", "Programming", "Code", "Javascript", "Town", "Country", "Testing",
    "Youtube", "Linkedin", "Twitter", "Github", "Leetcode", "Internet", "Python",
    "Scala", "Destructuring", "Paradigm", "Styling", "Cascade", "Documentation",
    "Coding", "Funny", "Working", "Dependencies", "Task", "Runner", "Roles",
    "Test", "Rust", "Playing"
  ];
  words: string[] = [...this.allWords];

  currentWord = '';
  upcomingWords: string[] = [];
  currentInput = '';
  timeLeft = this.defaultLevelSeconds;
  score = 0;
  total = this.allWords.length;
  interval: any;
  finishMessage = '';
  finished: 'good' | 'bad' | null = null;

  // Chart
  scoreHistory: number[] = [];
  chartLabels: string[] = [];
  chartData: ChartDataset<'line' | 'bar' | 'doughnut' | 'radar'>[] = [{
    data: [],
    label: 'Time Per Word (sec)',
    fill: false,
    tension: 0.2,
    borderColor: '#3b82f6',
    pointBackgroundColor: '#3b82f6'
  }];

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Seconds'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Word'
        }
      }
    }
  };

  levelNames(): LevelName[] {
    return Object.keys(this.levels) as LevelName[];
  }

  setChartType(type: 'line' | 'bar' | 'doughnut' | 'radar') {
    this.chartType = type;
    // إعادة تحديث البيانات لترسم بشكل صحيح
    this.updateScore();
  }

  startGame() {
    this.startTime = Date.now();
    this.words = [...this.allWords];
    this.score = 0;
    this.scoreHistory = [];
    this.chartLabels = [];
    this.chartData = [{
      data: [], label: 'Time Per Word (sec)',
      fill: false,
      tension: 0.2,
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6'
    }];
    this.finishMessage = '';
    this.finished = null;
    clearInterval(this.interval);
    this.nextWord();
  }

  nextWord() {
    if (this.words.length === 0) {
      this.finishMessage = '🎉 Congratulations! You typed all the words!';
      this.finished = 'good';
      return;
    }
    this.wordStartTime = Date.now();
    this.currentInput = '';
    this.timeLeft = this.defaultLevelSeconds;
    this.currentWord = this.words.splice(Math.floor(Math.random() * this.words.length), 1)[0];
    this.upcomingWords = [...this.words];

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft === 0) {
        clearInterval(this.interval);
        if (this.currentInput.trim().toLowerCase() === this.currentWord.toLowerCase()) {
          this.updateScore();
          this.nextWord();
        } else {
          this.finishMessage = '❌ Game Over!';
          this.finished = 'bad';
        }
      }
    }, 1000);
  }

  onInputChange() {
    if (this.currentInput.trim().toLowerCase() === this.currentWord.toLowerCase()) {
      clearInterval(this.interval);
      this.updateScore();
      this.nextWord();
    }
  }

  updateScore() {

    const timeTaken = (Date.now() - this.startTime) / 1000;
    this.score++;
    this.scoreHistory.push(+timeTaken.toFixed(2));
    this.chartLabels.push(this.currentWord);       // نعرض اسم الكلمة بدل W1, W2

    const commonData = {
      data: [...this.scoreHistory],
      label: 'Time Per Word (sec)'
    };

    if (this.chartType === 'line') {
      this.chartData = [{
        ...commonData,
        fill: false,
        tension: 0.2,
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6'
      }];
    } else if (this.chartType === 'bar') {
      this.chartData = [{
        ...commonData,
        backgroundColor: '#3b82f6',
        borderRadius: 5
      }];
    } else if (this.chartType === 'doughnut' || this.chartType === 'radar') {
      this.chartData = [{
        ...commonData,
        backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
      }];
    }
  }
}
