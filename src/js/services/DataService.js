export class DataService {
    constructor(app) {
        this.app = app; // Сохраняем ссылку на экземпляр App
        this.defaultSets = {
            'Основные': [
                "Как вы себя чувствуете сегодня?",
                "Как прошёл ваш день?",
                "Оцените ваше самочувствие?"
            ],
            'Рабочее настроение': [
                "Как вы оцениваете свою продуктивность?",
                "Насколько комфортно вам было на работе?",
                "Как вы оцениваете атмосферу в коллективе?"
            ],
            'Самочувствие': [
                "Как вы оцениваете своё физическое состояние?",
                "Как вы оцениваете свой уровень энергии?",
                "Были ли у вас головные боли?"
            ]
        };
        
        this.answers = this.loadAnswers(); // Загружаем сохраненные ответы при инициализации
        this.currentSet = this.loadCurrentSet() || 'Основные'; // Загружаем текущий набор или используем Основные
        this.currentQuestionIndex = 0;
    }
    
    // Получение текущего набора вопросов
    getCurrentSet() {
        return this.defaultSets[this.currentSet];
    }
    
    // Получение текущего вопроса
    getCurrentQuestion() {
        const set = this.getCurrentSet();
        return set[this.currentQuestionIndex];
    }
    
    // Сохранение ответа
    saveAnswer(rating) {
        const set = this.currentSet;
        const question = this.getCurrentQuestion();
        if (!this.answers[set]) {
            this.answers[set] = {};
        }
        this.answers[set][question] = rating;
        this.saveAnswers(); // Сохраняем ответы после каждого изменения
    }
    
    // Получение сохраненного ответа для конкретного набора и вопроса
    getAnswer(set, question) {
        return this.answers[set]?.[question] || null;
    }
    
    // Переход к следующему вопросу
    nextQuestion() {
        const set = this.getCurrentSet();
        if (this.currentQuestionIndex < set.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }
    
    // Переход к предыдущему вопросу
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }
    
    // Получение статистики
    getStatistics() {
        // Здесь будет логика получения статистики
        return {
            average: 3.7,
            positive: 14,
            neutral: 9,
            negative: 8
        };
    }
    
    // Получение данных о настроении (для графика и статистики)
    getMoodData() {
        // Пока используем моковые данные
        // В реальном приложении здесь будет логика получения данных из хранилища
        const mockData = [
            { date: '01.10', rating: 3 },
            { date: '02.10', rating: 4 },
            { date: '03.10', rating: 4 },
            { date: '04.10', rating: 2 },
            { date: '05.10', rating: 5 },
            { date: '06.10', rating: 4 },
            { date: '07.10', rating: 3 },
            { date: '08.10', rating: 5 },
            { date: '09.10', rating: 4 },
            { date: '10.10', rating: 3 },
            { date: '11.10', rating: 2 },
            { date: '12.10', rating: 4 },
            { date: '13.10', rating: 5 },
            { date: '14.10', rating: 3 },
            { date: '15.10', rating: 4 },
            { date: '16.10', rating: 5 }, // Лучший день
            { date: '17.10', rating: 4 },
            { date: '18.10', rating: 3 },
            { date: '19.10', rating: 4 },
            { date: '20.10', rating: 5 },
            { date: '21.10', rating: 4 },
            { date: '22.10', rating: 3 },
            { date: '23.10', rating: 2 }, // Худший день
            { date: '24.10', rating: 3 },
            { date: '25.10', rating: 4 }
        ];
        return mockData;
    }

    // Сохранение ответов в Local Storage
    saveAnswers() {
        this.app.storageService.save('moodAnswers', this.answers);
    }

    // Загрузка ответов из Local Storage
    loadAnswers() {
        return this.app.storageService.get('moodAnswers') || {};
    }

    // Сохранение текущего набора в Local Storage
    saveCurrentSet() {
        this.app.storageService.save('currentMoodSet', this.currentSet);
    }

    // Загрузка текущего набора из Local Storage
    loadCurrentSet() {
        return this.app.storageService.get('currentMoodSet');
    }

    // Установка активного набора
    setActiveSet(setName) {
        if (this.defaultSets[setName]) {
            this.currentSet = setName;
            this.currentQuestionIndex = 0; // Сбрасываем индекс вопроса при смене набора
            this.saveCurrentSet(); // Сохраняем активный набор
            return true;
        }
        return false;
    }

    // Получение списка наборов
    getSets() {
        return Object.keys(this.defaultSets);
    }

    // Получение вопросов для набора
    getQuestionsForSet(setName) {
        return this.defaultSets[setName] || [];
    }
} 