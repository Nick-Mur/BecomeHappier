class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
    }

    async createMood(moodData) {
        const response = await fetch(`${this.baseUrl}/moods/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(moodData),
        });
        return await response.json();
    }

    async getMoods() {
        const response = await fetch(`${this.baseUrl}/moods/`);
        return await response.json();
    }

    async createQuestionSet(questionSetData) {
        const response = await fetch(`${this.baseUrl}/question-sets/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionSetData),
        });
        return await response.json();
    }

    async getQuestionSets() {
        const response = await fetch(`${this.baseUrl}/question-sets/`);
        return await response.json();
    }

    async createAnswer(answerData) {
        const response = await fetch(`${this.baseUrl}/answers/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answerData),
        });
        return await response.json();
    }

    async getMoodAverage(days = 7) {
        const response = await fetch(`${this.baseUrl}/stats/mood-average?days=${days}`);
        return await response.json();
    }
}

export const apiService = new ApiService(); 