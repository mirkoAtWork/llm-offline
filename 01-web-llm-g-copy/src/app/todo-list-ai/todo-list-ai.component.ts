import { Component, OnInit, signal, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { NavComponent } from '../nav/nav.component';
import { type Todo } from '../todo';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCard, MatCardContent } from '@angular/material/card';
import { ChatCompletionMessageParam, CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import { CommonModule } from '@angular/common';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

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
    MatCardContent,
    MatSelect,
    MatOption,
    FormsModule,
    MatExpansionModule
  ],
  templateUrl: './todo-list-ai.component.html',
  styleUrl: './todo-list-ai.component.css'
})
export class TodoListAiComponent implements OnInit {
  protected readonly todos = signal<Todo[]>([
    { text: 'Wash clothes', done: true },
    { text: 'Wash my car', done: true },
    { text: 'Pet the dog', done: false },
  ]);
  protected readonly ready = signal(false);
  protected readonly progress = signal(0);
  protected readonly reply = signal('');
  protected engine?: MLCEngine;

  readonly models = [
    { id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', name: 'Llama 3.2 3B' },
    { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi 3 Mini' },
    { id: 'gemma-2b-it-q4f32_1-MLC', name: 'Gemma 2B' },
    { id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen2 1.5B' }
  ];
  protected selectedModel = signal(this.models[0].id);

  @ViewChild('prompt') promptInput!: ElementRef<HTMLInputElement>;

  @HostListener('window:keydown', ['$event'])
  focusPrompt(event: KeyboardEvent) {
    // Check for Ctrl + P or Cmd + P
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
      // If the user is already typing in an input field (including the prompt itself),
      // we should not hijack the key press IF it's a typing action.
      // However, Ctrl+P is rarely a typing action (it's Print).
      // So we usually WANT to hijack it everywhere to prevent Print.

      event.preventDefault();
      if (this.promptInput?.nativeElement) {
        this.promptInput.nativeElement.focus();
        this.promptInput.nativeElement.value = '';
      }
    }
  }

  async ngOnInit() {
    await this.initEngine(this.selectedModel());
  }

  async onModelChange(modelId: string) {
    this.selectedModel.set(modelId);
    await this.initEngine(modelId);
  }

  private async initEngine(modelId: string) {
    this.ready.set(false);
    this.progress.set(0);
    // If engine exists, we might need to unload or reload. 
    // MLCEngine doesn't have a specific 'unload' in the types shown, but reloading with CreateMLCEngine usually handles it or we create a new one.
    // However, properly, we should reload.
    if (this.engine) {
      await this.engine.unload();
    }

    this.engine = await CreateMLCEngine(modelId, {
      initProgressCallback: ({ progress }) =>
        this.progress.set(progress)
    });
    this.ready.set(true);
  }

  addTodo() {
    const text = prompt('Enter a new todo.');
    if (text == null) {
      return;
    }

    this.todos.update(todos => [...todos, { text, done: false }]);
  }

  deleteTodo(todo: Todo) {
    this.todos.update(todos => todos.filter(t => t !== todo));
  }

  toggleTodo(todo: Todo) {
    this.todos.update(todos => todos.map(t => t !== todo ? t : { ...t, done: !t.done }));
  }

  async runPrompt(userPrompt: string) {
    this.reply.set('…');

    await this.engine!.resetChat();
    const systemPrompt = `
      The user will ask questions about their todo list.
      Here's the user's todo list:
      ${this.todos().map(todo => `* ${todo.text} (${todo.done ? 'done' : 'not done'})`).join('\n')}`;
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    const chunks = await this.engine!.chat.completions.create({ messages, stream: true });
    let reply = '';
    for await (const chunk of chunks) {
      reply += chunk.choices[0]?.delta.content ?? '';
      this.reply.set(reply);
    }
  }
}
