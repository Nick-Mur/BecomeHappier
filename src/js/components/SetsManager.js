import { ComponentLoader } from '../utils/componentLoader.js';
import { apiService } from '../services/ApiService.js';

export class SetsManager {
    constructor(app) {
        this.app = app;
        this.element = document.getElementById('setsScreen');
        this.questionSets = [];
        this.init();
    }

    async init() {
        await this.loadQuestionSets();
        this.initEventListeners();
    }

    async loadQuestionSets() {
        try {
            this.questionSets = await apiService.getQuestionSets();
            this.render();
        } catch (error) {
            console.error('Error loading question sets:', error);
        }
    }

    initEventListeners() {
        // Обработчик создания нового набора
        document.getElementById('createSetModal').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateSet(e.target);
        });

        // Обработчик редактирования набора
        document.getElementById('editSetModal').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEditSet(e.target);
        });
    }

    async handleCreateSet(form) {
        try {
            const name = form.querySelector('[name="setName"]').value;
            const questions = Array.from(form.querySelectorAll('.question-input'))
                .map(input => ({ text: input.value }))
                .filter(q => q.text.trim() !== '');

            const questionSetData = {
                name,
                is_active: true,
                questions
            };

            await apiService.createQuestionSet(questionSetData);
            await this.loadQuestionSets();
            this.closeModal('createSetModal');
            this.showNotification('Набор успешно создан!');
        } catch (error) {
            console.error('Error creating question set:', error);
            this.showNotification('Ошибка при создании набора', 'error');
        }
    }

    async handleEditSet(form) {
        try {
            const setId = parseInt(form.dataset.setId);
            const name = form.querySelector('[name="setName"]').value;
            const questions = Array.from(form.querySelectorAll('.question-input'))
                .map(input => ({
                    id: parseInt(input.dataset.questionId) || null,
                    text: input.value
                }))
                .filter(q => q.text.trim() !== '');

            const questionSetData = {
                name,
                is_active: true,
                questions
            };

            await apiService.updateQuestionSet(setId, questionSetData);
            await this.loadQuestionSets();
            this.closeModal('editSetModal');
            this.showNotification('Набор успешно обновлен!');
        } catch (error) {
            console.error('Error updating question set:', error);
            this.showNotification('Ошибка при обновлении набора', 'error');
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
        this.element.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Управление наборами вопросов</h2>
                    <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                            onclick="document.getElementById('createSetModal').classList.remove('hidden')">
                        Создать новый набор
                    </button>
                </div>

                <div class="space-y-4">
                    ${this.questionSets.map(set => `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-semibold">${set.name}</h3>
                                    <p class="text-sm text-gray-600">
                                        ${set.questions.length} вопросов
                                    </p>
                    </div>
                                <div class="flex space-x-2">
                                    <button class="text-blue-600 hover:text-blue-800"
                                            onclick="this.editSet(${set.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                                    <button class="text-red-600 hover:text-red-800"
                                            onclick="this.deleteSet(${set.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                            </div>
                            <div class="space-y-2">
                                ${set.questions.map(question => `
                                    <div class="text-gray-700">${question.text}</div>
                                `).join('')}
                            </div>
                    </div>
                    `).join('')}
                </div>
                    </div>
                `;
    }

    show() {
        this.element.classList.add('active');
    }

    hide() {
        this.element.classList.remove('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
} 