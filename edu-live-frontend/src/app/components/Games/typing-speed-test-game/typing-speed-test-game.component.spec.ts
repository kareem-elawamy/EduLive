import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypingSpeedTestGameComponent } from './typing-speed-test-game.component';

describe('TypingSpeedTestGameComponent', () => {
  let component: TypingSpeedTestGameComponent;
  let fixture: ComponentFixture<TypingSpeedTestGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypingSpeedTestGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypingSpeedTestGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
