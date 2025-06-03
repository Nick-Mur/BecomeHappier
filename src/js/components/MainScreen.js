export class MainScreen {
    constructor(app) {
        console.log('MainScreen constructor started');
        this.app = app;
        this.element = null; // Изначально элемент равен null
        this.init();
        console.log('MainScreen constructor finished');
    }
    
    init() {
        console.log('MainScreen init started');
        // Элементы будем инициализировать в show()
        this.initEventListeners();
        // updateUI будет вызываться в show()
        console.log('Главный экран инициализирован (без привязки к DOM)');
        console.log('MainScreen init finished');
    }
    
    initElements() {
         if (!this.element) return; // Не инициализируем, если элемент еще не получен
        this.questionElement = this.element.querySelector('.card h2');
        this.questionNumberElement = this.element.querySelector('.card p');
        this.mainEmojiDisplayElement = this.element.querySelector('#mainEmojiDisplay'); // Получаем элемент img для основного эмодзи
        this.nextButton = this.element.querySelector('#nextBtn');
        this.prevButton = this.element.querySelector('#prevBtn');
        this.emojiButtons = this.element.querySelectorAll('.emoji-btn');
        console.log('MainScreen DOM elements initialized');
    }
    
    initEventListeners() {
        // Обработчики событий навешиваем только если элемент существует
        // В данном случае, лучше навесить их после получения this.element в show()
    }
    
    setupEventListeners(){
         if (!this.element) return; // Не навешиваем, если элемент еще не получен
         console.log('MainScreen setting up event listeners');
         this.nextButton.addEventListener('click', () => this.handleNext());
         this.prevButton.addEventListener('click', () => this.handlePrevious());
         this.emojiButtons.forEach((btn) => {
             // Получаем рейтинг из data-атрибута кнопки
             const rating = parseInt(btn.dataset.rating, 10);
             btn.addEventListener('click', () => this.handleEmojiSelect(btn, rating));
         });
    }

    handleNext() {
        console.log('MainScreen handleNext');
        if (this.app.dataService.nextQuestion()) {
            this.updateUI();
        }
    }
    
    handlePrevious() {
        console.log('MainScreen handlePrevious');
        if (this.app.dataService.previousQuestion()) {
            this.updateUI();
        }
    }
    
    handleEmojiSelect(element, rating) {
        console.log('MainScreen handleEmojiSelect', { rating });
        // Удаляем активный класс у всех кнопок эмодзи
        this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс выбранной кнопке
        element.classList.add('active');
        
        // Обновляем отображаемое эмодзи
        this.mainEmojiDisplayElement.src = this.getEmojiImagePath(rating);

        // Сохраняем ответ
        this.app.dataService.saveAnswer(rating);
    }
    
    updateUI() {
        console.log('MainScreen updateUI started');
         if (!this.element) return; // Не обновляем UI, если элемент еще не получен
        const currentQuestion = this.app.dataService.getCurrentQuestion();
        const currentIndex = this.app.dataService.currentQuestionIndex;
        const totalQuestions = this.app.dataService.getCurrentSet().length;

        // Получаем сохраненный ответ для текущего вопроса (если есть)
        const savedRating = this.app.dataService.getAnswer(this.app.dataService.currentSet, currentQuestion);

        // Обновляем отображение основного эмодзи
        if (savedRating !== null) {
             this.mainEmojiDisplayElement.src = this.getEmojiImagePath(savedRating);
             // Отмечаем выбранную кнопку эмодзи
             this.emojiButtons.forEach(btn => {
                 if (parseInt(btn.dataset.rating, 10) === savedRating) {
                     btn.classList.add('active');
                 } else {
                     btn.classList.remove('active');
                 }
             });
        } else {
             // Если ответа нет, показываем нейтральное эмодзи и снимаем активный класс со всех кнопок
             this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3); // По умолчанию нейтральное
             this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        }
        
        this.questionElement.textContent = currentQuestion;
        this.questionNumberElement.textContent = `Вопрос #${currentIndex + 1}`;
        
        // Обновляем состояние кнопок навигации
        this.prevButton.disabled = currentIndex === 0;
        this.nextButton.textContent = currentIndex === totalQuestions - 1 ? 'Завершить' : 'Следующий вопрос';
         console.log('MainScreen updateUI finished');
    }
    
    show() {
        console.log('MainScreen show started');
        // Получаем элемент при первом отображении, если он еще не получен
        if (!this.element) {
            this.element = document.getElementById('mainScreen');
             this.initElements(); // Инициализируем элементы DOM после получения
             this.setupEventListeners(); // Навешиваем слушатели событий
            console.log('MainScreen element obtained in show():', this.element);
        }

        if (this.element) {
            this.element.classList.add('active');
             this.updateUI(); // Обновляем UI при каждом отображении
            console.log('MainScreen element class added: active');
            // Добавьте здесь логику при отображении экрана
        } else {
            console.error('MainScreen element is still null in show() after attempting to get it');
        }
        console.log('MainScreen show finished');
    }
    
    hide() {
        console.log('MainScreen hide started');
        // При скрытии элемент уже должен быть получен
        if (this.element) {
            this.element.classList.remove('active');
            console.log('MainScreen element class removed: active');
            // Добавьте здесь логику при скрытии экрана
        } else {
            console.error('MainScreen element is null in hide()');
        }
        console.log('MainScreen hide finished');
    }

    // Вспомогательный метод для получения пути к изображению эмодзи по рейтингу
    getEmojiImagePath(rating) {
        const paths = {
            1: 'src/assets/icons/mood-1.png',
            2: 'src/assets/icons/mood-2.png',
            3: 'src/assets/icons/mood-3.png',
            4: 'src/assets/icons/mood-4.png',
            5: 'src/assets/icons/mood-5.png',
        };
        return paths[rating] || 'src/assets/icons/mood-3.png'; // По умолчанию нейтральное
    }
} 