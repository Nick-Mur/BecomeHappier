export class StorageService {
    constructor() {
        this.storage = window.localStorage;
    }
    
    // Сохранение данных
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            this.storage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            return false;
        }
    }
    
    // Получение данных
    get(key) {
        try {
            const data = this.storage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            return null;
        }
    }
    
    // Удаление данных
    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Ошибка при удалении данных:', error);
            return false;
        }
    }
    
    // Очистка всех данных
    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Ошибка при очистке хранилища:', error);
            return false;
        }
    }
} 