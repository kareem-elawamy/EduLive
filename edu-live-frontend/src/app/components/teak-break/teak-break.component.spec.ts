import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeakBreakComponent } from './teak-break.component';

describe('TeakBreakComponent', () => {
  let component: TeakBreakComponent;
  let fixture: ComponentFixture<TeakBreakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeakBreakComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeakBreakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
