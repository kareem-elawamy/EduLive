import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegsterComponent } from './components/regster/regster.component';
import { CreateCourseComponent } from './components/create-course/create-course.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { QuizDetComponent } from './components/quiz-det/quiz-det.component';
import { TeacherComponent } from './components/teacher/teacher.component';
import { CourseComponent } from './components/course/course.component';
import { StertQuizComponent } from './components/stert-quiz/stert-quiz.component';
import { MeetingService } from './services/meeting.service';
import { MeetingComponent } from './meeting/meeting.component';
import { CreateMeetingComponent } from './components/create-meeting/create-meeting.component';
import { TeakBreakComponent } from './components/teak-break/teak-break.component';
import { HangmanComponent } from './components/Games/hangman/hangman.component';
import { TypingGameComponent } from './components/Games/typing-speed-test-game/typing-speed-test-game.component';
import { ClickComponent } from './components/Games/click/click.component';
import { TaskComponent } from './components/task/task.component';
import { TaskCoursesComponent } from './components/task-courses/task-courses.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegsterComponent },
  { path: 'course', component: CreateCourseComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'add-question/:id', component: QuizDetComponent },
  { path: 'teacher/:id', component: TeacherComponent },
  { path: 'course/:id', component: CourseComponent },
  { path: 'stert-quiz/:id', component: StertQuizComponent },
  { path: 'meeting/:id', component: MeetingComponent },
  { path: 'meeting', component: CreateMeetingComponent },
  { path: 'task', component: TaskComponent },
  { path: 'task/course', component: TaskCoursesComponent },

  {
    path: 'break', component: TeakBreakComponent, children: [
      { path: 'hangman', component: HangmanComponent },
      { path: '', redirectTo: 'hangman', pathMatch: 'full' },
      { path: 'typingspeed', component: TypingGameComponent },
      { path: 'click', component: ClickComponent }
    ]
  },
  { path: '**', component: NotFoundComponent },

];
