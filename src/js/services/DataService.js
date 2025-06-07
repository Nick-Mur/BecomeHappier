import { ApiService } from './ApiService.js';

export class DataService {
    constructor(app) {
        this.app = app;
        this.apiService = new ApiService();
        this.sets = []; // Храним полные объекты наборов
        this.answers = {};
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Загружаем наборы вопросов
            this.sets = await this.apiService.getSets();
            
            // Загружаем ответы
            const answers = await this.apiService.getAnswers();
            this.answers = answers.reduce((acc, answer) => {
                const question = this.sets
                    .flatMap(set => set.questions)
                    .find(q => q.id === answer.question_id);
                if (question) {
                    const setName = this.sets.find(set => 
                        set.questions.some(q => q.id === question.id)
                    )?.name;
                    if (setName) {
                        if (!acc[setName]) acc[setName] = {};
                        acc[setName][question.text] = answer.rating;
                    }
                }
                return acc;
            }, {});
            
            this.isInitialized = true;
            this.notifyApp('initialized');
            
        } catch (error) {
            console.error('Error initializing DataService:', error);
            this.isInitialized = false;
            this.notifyApp('error', error);
        }
    }
    
    // Уведомление приложения о изменениях
    notifyApp(event, data = null) {
        if (this.app && typeof this.app.onDataServiceEvent === 'function') {
            this.app.onDataServiceEvent(event, data);
        }
    }
    
    // Сохранение ответа
    async saveAnswer(setName, question, rating) {
        try {
            const set = this.sets.find(s => s.name === setName);
            if (!set) return false;
            
            const targetQuestion = set.questions.find(q => q.text === question);
            if (!targetQuestion) return false;
            
            await this.apiService.createAnswer({
                question_id: targetQuestion.id,
                rating: rating
            });
            
        if (!this.answers[setName]) {
            this.answers[setName] = {};
        }
        this.answers[setName][question] = rating;
            
            this.notifyApp('answerSaved', { setName, question, rating });
            return true;
        } catch (error) {
            console.error('Error saving answer:', error);
            this.notifyApp('error', error);
            return false;
        }
    }
    
    // Получение ответа
    getAnswer(setName, question) {
        return this.answers[setName]?.[question] || null;
    }
    
    // Получение статистики
    async getStatistics() {
        try {
            const stats = await this.apiService.getStatistics();
            this.notifyApp('statisticsUpdated', stats);
            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            this.notifyApp('error', error);
        return {
                average: 0,
                positive: 0,
                neutral: 0,
                negative: 0
        };
        }
    }
    
    // Получение данных о настроении
    async getMoodData() {
        try {
            const data = await this.apiService.getMoodData();
            this.notifyApp('moodDataUpdated', data);
            return data;
        } catch (error) {
            console.error('Error getting mood data:', error);
            this.notifyApp('error', error);
            return [];
        }
    }

    // Создание нового набора
    async createSet(setName, questions) {
        try {
            if (this.sets.some(s => s.name === setName)) {
                return false;
            }
            
            const newSet = await this.apiService.createSet({
                name: setName,
                is_active: true,
                questions: questions.map(text => ({ text }))
            });
            
            this.sets.push(newSet);
            this.notifyApp('setCreated', newSet);
            
            return true;
        } catch (error) {
            console.error('Error creating set:', error);
            this.notifyApp('error', error);
            return false;
        }
    }

    // Редактирование набора
    async editSet(oldName, newName, questions) {
        try {
            if (oldName !== newName && this.sets.some(s => s.name === newName)) {
                return false;
            }
            
            const oldSet = this.sets.find(s => s.name === oldName);
            if (!oldSet) return false;
            
            const updatedSet = await this.apiService.updateSet(oldSet.id, {
                name: newName,
                is_active: oldSet.is_active,
                questions: questions.map(text => ({ text }))
            });
            
            const index = this.sets.findIndex(s => s.id === oldSet.id);
            if (index !== -1) {
                this.sets[index] = updatedSet;
                
                if (oldName !== newName) {
            if (this.answers[oldName]) {
                this.answers[newName] = this.answers[oldName];
                delete this.answers[oldName];
            }
        }
                
                this.notifyApp('setUpdated', updatedSet);
        return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error editing set:', error);
            this.notifyApp('error', error);
            return false;
        }
    }

    // Удаление набора
    async deleteSet(setName) {
        try {
            const set = this.sets.find(s => s.name === setName);
            if (!set) return false;
            
            await this.apiService.deleteSet(set.id);
            
            this.sets = this.sets.filter(s => s.id !== set.id);
            
            if (this.answers[setName]) {
                delete this.answers[setName];
            }
            
            this.notifyApp('setDeleted', { id: set.id, name: setName });
            return true;
        } catch (error) {
            console.error('Error deleting set:', error);
            this.notifyApp('error', error);
            return false;
        }
    }

    // Получение всех наборов
    getAllSets() {
        return this.sets.map(set => ({
            id: set.id,
            name: set.name,
            is_active: set.is_active,
            order: set.order
        }));
    }

    // Получение вопросов для набора
    getQuestionsForSet(setName) {
        const set = this.sets.find(s => s.name === setName);
        return set ? set.questions.map(q => q.text) : [];
    }

    // Получение активных наборов
    getActiveSets() {
        return this.sets
            .filter(set => set.is_active)
            .map(set => set.name);
    }

    // Переключение активности набора
    async toggleSetActivity(setName) {
        try {
            const set = this.sets.find(s => s.name === setName);
            if (!set) return false;
            
            const updatedSet = await this.apiService.toggleSet(set.id);
            
            const index = this.sets.findIndex(s => s.id === set.id);
        if (index !== -1) {
                this.sets[index] = updatedSet;
                this.notifyApp('setToggled', updatedSet);
                 return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error toggling set:', error);
            this.notifyApp('error', error);
                 return false;
        }
    }

    // Получение всех вопросов из активных наборов
    async getAllQuestionsFromActiveSets() {
        try {
            const questions = await this.apiService.getAllQuestionsFromActiveSets();
            this.notifyApp('activeQuestionsUpdated', questions);
            return questions;
        } catch (error) {
            console.error('Error getting active questions:', error);
            this.notifyApp('error', error);
            return [];
        }
    }
    
    // Изменение порядка наборов
    async reorderSets(newOrder) {
        try {
            console.log('DataService: reorderSets called with order:', newOrder);
            const updatedSets = await this.apiService.reorderSets(newOrder);

            this.sets = updatedSets;
            this.cache.set('sets', updatedSets);
            
            // Обновляем порядок в кэше
            this.sets = this.sets.sort((a, b) => {
                return newOrder.indexOf(a.name) - newOrder.indexOf(b.name);
            });
            
            this.notifyApp('setsReordered', updatedSets);
            return updatedSets;
        } catch (error) {
            console.error('Error reordering sets:', error);
            this.notifyApp('error', error);
            throw error;
        }
    }
} 