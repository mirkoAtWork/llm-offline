import { Routes } from '@angular/router';
import { TodoListAiComponent } from './todo-list-ai/todo-list-ai.component';
import { BuiltInAiTranslatorComponent } from './built-in-ai-translator/built-in-ai-translator.component';

import { MediapipeComponent } from './mediapipe/mediapipe.component';

export const routes: Routes = [
    { path: 'built-in-ai-translator', component: BuiltInAiTranslatorComponent },
    { path: 'todo-list-ai', component: TodoListAiComponent },
    { path: 'mediapipe', component: MediapipeComponent },
    { path: '', redirectTo: '/todo-list-ai', pathMatch: 'full' },
];
