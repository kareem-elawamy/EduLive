import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegsterComponent } from './regster.component';

describe('RegsterComponent', () => {
  let component: RegsterComponent;
  let fixture: ComponentFixture<RegsterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegsterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegsterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
