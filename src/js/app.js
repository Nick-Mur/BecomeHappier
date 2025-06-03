// Основной файл приложения
import { MainScreen } from './components/MainScreen.js';
import { Calendar } from './components/Calendar.js';
import { Charts } from './components/Charts.js';
import { SetsManager } from './components/SetsManager.js';
import { StorageService } from './services/StorageService.js';
import { DataService } from './services/DataService.js';
import { ComponentLoader } from './utils/componentLoader.js';

class App {
    constructor() {
        console.log('App constructor started');
        this.storageService = new StorageService();
        this.dataService = new DataService(this);
        this.currentScreen = null;
        this.screens = {};
        
        this.init();
        console.log('App constructor finished');
    }
    
    async init() {
        console.log('App init started');
        // Загрузка компонентов
        console.log('Loading components...');
        await ComponentLoader.loadAllComponents();
        console.log('Components loaded.');
        
        // Проверка элемента setsScreen после загрузки
        const setsElementAfterLoad = document.getElementById('setsScreen');
        console.log('setsScreen element after loading components:', setsElementAfterLoad);
        
        // Инициализация компонентов
        console.log('Initializing screens...');
        this.screens = {
            main: new MainScreen(this),
            calendar: new Calendar(this),
            charts: new Charts(this),
            sets: new SetsManager(this)
        };
        console.log('Screens initialized:', this.screens);
        
        // Показываем главный экран по умолчанию
        console.log('Showing main screen...');
        this.showScreen('main');
        console.log('Main screen shown.');
        
        // Инициализация обработчиков событий
        console.log('Initializing event listeners...');
        this.initEventListeners();
        console.log('Event listeners initialized.');
        
        console.log('App init finished');
    }
    
    showScreen(screenId) {
        console.log(`Attempting to show screen: ${screenId}`);
        // Скрываем текущий экран
        if (this.currentScreen) {
            console.log(`Hiding current screen: ${this.currentScreen.element?.id}`);
            this.currentScreen.hide();
        }
        
        // Показываем новый экран
        const nextScreen = this.screens[screenId];
        if (nextScreen) {
            console.log(`Showing next screen: ${screenId}`);
            this.currentScreen = nextScreen;
            this.currentScreen.show();
        } else {
            console.error(`Screen with ID ${screenId} not found.`);
        }
    }
    
    initEventListeners() {
        // Глобальные обработчики событий
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired');
            // Инициализация при загрузке страницы
        });
        
        // Обработка действий из data-action атрибутов
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            const action = target?.dataset.action;
            console.log('Click event detected. Target:', target, 'Action:', action);
            if (action) {
                this.handleAction(action, event);
            }
        });
    }
    
    handleAction(action, event) {
        console.log(`Handling action: ${action}`);
        switch (action) {
            case 'showMain':
                this.showScreen('main');
                break;
            case 'showCalendar':
                this.showScreen('calendar');
                break;
            case 'showCharts':
                this.showScreen('charts');
                break;
            case 'showSets':
                this.showScreen('sets');
                break;
            // Добавьте другие действия по необходимости
            default:
                console.warn(`Unhandled action: ${action}`);
        }
    }
}

// Создаем экземпляр приложения
const app = new App(); 