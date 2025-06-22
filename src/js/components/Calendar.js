export class Calendar {
    constructor(app) {
        console.log('Calendar constructor started');
        this.app = app;
        this.element = null; // Изначально элемент равен null
        this.init();
        console.log('Calendar constructor finished');
    }

    init() {
        console.log('Calendar init started');
        // Логика инициализации, которая не требует прямого доступа к DOM-элементу
        console.log('Экран календаря инициализирован (без привязки к DOM)');
        console.log('Calendar init finished');
    }

    show() {
        console.log('Calendar show started');
        // Получаем элемент при первом отображении, если он еще не получен
        if (!this.element) {
            this.element = document.getElementById('calendarScreen');
            console.log('Calendar element obtained in show():', this.element);
            // Возможно, здесь нужно будет вызвать метод для отрисовки календаря
        }

        if (this.element) {
            this.element.classList.add('active');
            console.log('Calendar element class added: active');
            // Добавьте здесь логику при отображении экрана
        } else {
            console.error('Calendar element is still null in show() after attempting to get it');
        }
        console.log('Calendar show finished');
    }

    hide() {
        console.log('Calendar hide started');
        // При скрытии элемент уже должен быть получен
        if (this.element) {
            this.element.classList.remove('active');
            console.log('Calendar element class removed: active');
            // Добавьте здесь логику при скрытии экрана
        } else {
            console.error('Calendar element is null in hide()');
        }
        console.log('Calendar hide finished');
    }
} 