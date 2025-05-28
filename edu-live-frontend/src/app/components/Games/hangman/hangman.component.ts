// hangman.component.ts
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, Pipe } from '@angular/core';
import { pipe } from 'rxjs';

@Component({
  selector: 'app-hangman',
  templateUrl: './hangman.component.html',
  imports: [UpperCasePipe, NgIf, NgFor],
  styleUrls: ['./hangman.component.css'],
})
export class HangmanComponent implements OnInit, OnDestroy {
  letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  clickedLetters: string[] = [];
  guessedLetters: string[] = [];
  wordCategory = '';
  wordToGuess = '';
  wordLetters: string[] = [];
  wrongAttempts = 0;
  maxWrong = 8;
  totalSeconds = 0;
  timerDisplay = '00:00';
  timerInterval: any;

  // Audio
  successAudio = new Audio('assets/success.mp3');
  failAudio = new Audio('assets/fail.mp3');

  ngOnInit() {
    this.resetGame();
    this.startTimer();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  resetGame() {
    const categories: { [key in 'programming' | 'movies' | 'people' | 'countries']: string[] } = {
      programming: ['php', 'javascript', 'go', 'scala', 'fortran', 'r', 'mysql', 'python'],
      movies: ['prestige', 'inception', 'parasite', 'interstellar', 'whiplash', 'memento', 'coco', 'up'],
      people: ['albert einstein', 'hitchcock', 'alexander', 'cleopatra', 'mahatma ghandi'],
      countries: ['syria', 'palestine', 'yemen', 'egypt', 'bahrain', 'qatar']
    };

    const keys = Object.keys(categories) as Array<keyof typeof categories>;
    this.wordCategory = keys[Math.floor(Math.random() * keys.length)];
    const words = categories[this.wordCategory as keyof typeof categories];
    this.wordToGuess = words[Math.floor(Math.random() * words.length)];
    this.wordLetters = this.wordToGuess.toLowerCase().split('');
    this.guessedLetters = [];
    this.clickedLetters = [];
    this.wrongAttempts = 0;
    this.totalSeconds = 0;
    this.timerDisplay = '00:00';
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.totalSeconds++;
      const min = String(Math.floor(this.totalSeconds / 60)).padStart(2, '0');
      const sec = String(this.totalSeconds % 60).padStart(2, '0');
      this.timerDisplay = `${min}:${sec}`;
    }, 1000);
  }

  onLetterClick(letter: string) {
    if (this.clickedLetters.includes(letter)) return;
    this.clickedLetters.push(letter);

    if (this.wordLetters.includes(letter)) {
      this.guessedLetters.push(letter);
      this.successAudio.play();
    } else {
      this.failAudio.play();
      this.wrongAttempts++;
    }

    if (this.wrongAttempts >= this.maxWrong) {
      clearInterval(this.timerInterval);
    }
  }

  isLetterRevealed(letter: string): boolean {
    return letter === ' ' || this.guessedLetters.includes(letter);
  }

  isGameOver(): boolean {
    return this.wrongAttempts >= this.maxWrong;
  }
}
