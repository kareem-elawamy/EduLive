import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCoursesComponent } from './task-courses.component';

describe('TaskCoursesComponent', () => {
  let component: TaskCoursesComponent;
  let fixture: ComponentFixture<TaskCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
