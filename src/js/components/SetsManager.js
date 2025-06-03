export class SetsManager {
    constructor(app) {
        console.log('SetsManager constructor started');
        this.app = app;
        this.element = null; // Изначально элемент равен null
        console.log('SetsManager constructor finished');
    }

    init() {
        console.log('SetsManager init started');
        // Добавьте здесь логику инициализации для управления наборами
        console.log('Экран управления наборами инициализирован');
        console.log('SetsManager init finished');
    }

    show() {
        console.log('SetsManager show started');
        // Получаем элемент при первом отображении, если он еще не получен
        if (!this.element) {
            this.element = document.getElementById('setsScreen');
            console.log('SetsManager element obtained in show():', this.element);
        }

        if (this.element) {
            this.element.classList.add('active');
            console.log('SetsManager element class added: active');
            // Добавьте здесь логику при отображении экрана
        } else {
            console.error('SetsManager element is still null in show() after attempting to get it');
        }
        console.log('SetsManager show finished');
    }

    hide() {
        console.log('SetsManager hide started');
        // При скрытии элемент уже должен быть получен
        if (this.element) {
            this.element.classList.remove('active');
            console.log('SetsManager element class removed: active');
            // Добавьте здесь логику при скрытии экрана
        } else {
            console.error('SetsManager element is null in hide()');
        }
        console.log('SetsManager hide finished');
    }
} 