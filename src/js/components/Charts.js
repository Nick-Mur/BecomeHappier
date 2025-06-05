import { apiService } from '../services/ApiService.js';

export class Charts {
    constructor(app) {
        console.log('Charts constructor started');
        this.app = app;
        this.element = document.getElementById('chartsScreen');
        this.charts = {};
        this.init();
        console.log('Charts constructor finished');
    }

    async init() {
        console.log('Charts init started');
        this.initEventListeners();
        await this.loadData();
        console.log('Экран графиков инициализирован (без привязки к DOM)');
        console.log('Charts init finished');
    }

    initEventListeners() {
        // Обработчик изменения периода
        this.element.querySelector('#periodSelect')?.addEventListener('change', async (e) => {
            await this.loadData(e.target.value);
        });
    }

    async loadData(period = '7') {
        try {
            const moodData = await apiService.getMoodAverage(parseInt(period));
            this.renderCharts(moodData);
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }

    renderCharts(data) {
        const ctx = this.element.querySelector('#moodChart').getContext('2d');
        
        // Уничтожаем предыдущий график, если он существует
        if (this.charts.mood) {
            this.charts.mood.destroy();
        }

        // Создаем новый график
        this.charts.mood = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Уровень настроения',
                    data: data.values || [],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    show() {
        console.log('Charts show started');
        this.element.classList.add('active');
        this.loadData(); // Перезагружаем данные при показе
        console.log('Charts element class added: active');
        // Добавьте здесь логику при отображении экрана
        console.log('Charts show finished');
    }

    hide() {
        console.log('Charts hide started');
        this.element.classList.remove('active');
        console.log('Charts element class removed: active');
        // Добавьте здесь логику при скрытии экрана
        console.log('Charts hide finished');
    }

    updateStats() {
         if (!this.element) return; // Не обновляем статистику, если элемент еще не получен
        console.log('Charts updateStats started');
        const data = this.app.dataService.getMoodData();
        if (data.length === 0) {
             console.log('Charts updateStats: no data');
             return;
        }

        // Находим лучший и худший дни
        const bestDay = data.reduce((a, b) => a.rating > b.rating ? a : b);
        const worstDay = data.reduce((a, b) => a.rating < b.rating ? a : b);

        // Обновляем информацию о лучшем дне
        const bestDayEmojiElement = this.element.querySelector('.grid-cols-2 .card:first-child .text-5xl');
        const bestDayDateElement = this.element.querySelector('.grid-cols-2 .card:first-child .text-xl');
        if(bestDayEmojiElement && bestDayDateElement) {
             bestDayEmojiElement.textContent = this.getEmoji(bestDay.rating);
             bestDayDateElement.textContent = bestDay.date;
             console.log('Charts updateStats: best day updated');
        }


        // Обновляем информацию о худшем дне
         const worstDayEmojiElement = this.element.querySelector('.grid-cols-2 .card:last-child .text-5xl');
         const worstDayDateElement = this.element.querySelector('.grid-cols-2 .card:last-child .text-xl');
         if(worstDayEmojiElement && worstDayDateElement) {
             worstDayEmojiElement.textContent = this.getEmoji(worstDay.rating);
             worstDayDateElement.textContent = worstDay.date;
              console.log('Charts updateStats: worst day updated');
         }


        // Обновляем статистику использования
        this.updateUsageStats(data);
        console.log('Charts updateStats finished');
    }

    updateUsageStats(data) {
         if (!this.element) return; // Не обновляем статистику использования, если элемент еще не получен
        console.log('Charts updateUsageStats started');
        const total = data.length;
        const stats = {
            1: 0, // 😭
            2: 0, // 😔
            3: 0, // 😐
            4: 0, // 😃
            5: 0  // 🤩
        };

        data.forEach(item => {
            stats[item.rating]++;
        });

        // Обновляем проценты
        const percentages = this.element.querySelectorAll('.grid-cols-5 .text-xs.font-medium');
        const emojis = ['😭', '😔', '😐', '😃', '🤩']; // Порядок эмодзи должен соответствовать порядку в HTML

        emojis.forEach((emoji, index) => {
            const rating = Object.keys(this.getEmojiMap()).find(key => this.getEmojiMap()[key] === emoji);
             if (rating && percentages[index]) {
                 const count = stats[rating] || 0;
                 const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                 percentages[index].textContent = `${percentage}%`;
                  console.log(`Charts updateUsageStats: emoji ${emoji} updated with ${percentage}%`);
             }
        });

        console.log('Charts updateUsageStats finished');
    }

    getEmoji(rating) {
        const emojis = {
            1: '😭',
            2: '😔',
            3: '😐',
            4: '😃',
            5: '🤩'
        };
        return emojis[rating] || '😐';
    }

     getEmojiMap() {
         return {
             1: '😭',
             2: '😔',
             3: '😐',
             4: '😃',
             5: '🤩'
         };
     }
} 