export class MainScreen {
    constructor(app) {
        console.log('MainScreen constructor started');
        this.app = app;
        this.element = null; // Изначально элемент равен null
        this.currentQuestionIndex = 0; // Добавляем индекс текущего вопроса в объединенном списке
        this.allQuestions = []; // Добавляем массив для хранения всех вопросов из активных наборов
        this.init();
        console.log('MainScreen constructor finished');
    }
    
    init() {
        console.log('MainScreen init started');
        // Элементы будем инициализировать в show()
        // initEventListeners теперь вызывается в setupEventListeners, который вызывается в show()
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
          console.log('MainScreen event listeners set up');
    }

    handleNext() {
        console.log('MainScreen handleNext called. Current index:', this.currentQuestionIndex);
        // Переходим к следующему вопросу в объединенном списке
        if (this.currentQuestionIndex < this.allQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.updateUI();
        } else {
            // Если это последний вопрос, показываем соответствующее сообщение
            console.log('Reached end of questions.');
            this.questionElement.textContent = 'Это был последний вопрос';
            this.questionNumberElement.textContent = 'Опрос завершен';
            this.nextButton.textContent = 'Это был последний вопрос';
            this.nextButton.disabled = true;
            this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3); // Показываем нейтральное эмодзи
            this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        }
    }
    
    handlePrevious() {
        console.log('MainScreen handlePrevious called. Current index:', this.currentQuestionIndex);
        // Переходим к предыдущему вопросу в объединенном списке
        // Добавляем проверку: если мы находимся в состоянии "Опрос завершен" (кнопка "Следующий" имеет текст "Завершить"),
        // то при нажатии "Назад" просто обновляем UI, оставаясь на последнем вопросе.
        if (this.nextButton.textContent === 'Завершить' && this.currentQuestionIndex === this.allQuestions.length - 1) {
             console.log('Currently at the end screen, going back to the last question.');
             this.updateUI(); // Просто обновляем UI для текущего (последнего) вопроса
        } else if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateUI();
        } else {
            console.log('Reached beginning of questions.');
        }
    }
    
    handleEmojiSelect(element, rating) {
        console.log('MainScreen handleEmojiSelect', { rating, currentQuestionIndex: this.currentQuestionIndex });
        // Удаляем активный класс у всех кнопок эмодзи
        this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс выбранной кнопке
        element.classList.add('active');
        
        // Обновляем отображаемое эмодзи
        this.mainEmojiDisplayElement.src = this.getEmojiImagePath(rating);

        // Сохраняем ответ для текущего вопроса из объединенного списка
        const currentQuestionData = this.allQuestions[this.currentQuestionIndex];
        if (currentQuestionData) {
            this.app.dataService.saveAnswer(currentQuestionData.setName, currentQuestionData.question, rating);
             console.log('Answer saved for question:', currentQuestionData.question, 'from set:', currentQuestionData.setName);
        } else {
             console.error('Cannot save answer: current question data is undefined.');
        }
    }
    
    updateUI() {
        console.log('MainScreen updateUI started. Current index:', this.currentQuestionIndex);
        if (!this.element || this.allQuestions.length === 0) {
            console.log('updateUI skipped: element not found or no active questions.');
            this.questionElement.textContent = 'Нет активных наборов с вопросами.';
            this.questionNumberElement.textContent = '';
            this.prevButton.disabled = true;
            this.nextButton.disabled = true;
            this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
            this.emojiButtons.forEach(btn => btn.classList.remove('active'));
            return;
        }

        const currentQuestionData = this.allQuestions[this.currentQuestionIndex];
        const totalQuestions = this.allQuestions.length;

        if (currentQuestionData) {
            const currentQuestionText = currentQuestionData.question;
            const currentSetName = currentQuestionData.setName;

            // Получаем сохраненный ответ для текущего вопроса и набора
            const savedRating = this.app.dataService.getAnswer(currentSetName, currentQuestionText);

            // Обновляем отображение основного эмодзи
            if (savedRating !== null) {
                this.mainEmojiDisplayElement.src = this.getEmojiImagePath(savedRating);
                this.emojiButtons.forEach(btn => {
                    if (parseInt(btn.dataset.rating, 10) === savedRating) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            } else {
                this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
                this.emojiButtons.forEach(btn => btn.classList.remove('active'));
            }

            this.questionElement.textContent = currentQuestionText;
            this.questionNumberElement.textContent = `Вопрос #${this.currentQuestionIndex + 1} из ${totalQuestions} (${currentSetName})`;

            // Обновляем состояние кнопок навигации
            this.prevButton.disabled = this.currentQuestionIndex === 0;
            this.nextButton.disabled = false;
            this.nextButton.textContent = this.currentQuestionIndex === totalQuestions - 1 ? 'Завершить' : 'Следующий вопрос';

        } else {
            console.error('updateUI failed: current question data is undefined at index', this.currentQuestionIndex);
            this.questionElement.textContent = 'Произошла ошибка при загрузке вопроса.';
            this.questionNumberElement.textContent = '';
            this.prevButton.disabled = true;
            this.nextButton.disabled = true;
            this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
            this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        }

        console.log('MainScreen updateUI finished');
    }
    
    show() {
        console.log('MainScreen show started');
        // Получаем элемент при первом отображении, если он еще не получен
        if (!this.element) {
            this.element = document.getElementById('mainScreen');
             if (this.element) {
                 this.initElements(); // Инициализируем элементы DOM после получения
                 this.setupEventListeners(); // Навешиваем слушатели событий
                 console.log('MainScreen element obtained in show():', this.element);
             } else {
                  console.error('MainScreen element #mainScreen not found in show()');
             }
        }

        if (this.element) {
            this.element.classList.add('active');
            
            // Сбрасываем индекс и загружаем вопросы из активных наборов при каждом отображении
            this.currentQuestionIndex = 0;
            this.allQuestions = this.app.dataService.getAllQuestionsFromActiveSets();
             console.log('Loaded all questions from active sets for MainScreen:', this.allQuestions);

             this.updateUI(); // Обновляем UI при каждом отображении с новым списком вопросов
            console.log('MainScreen element class added: active');

        } else {
            // Этот else блок теперь, по идее, не должен выполняться, если #mainScreen был найден
            console.error('MainScreen element is still null in show() after load attempt');
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