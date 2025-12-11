import { Component, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


export interface IDetectionResult {
    detectedLanguage: string;
    confidence: number;
}
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
        MatSelectModule,
        MatProgressBar,
        MatSlideToggleModule
    ],
    templateUrl: './built-in-ai-translator.component.html',
    styleUrl: './built-in-ai-translator.component.css'
})
export class BuiltInAiTranslatorComponent implements OnInit {
    // ref.: https://web.dev/ai-translator/
    // ref.: https://web.dev/ai-translator/translate-text/ 
    // ref.: https://web.dev/ai-translator/detect-language/
    // ref.: https://web.dev/ai-translator/availability/
    // ref.: https://web.dev/ai-translator/monitor-download-progress/
    // ref.: https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/translation-language-detection-api-playground/script.js



    readonly languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' }
    ];

    detector: any;
    detectedLang = signal<IDetectionResult>({ detectedLanguage: '', confidence: 0 });
    loadingDetector = signal(0);
    sourceText = signal('');
    translatedText = signal('');
    sourceLang = signal('en');
    targetLang = signal('es');
    autoDetectLanguage = signal(false);

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

    ngOnInit(): void {
        this.checkForBuiltInAiTranslator();
    }

    async checkForBuiltInAiTranslator() {
        if ('LanguageDetector' in window) {
            // The Language Detector API is available.
            const LanguageDetector = window.LanguageDetector;
            // @ts-ignore
            this.detector = await LanguageDetector.create({
                // @ts-ignore
                monitor: (m: any) => {
                    m.addEventListener('downloadprogress', (e: any) => {
                        this.loadingDetector.set(e.loaded);
                        console.log(`Downloaded ${e.loaded * 100}%`);
                    });
                },
            });
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
            this.detectLanguage();
            this.translate();
        }
    }

    async translate() {
        if (!this.sourceText()) {
            return;
        }
        if ('Translator' in self) {
            const sourceLanguage = this.sourceLang();
            const targetLanguage = this.targetLang();
            if (sourceLanguage == targetLanguage) {
                this.translatedText.set(this.sourceText());
                return;
            }
            // @ts-ignore
            const availability = await Translator.availability({ sourceLanguage, targetLanguage });
            if (availability == 'unavailable') {
                console.log('Translation not available');
                this.translatedText.set('Translation not available');
            }
            if (availability == 'available') {
                // @ts-ignore
                const translation = await Translator.create({
                    sourceLanguage, targetLanguage
                });
                const translatedText = await translation.translate(this.sourceText())
                this.translatedText.set(translatedText);
            }
        }
        // Placeholder for actual translation logic
        //console.log(`Translating "${this.sourceText()}" from ${this.sourceLang()} to ${this.targetLang()}`);
        // Simulate translation for now
        //this.translatedText.set(`[Translated to ${this.targetLang()}]: ${this.sourceText()}`);
    }

    async detectLanguage() {
        if (this.detector) {
            const result = await this.detector.detect(this.sourceText())
            const bestMatch = result[0];
            this.detectedLang.set(bestMatch);

            if (this.autoDetectLanguage() && bestMatch && bestMatch.detectedLanguage) {
                const detectedCode = bestMatch.detectedLanguage;
                // check if we support this language
                const supportedLang = this.languages.find(l => l.code === detectedCode);
                if (supportedLang && detectedCode !== this.sourceLang()) {
                    this.sourceLang.set(detectedCode);
                }
            }
        }
    }


    updateSourceText(newText: string) {
        this.sourceText.set(newText);
        this.detectLanguage();
        this.translate();
    }
}
