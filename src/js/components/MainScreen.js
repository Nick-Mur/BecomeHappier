export class MainScreen {
    constructor(app) {
        console.log('MainScreen constructor started');
        this.app = app;
        this.element = null; // Изначально элемент равен null
        // Изменяем структуру для хранения вопросов: теперь это массив объектов { setName: string, questions: string[] }
        this.activeSetsWithQuestions = [];
        this.currentSetIndex = 0; // Индекс текущего набора
        this.currentQuestionIndexInSet = 0; // Индекс текущего вопроса внутри набора

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
        console.log('MainScreen handleNext called.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });

        const currentSetData = this.activeSetsWithQuestions[this.currentSetIndex];
        const totalSets = this.activeSetsWithQuestions.length;

        if (!currentSetData) {
            console.error('handleNext: No current set data.');
            return;
        }

        const totalQuestionsInSet = currentSetData.questions.length;

        // Сначала пытаемся перейти к следующему вопросу внутри текущего набора
        if (this.currentQuestionIndexInSet < totalQuestionsInSet - 1) {
            this.currentQuestionIndexInSet++;
            console.log('Moved to next question in set.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });
            this.updateUI();
        // Если это последний вопрос в текущем наборе, пытаемся перейти к следующему набору
        } else if (this.currentSetIndex < totalSets - 1) {
            this.currentSetIndex++;
            this.currentQuestionIndexInSet = 0; // Начинаем с первого вопроса нового набора
            console.log('Moved to next set.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });
            this.updateUI();
        // Если это последний вопрос последнего набора
        } else {
            console.log('Reached end of last set. Navigating to main screen.');
            this.app.showScreen('main');
            // Сбрасываем индексы при возврате на главный экран
            this.currentSetIndex = 0;
            this.currentQuestionIndexInSet = 0;
            // this.app.dataService.clearAnswers(); // Раскомментировать, если ответы должны сбрасываться
        }
    }
    
    handlePrevious() {
        console.log('MainScreen handlePrevious called.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });

        const totalSets = this.activeSetsWithQuestions.length;

        if (totalSets === 0) {
            console.log('handlePrevious: No active sets.');
            return;
        }

        // Сначала пытаемся перейти к предыдущему вопросу внутри текущего набора
        if (this.currentQuestionIndexInSet > 0) {
            this.currentQuestionIndexInSet--;
            console.log('Moved to previous question in set.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });
            this.updateUI();
        // Если это первый вопрос в текущем наборе, пытаемся перейти к последнему вопросу предыдущего набора
        } else if (this.currentSetIndex > 0) {
            this.currentSetIndex--;
            // Переходим к последнему вопросу предыдущего набора
            const previousSetData = this.activeSetsWithQuestions[this.currentSetIndex];
            this.currentQuestionIndexInSet = previousSetData.questions.length - 1;
            console.log('Moved to previous set.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });
            this.updateUI();
        // Если это первый вопрос первого набора, отключаем кнопку "Назад"
        } else {
            console.log('Already at the first question of the first set.');
            this.prevButton.disabled = true;
        }
    }
    
    handleEmojiSelect(element, rating) {
        console.log('MainScreen handleEmojiSelect', { rating, currentQuestionIndex: this.currentQuestionIndexInSet });
        // Удаляем активный класс у всех кнопок эмодзи
        this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        
        // Добавляем активный класс выбранной кнопке
        element.classList.add('active');
        
        // Обновляем отображаемое эмодзи
        this.mainEmojiDisplayElement.src = this.getEmojiImagePath(rating);

        // Сохраняем ответ для текущего вопроса из объединенного списка
        const currentQuestionData = this.activeSetsWithQuestions[this.currentSetIndex].questions[this.currentQuestionIndexInSet];
        if (currentQuestionData) {
            this.app.dataService.saveAnswer(this.activeSetsWithQuestions[this.currentSetIndex].setName, currentQuestionData, rating);
             console.log('Answer saved for question:', currentQuestionData, 'from set:', this.activeSetsWithQuestions[this.currentSetIndex].setName);
        } else {
             console.error('Cannot save answer: current question data is undefined.');
        }
    }
    
    updateUI() {
        console.log('MainScreen updateUI started.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet });

        const totalSets = this.activeSetsWithQuestions.length;

        // Если нет активных наборов или текущие индексы некорректны
        if (totalSets === 0 || this.currentSetIndex >= totalSets || this.currentQuestionIndexInSet < 0) {
            console.log('updateUI skipped: No active sets or invalid indices.');
            this.questionElement.textContent = 'Нет активных наборов с вопросами.';
            this.questionNumberElement.textContent = '';
            this.prevButton.disabled = true;
            this.nextButton.disabled = true;
            this.nextButton.textContent = 'Вернуться в начало';
            this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
            this.emojiButtons.forEach(btn => btn.classList.remove('active'));
            // Возможно, нужно также скрыть блок выбора эмодзи
            return;
        }

        const currentSetData = this.activeSetsWithQuestions[this.currentSetIndex];
        if (!currentSetData || !currentSetData.questions || currentSetData.questions.length === 0) {
             console.error('updateUI failed: Current set data is invalid or empty.', currentSetData);
             this.questionElement.textContent = 'Произошла ошибка при загрузке вопросов для набора.';
             this.questionNumberElement.textContent = '';
             this.prevButton.disabled = true;
             this.nextButton.disabled = true;
             this.nextButton.textContent = 'Вернуться в начало';
             this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
             this.emojiButtons.forEach(btn => btn.classList.remove('active'));
             return;
        }

        const currentQuestionText = currentSetData.questions[this.currentQuestionIndexInSet];
        const currentSetName = currentSetData.setName;
        const totalQuestionsInSet = currentSetData.questions.length;

        if (currentQuestionText === undefined) {
             console.error('updateUI failed: Current question text is undefined.', { setIndex: this.currentSetIndex, questionIndex: this.currentQuestionIndexInSet, currentSetData });
             this.questionElement.textContent = 'Произошла ошибка при загрузке текста вопроса.';
             this.questionNumberElement.textContent = '';
             this.prevButton.disabled = true;
             this.nextButton.disabled = true;
             this.nextButton.textContent = 'Вернуться в начало';
             this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
             this.emojiButtons.forEach(btn => btn.classList.remove('active'));
             return;
        }

        // Получаем сохраненный ответ для текущего вопроса и набора
        const savedRating = this.app.dataService.getAnswer(currentSetName, currentQuestionText);

        // Обновляем отображение основного эмодзи и активных кнопок выбора
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
            // Если ответа нет, показываем нейтральное эмодзи и сбрасываем активные кнопки
            this.mainEmojiDisplayElement.src = this.getEmojiImagePath(3);
            this.emojiButtons.forEach(btn => btn.classList.remove('active'));
        }

        // Определяем текст вопроса и номер на основе текущего индекса в наборе и имени набора
        this.questionElement.textContent = currentQuestionText;

        // --- Расчет глобальной нумерации (n/k) ---
        let totalQuestionsGlobal = 0;
        this.activeSetsWithQuestions.forEach(set => {
            totalQuestionsGlobal += set.questions.length;
        });

        let questionsBeforeCurrentSet = 0;
        for (let i = 0; i < this.currentSetIndex; i++) {
            questionsBeforeCurrentSet += this.activeSetsWithQuestions[i].questions.length;
        }
        const currentQuestionGlobal = questionsBeforeCurrentSet + this.currentQuestionIndexInSet + 1;
        // --- Конец расчета глобальной нумерации ---

        this.questionNumberElement.textContent = `Вопрос #${this.currentQuestionIndexInSet + 1} из ${totalQuestionsInSet} в наборе '${currentSetName}' (${currentQuestionGlobal}/${totalQuestionsGlobal})`;

        // Обновляем состояние кнопок навигации
        // Кнопка "Назад" отключена только на первом вопросе ПЕРВОГО набора
        this.prevButton.disabled = (this.currentSetIndex === 0 && this.currentQuestionIndexInSet === 0);

        // Текст кнопки "Следующий" зависит от того, последний ли это вопрос в ПОСЛЕДНЕМ наборе
        const isLastQuestionInLastSet = (this.currentSetIndex === totalSets - 1 && this.currentQuestionIndexInSet === totalQuestionsInSet - 1);

        if (isLastQuestionInLastSet) {
            // На последнем вопросе последнего набора кнопка становится "Вернуться в начало"
            this.nextButton.textContent = 'Вернуться в начало';
        } else {
            // На всех остальных вопросах (включая последние вопросы не последнего набора)
            this.nextButton.textContent = 'Следующий вопрос';
        }
        // Кнопка "Следующий" всегда активна (переход на главный экран или следующий вопрос/набор)
        this.nextButton.disabled = false;

        console.log('MainScreen updateUI finished.');
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

            // Загружаем активные наборы и их вопросы из DataService
            // Учитываем порядок наборов, возвращаемый dataService.getActiveSets()
            const activeSetNamesInOrder = this.app.dataService.getActiveSets();
             console.log('MainScreen show: activeSetNamesInOrder from DataService.getActiveSets()', activeSetNamesInOrder); // Добавлен лог

            this.activeSetsWithQuestions = activeSetNamesInOrder
                .map(setName => {
                    const questions = this.app.dataService.getQuestionsForSet(setName);
                    // Фильтруем наборы без вопросов
                    if (questions && questions.length > 0) {
                        return { setName: setName, questions: questions };
                    } else {
                        // Возвращаем null для наборов без вопросов или несуществующих
                        return null;
                    }
                })
                .filter(set => set !== null); // Удаляем null элементы (пустые или несуществующие наборы)

             console.log('Loaded active sets with questions for MainScreen (in order):', this.activeSetsWithQuestions); // Добавлен лог

            // Сбрасываем индексы при каждом показе экрана, чтобы всегда начинать с первого вопроса первого набора
            // Если нужно сохранять позицию, эту логику следует изменить.
            this.currentSetIndex = 0;
            this.currentQuestionIndexInSet = 0;

            this.updateUI(); // Обновляем UI с новыми данными
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