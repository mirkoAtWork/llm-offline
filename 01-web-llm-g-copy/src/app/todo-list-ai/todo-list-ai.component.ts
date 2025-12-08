import {Component, signal} from '@angular/core';
import {MatButton, MatFabButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatList, MatListItem} from '@angular/material/list';
import {NavComponent} from '../nav/nav.component';
import {type Todo} from '../todo';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatCard, MatCardContent} from '@angular/material/card';
import {ChatCompletionMessageParam, CreateMLCEngine, MLCEngine} from '@mlc-ai/web-llm';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-list-ai',
  standalone: true,
  imports: [
    CommonModule,
    MatFabButton,
    MatIcon,
    MatIconButton,
    MatLabel,
    MatList,
    MatListItem,
    MatCheckbox,
    MatFormField,
    MatInput,
    MatButton,
    MatProgressBar,
    MatCard,
    MatCardContent
  ],
  templateUrl: './todo-list-ai.component.html',
  styleUrl: './todo-list-ai.component.css'
})
export class TodoListAiComponent {
  protected readonly todos = signal<Todo[]>([
    {text: 'Wash clothes', done: true},
    {text: 'Wash my car', done: true},
    {text: 'Pet the dog', done: false},
  ]);
  protected readonly ready = signal(false);
  protected readonly progress = signal(0);
  protected readonly reply = signal('');
  protected engine?: MLCEngine;

  async ngOnInit() {
    const model = 'Llama-3.2-3B-Instruct-q4f32_1-MLC';
    this.engine = await CreateMLCEngine(model, {
      initProgressCallback: ({progress}) =>
        this.progress.set(progress)
    });
    this.ready.set(true);
  }

  addTodo() {
    const text = prompt('Enter a new todo.');
    if (text == null) {
      return;
    }

    this.todos.update(todos => [...todos, {text, done: false}]);
  }

  deleteTodo(todo: Todo) {
    this.todos.update(todos => todos.filter(t => t !== todo));
  }

  toggleTodo(todo: Todo) {
    this.todos.update(todos => todos.map(t => t !== todo ? t : {...t, done: !t.done}));
  }

  async runPrompt(userPrompt: string) {
    this.reply.set('…');

    await this.engine!.resetChat();
    const systemPrompt = `
      The user will ask questions about their todo list.
      Here's the user's todo list:
      ${this.todos().map(todo => `* ${todo.text} (${todo.done ? 'done' : 'not done'})`).join('\n')}`;
    const messages: ChatCompletionMessageParam[] = [
      {role: "system", content: systemPrompt},
      {role: "user", content: userPrompt}
    ];
    const chunks = await this.engine!.chat.completions.create({messages, stream: true});
    let reply = '';
    for await (const chunk of chunks) {
      reply += chunk.choices[0]?.delta.content ?? '';
      this.reply.set(reply);
    }
  }
}
