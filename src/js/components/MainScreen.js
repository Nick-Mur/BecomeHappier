import { apiService } from '../services/ApiService.js';

export class MainScreen {
    constructor(app) {
        this.app = app;
        this.element = document.getElementById('mainScreen');
        this.currentQuestionSet = null;
        this.init();
    }

    async init() {
        // Загрузка активного набора вопросов
        await this.loadActiveQuestionSet();
        
        // Инициализация обработчиков событий
        this.initEventListeners();
    }

    async loadActiveQuestionSet() {
        try {
            const questionSets = await apiService.getQuestionSets();
            this.currentQuestionSet = questionSets.find(set => set.is_active);
            this.render();
        } catch (error) {
            console.error('Error loading question set:', error);
        }
    }
    
    initEventListeners() {
        // Обработчик отправки формы
        this.element.querySelector('form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e.target);
        });
    }

    async handleSubmit(form) {
        try {
            // Создаем запись настроения
            const moodData = {
                mood_level: parseInt(form.querySelector('[name="mood-level"]').value),
                note: form.querySelector('[name="note"]').value
            };
            
            const mood = await apiService.createMood(moodData);
            
            // Создаем ответы на вопросы
            if (this.currentQuestionSet) {
                const answers = Array.from(form.querySelectorAll('.question-input')).map(input => ({
                    text: input.value,
                    question_id: parseInt(input.dataset.questionId),
                    mood_id: mood.id
                }));
                
                for (const answer of answers) {
                    await apiService.createAnswer(answer);
                }
            }
            
            // Очищаем форму
            form.reset();
            
            // Показываем уведомление об успехе
            this.showNotification('Запись успешно сохранена!');
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('Ошибка при сохранении записи', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    render() {
        if (!this.currentQuestionSet) {
            this.element.innerHTML = `
                <div class="text-center p-8">
                    <h2 class="text-2xl font-bold mb-4">Нет активного набора вопросов</h2>
                    <p class="text-gray-600">Создайте новый набор вопросов в разделе "Наборы"</p>
                </div>
            `;
            return;
        }

        this.element.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold mb-6">Как вы себя чувствуете сегодня?</h2>
                
                <form class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Уровень настроения</label>
                        <div class="flex justify-between space-x-2">
                            ${[1, 2, 3, 4, 5].map(level => `
                                <button type="button" 
                                        class="emoji-btn flex-1 p-4 rounded-lg border-2 border-gray-200 hover:border-primary"
                                        data-mood-level="${level}">
                                    ${this.getMoodEmoji(level)}
                                </button>
                            `).join('')}
                        </div>
                        <input type="hidden" name="mood-level" value="">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Заметка</label>
                        <textarea name="note" 
                                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                  rows="3"
                                  placeholder="Как прошел ваш день?"></textarea>
                    </div>
                    
                    ${this.currentQuestionSet.questions.map((question, index) => `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">${question.text}</label>
                            <input type="text" 
                                   name="answer-${question.id}"
                                   data-question-id="${question.id}"
                                   class="question-input w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                   placeholder="Ваш ответ">
                        </div>
                    `).join('')}
                    
                    <button type="submit" 
                            class="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors">
                        Сохранить
                    </button>
                </form>
            </div>
        `;

        // Добавляем обработчики для кнопок настроения
        this.element.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.element.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                this.element.querySelector('[name="mood-level"]').value = btn.dataset.moodLevel;
            });
        });
    }

    getMoodEmoji(level) {
        const emojis = ['😢', '😕', '😐', '🙂', '😊'];
        return emojis[level - 1];
    }
    
    show() {
            this.element.classList.add('active');
    }
    
    hide() {
            this.element.classList.remove('active');
    }
} 