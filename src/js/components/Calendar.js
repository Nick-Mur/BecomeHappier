import { apiService } from '../services/ApiService.js';

export class Calendar {
    constructor(app) {
        console.log('Calendar constructor started');
        this.app = app;
        this.element = document.getElementById('calendarScreen');
        this.currentDate = new Date();
        this.moods = [];
        this.init();
        console.log('Calendar constructor finished');
    }

    async init() {
        console.log('Calendar init started');
        this.initEventListeners();
        await this.loadMoods();
        console.log('Calendar init finished');
    }

    initEventListeners() {
        // Обработчики навигации по месяцам
        this.element.querySelector('#prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        this.element.querySelector('#nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
    }

    async loadMoods() {
        try {
            this.moods = await apiService.getMoods();
            this.render();
        } catch (error) {
            console.error('Error loading moods:', error);
        }
    }

    getMoodForDate(date) {
        return this.moods.find(mood => {
            const moodDate = new Date(mood.date);
            return moodDate.toDateString() === date.toDateString();
        });
    }

    getMoodEmoji(level) {
        const emojis = ['😢', '😕', '😐', '🙂', '😊'];
        return emojis[level - 1] || '😐';
    }

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Получаем первый день месяца и последний день
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Получаем день недели для первого дня месяца (0 - воскресенье, 1 - понедельник, и т.д.)
        const firstDayOfWeek = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Создаем заголовок календаря
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        
        this.element.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <button id="prevMonth" class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h2 class="text-2xl font-bold">${monthNames[month]} ${year}</h2>
                    <button id="nextMonth" class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="grid grid-cols-7 gap-2">
                    ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => `
                        <div class="text-center font-semibold text-gray-600">${day}</div>
                    `).join('')}

                    ${Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }, (_, i) => `
                        <div class="aspect-square"></div>
                    `).join('')}

                    ${Array.from({ length: totalDays }, (_, i) => {
                        const date = new Date(year, month, i + 1);
                        const mood = this.getMoodForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return `
                            <div class="aspect-square border rounded-lg p-1 ${
                                isToday ? 'border-primary' : 'border-gray-200'
                            }">
                                <div class="text-sm text-gray-600">${i + 1}</div>
                                ${mood ? `
                                    <div class="text-2xl text-center mt-1">
                                        ${this.getMoodEmoji(mood.mood_level)}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Добавляем обработчики событий после рендеринга
        this.initEventListeners();
    }

    show() {
        console.log('Calendar show started');
        this.element.classList.add('active');
        this.loadMoods(); // Перезагружаем данные при показе
        console.log('Calendar show finished');
    }

    hide() {
        console.log('Calendar hide started');
        this.element.classList.remove('active');
        console.log('Calendar hide finished');
    }
} 