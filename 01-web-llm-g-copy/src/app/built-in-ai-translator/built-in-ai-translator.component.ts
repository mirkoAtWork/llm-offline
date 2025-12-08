import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-built-in-ai-translator',
    standalone: true,
    imports: [
        FormsModule,
        MatTabsModule,
        MatExpansionModule,
        MatStepperModule,
        MatFormFieldModule,
        MatSuffix,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule
    ],
    templateUrl: './built-in-ai-translator.component.html',
    styleUrl: './built-in-ai-translator.component.css'
})
export class BuiltInAiTranslatorComponent {
    readonly languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' }
    ];

    sourceText = signal('');
    translatedText = signal('');
    sourceLang = signal('en');
    targetLang = signal('es');

    // Computed/Accessors for Tab Index
    get sourceLangIndex(): number {
        return this.languages.findIndex(l => l.code === this.sourceLang());
    }
    set sourceLangIndex(index: number) {
        if (index >= 0 && index < this.languages.length) {
            this.sourceLang.set(this.languages[index].code);
            this.translate();
        }
    }

    get targetLangIndex(): number {
        return this.languages.findIndex(l => l.code === this.targetLang());
    }
    set targetLangIndex(index: number) {
        if (index >= 0 && index < this.languages.length) {
            this.targetLang.set(this.languages[index].code);
            this.translate();
        }
    }

    onSourceTabChange(event: any) { // using any to avoid importing MatTabChangeEvent for brevity, or I can import it
        this.sourceLangIndex = event.index;
    }

    onTargetTabChange(event: any) {
        this.targetLangIndex = event.index;
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.translatedText());
            // Could show a snackbar here
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    swapLanguages() {
        const currentSource = this.sourceLang();
        const currentTarget = this.targetLang();
        this.sourceLang.set(currentTarget);
        this.targetLang.set(currentSource);

        const currentSourceText = this.sourceText();
        const currentTranslatedText = this.translatedText();
        this.sourceText.set(currentTranslatedText);
        this.translatedText.set(currentSourceText);

        // Trigger translation after swap if there is text
        if (this.sourceText()) {
            this.translate();
        }
    }

    translate() {
        // Placeholder for actual translation logic
        console.log(`Translating "${this.sourceText()}" from ${this.sourceLang()} to ${this.targetLang()}`);
        // Simulate translation for now
        this.translatedText.set(`[Translated to ${this.targetLang()}]: ${this.sourceText()}`);
    }

    updateSourceText(newText: string) {
        this.sourceText.set(newText);
        this.translate();
    }
}
