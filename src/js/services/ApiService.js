export class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8000/api';
    }

    // Получение всех наборов вопросов
    async getSets() {
        const response = await fetch(`${this.baseUrl}/sets/`);
        if (!response.ok) {
            throw new Error('Failed to fetch sets');
        }
        return await response.json();
    }

    // Создание нового набора вопросов
    async createSet(set) {
        const response = await fetch(`${this.baseUrl}/sets/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(set)
        });
        if (!response.ok) {
            throw new Error('Failed to create set');
        }
        return await response.json();
    }

    // Обновление набора вопросов
    async updateSet(setId, set) {
        const response = await fetch(`${this.baseUrl}/sets/${setId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(set)
        });
        if (!response.ok) {
            throw new Error('Failed to update set');
        }
        return await response.json();
    }

    // Удаление набора вопросов
    async deleteSet(setId) {
        const response = await fetch(`${this.baseUrl}/sets/${setId}/`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete set');
        }
        return await response.json();
    }

    // Активация/деактивация набора
    async toggleSet(setId) {
        const response = await fetch(`${this.baseUrl}/sets/${setId}/toggle/`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to toggle set');
        }
        return await response.json();
    }

    // Получение всех ответов
    async getAnswers() {
        const response = await fetch(`${this.baseUrl}/answers/`);
        if (!response.ok) {
            throw new Error('Failed to fetch answers');
        }
        return await response.json();
    }

    // Создание нового ответа
    async createAnswer(answer) {
        const response = await fetch(`${this.baseUrl}/answers/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answer)
        });
        if (!response.ok) {
            throw new Error('Failed to create answer');
        }
        return await response.json();
    }

    // Получение статистики
    async getStatistics() {
        const response = await fetch(`${this.baseUrl}/statistics/`);
        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }
        return await response.json();
    }

    // Получение данных о настроении
    async getMoodData() {
        const response = await fetch(`${this.baseUrl}/mooddata/`);
        if (!response.ok) {
            throw new Error('Failed to fetch mood data');
        }
        return await response.json();
    }

    // Получение всех вопросов из активных наборов
    async getAllQuestionsFromActiveSets() {
        const response = await fetch(`${this.baseUrl}/questions/active/`);
        if (!response.ok) {
            throw new Error('Failed to fetch active questions');
        }
        return await response.json();
    }

    // Изменение порядка наборов
    async reorderSets(order) {
        const response = await fetch(`${this.baseUrl}/sets/reorder/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order })
        });
        if (!response.ok) {
            throw new Error('Failed to reorder sets');
        }
        return await response.json();
    }
} 