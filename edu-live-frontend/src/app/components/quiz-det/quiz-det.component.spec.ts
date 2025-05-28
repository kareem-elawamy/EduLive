import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizDetComponent } from './quiz-det.component';

describe('QuizDetComponent', () => {
  let component: QuizDetComponent;
  let fixture: ComponentFixture<QuizDetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizDetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
