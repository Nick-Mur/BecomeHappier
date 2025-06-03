export class DataService {
    constructor(app) {
        this.app = app;
        console.log('DataService constructor started'); // Лог

        // Стандартные наборы теперь тоже хранятся в userSets
        this.userSets = this.loadUserSets();
        console.log('Loaded userSets:', this.userSets); // Лог

        // Если нет сохраненных наборов, инициализируем стандартные
        if (Object.keys(this.userSets).length === 0) {
            console.log('userSets is empty, initializing default sets'); // Лог
            this.userSets = {
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
            this.saveUserSets();
            console.log('Default sets initialized and saved:', this.userSets); // Лог
        } else {
             console.log('userSets loaded from storage, not initializing defaults.'); // Лог
        }

        this.answers = this.loadAnswers();
        // Удаляем старую логику currentSet
        // this.currentSet = this.loadCurrentSet() || 'Основные';
        // this.currentQuestionIndex = 0; // Эту строку тоже нужно будет пересмотреть для работы с несколькими наборами

        // Добавляем логику активных наборов
        this.activeSets = this.loadActiveSets() || ['Основные']; // Инициализируем с 'Основные' по умолчанию
        console.log('Loaded activeSets:', this.activeSets); // Лог

        console.log('DataService constructor finished', this); // Лог
    }
    
    // Получение текущего набора вопросов - ЭТА ЛОГИКА БУДЕТ ИЗМЕНЕНА ПОЗЖЕ ДЛЯ РАБОТЫ С НЕСКОЛЬКИМИ НАБОРАМИ
    // getCurrentSet() {
    //     return this.userSets[this.currentSet];
    // }
    
    // Получение текущего вопроса - ЭТА ЛОГИКА БУДЕТ ИЗМЕНЕНА ПОЗЖЕ ДЛЯ РАБОТЫ С НЕСКОЛЬКИМИ НАБОРАМИ
    // getCurrentQuestion() {
    //     const set = this.getCurrentSet();
    //     return set[this.currentQuestionIndex];
    // }
    
    // Сохранение ответа для конкретного набора и вопроса
    saveAnswer(setName, question, rating) {
        console.log('saveAnswer called for', { setName, question, rating });
        if (!this.answers[setName]) {
            this.answers[setName] = {};
        }
        this.answers[setName][question] = rating;
        this.saveAnswers();
         console.log('Answer saved:', this.answers); // Лог
    }
    
    // Получение сохраненного ответа для конкретного набора и вопроса
    getAnswer(setName, question) {
         console.log('getAnswer called for', { setName, question });
        const rating = this.answers[setName]?.[question] || null;
         console.log('Answer retrieved:', rating); // Лог
         return rating;
    }
    
    // Переход к следующему вопросу - ЭТА ЛОГИКА БУДЕТ ИЗМЕНЕНА ПОЗЖЕ ДЛЯ РАБОТЫ С НЕСКОЛЬКИМИ НАБОРАМИ
    nextQuestion() {
        // const set = this.getCurrentSet();
        // if (this.currentQuestionIndex < set.length - 1) {
        //     this.currentQuestionIndex++;\n        //     return true;\n        // }\n        // return false;\n         console.warn('nextQuestion needs to be updated for multiple active sets');
         return false;
    }
    
    // Переход к предыдущему вопросу - ЭТА ЛОГИКА БУДЕТ ИЗМЕНЕНА ПОЗЖЕ ДЛЯ РАБОТЫ С НЕСКОЛЬКИМИ НАБОРАМИ
    previousQuestion() {
        // if (this.currentQuestionIndex > 0) {\n        //     this.currentQuestionIndex--;\n        //     return true;\n        // }\n        // return false;\n         console.warn('previousQuestion needs to be updated for multiple active sets');
         return false;
    }
    
    // Получение статистики
    getStatistics() {
        return {
            average: 3.7,
            positive: 14,
            neutral: 9,
            negative: 8
        };
    }
    
    // Получение данных о настроении (для графика и статистики)
    getMoodData() {
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
            { date: '16.10', rating: 5 },
            { date: '17.10', rating: 4 },
            { date: '18.10', rating: 3 },
            { date: '19.10', rating: 4 },
            { date: '20.10', rating: 5 },
            { date: '21.10', rating: 4 },
            { date: '22.10', rating: 3 },
            { date: '23.10', rating: 2 },
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

    // Удаляем старые методы сохранения/загрузки текущего набора
    // saveCurrentSet() {
    //     this.app.storageService.save('currentMoodSet', this.currentSet);
    // }

    // loadCurrentSet() {
    //     return this.app.storageService.get('currentMoodSet');
    // }

    // Добавляем методы для сохранения/загрузки активных наборов
    saveActiveSets() {
        console.log('Saving activeSets:', this.activeSets);
        this.app.storageService.save('activeMoodSets', this.activeSets);
        console.log('activeSets saved to storage');
    }

    loadActiveSets() {
        const loadedActiveSets = this.app.storageService.get('activeMoodSets');
        console.log('Loaded activeSets from storage:', loadedActiveSets);
        return loadedActiveSets;
    }

    // Загрузка пользовательских наборов
    loadUserSets() {
        const loadedSets = this.app.storageService.get('userSets') || {};
        console.log('Loaded userSets from storage:', loadedSets);
        return loadedSets;
    }

    // Сохранение пользовательских наборов
    saveUserSets() {
        console.log('Saving userSets:', this.userSets);
        this.app.storageService.save('userSets', this.userSets);
        console.log('userSets saved to storage');
    }

    // Создание нового набора
    createSet(setName, questions) {
        console.log('createSet called', { setName, questions });
        if (this.userSets[setName]) {
            console.warn(`Set with name "${setName}" already exists.`);
            return false; // Набор с таким именем уже существует
        }
        this.userSets[setName] = questions;
        this.saveUserSets();
         console.log('Set created:', this.userSets); // Лог
        return true;
    }

    // Редактирование набора
    editSet(oldName, newName, questions) {
        console.log('editSet called', { oldName, newName, questions });
        if (oldName !== newName && this.userSets[newName]) {
             console.warn(`Set with new name "${newName}" already exists.`);
            return false; // Новое имя уже занято
        }
        if (oldName === newName) {
            this.userSets[oldName] = questions;
        } else {
            // Переносим вопросы
            delete this.userSets[oldName];
            this.userSets[newName] = questions;
            
            // Обновляем activeSets, если переименовали активный набор
            const activeIndex = this.activeSets.indexOf(oldName);
            if (activeIndex !== -1) {
                this.activeSets[activeIndex] = newName;
                this.saveActiveSets();
            }

            // Обновляем ключи в this.answers
            if (this.answers[oldName]) {
                this.answers[newName] = this.answers[oldName];
                delete this.answers[oldName];
                this.saveAnswers();
            }
        }
        this.saveUserSets();
         console.log('Set edited:', this.userSets); // Лог
        return true;
    }

    // Удаление набора
    deleteSet(setName) {
        console.log('deleteSet called for', setName);
        if (this.userSets[setName]) {
            delete this.userSets[setName];
            this.saveUserSets();

            // Удаляем набор из activeSets, если он там был
            const activeIndex = this.activeSets.indexOf(setName);
            if (activeIndex !== -1) {
                this.activeSets.splice(activeIndex, 1);
                // Если удалили последний активный набор, добавляем 'Основные' (если они существуют)
                if (this.activeSets.length === 0 && this.userSets['Основные']) {
                    this.activeSets.push('Основные');
                }
                this.saveActiveSets();
            }

            // Удаляем ответы, связанные с этим набором
            if (this.answers[setName]) {
                delete this.answers[setName];
                this.saveAnswers();
            }
             console.log('Set deleted:', this.userSets, this.activeSets, this.answers); // Лог
            return true;
        }
         console.warn(`Set "${setName}" not found for deletion.`);
        return false;
    }

    // Получение всех наборов (пользовательских + стандартных, теперь все в userSets)
    getAllSets() {
        return Object.keys(this.userSets);
    }

    // Получение наборов для отображения в списке (все, т.к. стандартные тоже в userSets)
    getSets() {
        return this.getAllSets(); // Теперь просто возвращаем все ключи из userSets
    }

    // Получение вопросов для конкретного набора
    getQuestionsForSet(setName) {
        return this.userSets[setName] || [];
    }

    // Метод для получения списка активных наборов
    getActiveSets() {
        return this.activeSets;
    }

    // Метод для переключения активности набора
    toggleSetActivity(setName) {
        console.log(`Toggling activity for set: ${setName}`);
        const index = this.activeSets.indexOf(setName);
        if (index !== -1) {
            // Если набор активен, делаем его неактивным (но не позволяем удалить последний активный)
            if (this.activeSets.length > 1) {
                this.activeSets.splice(index, 1);
                 this.saveActiveSets();
                 console.log(`Deactivated set "${setName}". Active sets: `, this.activeSets); // Лог
                 return true;
            } else {
                 console.warn('Cannot deactivate the last active set.');
                 return false;
            }
        } else {
            // Если набор неактивен, делаем его активным
            if (this.userSets[setName]) { // Проверяем, что набор существует перед активацией
                this.activeSets.push(setName);
                this.saveActiveSets();
                console.log(`Activated set "${setName}". Active sets: `, this.activeSets); // Лог
                return true;
            } else {
                 console.warn(`Set "${setName}" not found, cannot activate.`);
                 return false;
            }
        }
    }

    // Метод для получения всех вопросов из активных наборов
    // Возвращает массив объектов { setName: string, question: string }
    getAllQuestionsFromActiveSets() {
        console.log('getAllQuestionsFromActiveSets called. Active sets:', this.activeSets); // Лог
        let allQuestions = [];
        this.activeSets.forEach(setName => {
            if (this.userSets[setName]) {
                const questionsInSet = this.userSets[setName].map(question => ({
                    setName: setName,
                    question: question
                }));
                allQuestions = allQuestions.concat(questionsInSet);
            } else {
                 console.warn(`Active set "${setName}" not found in userSets.`); // Лог предупреждения
            }
        });
         console.log('All questions from active sets (formatted):', allQuestions); // Лог
        return allQuestions;
    }

    // TODO: Refactor question navigation (nextQuestion, previousQuestion, etc.) to work with getAllQuestionsFromActiveSets (this will be done in MainScreen)

    // Метод для изменения порядка наборов
    reorderSets(newOrder) {
        console.log('Reordering sets:', newOrder);
        const reorderedSets = {};
        newOrder.forEach(setName => {
            if (this.userSets[setName]) {
                reorderedSets[setName] = this.userSets[setName];
            }
        });
        this.userSets = reorderedSets;
        this.saveUserSets();
        console.log('Sets reordered:', this.userSets);
    }
} 