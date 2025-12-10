import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'todo-ai-theme';
    private readonly LIGHT_THEME = 'assets/themes/azure-blue.css';
    private readonly DARK_THEME = 'assets/themes/pink-bluegrey.css';

    readonly isDark = signal(false);

    constructor() {
        const saved = localStorage.getItem(this.THEME_KEY);
        if (saved === 'dark') {
            this.isDark.set(true);
        }
        this.applyTheme(this.isDark());
    }

    toggleTheme() {
        this.isDark.update(d => !d);
        const isDark = this.isDark();
        localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
        this.applyTheme(isDark);
    }

    private applyTheme(isDark: boolean) {
        const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = isDark ? this.DARK_THEME : this.LIGHT_THEME;
        }
    }
}
