import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoListAiComponent } from './todo-list-ai.component';

describe('TodoListAiComponent', () => {
  let component: TodoListAiComponent;
  let fixture: ComponentFixture<TodoListAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListAiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoListAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
