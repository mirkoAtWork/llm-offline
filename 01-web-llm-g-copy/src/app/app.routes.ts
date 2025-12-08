import { Routes } from '@angular/router';
import { TodoListAiComponent } from './todo-list-ai/todo-list-ai.component';

export const routes: Routes = [
    { path: 'todo-list-ai', component: TodoListAiComponent },
    { path: '', redirectTo: '/todo-list-ai', pathMatch: 'full' },
];
