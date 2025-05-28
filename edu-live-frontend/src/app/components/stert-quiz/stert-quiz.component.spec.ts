import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StertQuizComponent } from './stert-quiz.component';

describe('StertQuizComponent', () => {
  let component: StertQuizComponent;
  let fixture: ComponentFixture<StertQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StertQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StertQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
