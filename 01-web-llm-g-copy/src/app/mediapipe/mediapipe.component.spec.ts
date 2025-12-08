import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediapipeComponent } from './mediapipe.component';

describe('MediapipeComponent', () => {
  let component: MediapipeComponent;
  let fixture: ComponentFixture<MediapipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediapipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediapipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
