import { ComponentLoader } from '../utils/componentLoader.js';

export class SetsManager {
    constructor(app) {
        this.app = app;
        this.element = null;
        this.editSetModal = null;
        this.editingSetName = null;
        this._eventListenersAdded = false; // Флаг для отслеживания добавления обработчиков

        // Элементы модального окна создания набора
        this.createSetModal = null;
        this.createSetBtn = null;
        this.cancelCreateSetBtn = null;
        this.saveNewSetBtn = null;
        this.newSetNameInput = null;
        this.newSetQuestionsContainer = null;
        this.addQuestionBtn = null;

        // Элементы модального окна редактирования набора
        this.editSetNameInput = null;
        this.editSetQuestionsContainer = null;
        this.saveEditSetBtn = null;
        this.cancelEditSetBtn = null;
        this.addEditQuestionBtn = null;
    }

    init() {
        // Инициализация не требует доступа к DOM
    }

    async show() {
        console.log('SetsManager show started');

        // Если элемент еще не загружен, загружаем его
        if (!this.element) {
             console.log('Loading sets-screen.html...');
             const setsHtml = await ComponentLoader.loadComponent('src/html/components/sets-screen.html'); // Теперь вызываем статический метод напрямую
             if (setsHtml) {
                 document.querySelector('.max-w-lg').insertAdjacentHTML('beforeend', setsHtml);
            this.element = document.getElementById('setsScreen');
                 console.log('SetsScreen HTML loaded and inserted.', this.element);
             } else {
                 console.error('Failed to load sets-screen.html');
                 return; // Не можем продолжить без элемента
            }
        }

        if (this.element) {
            console.log('SetsManager element found:', this.element);

            // Получаем ссылки на элементы модальных окон и списка наборов
            // Модальные окна находятся в document, не внутри setsScreen
            // Их элементы будем получать непосредственно перед использованием

             // Инициализация обработчиков событий для кнопок модальных окон (если еще не добавлены)
             // Теперь это делается после того, как элемент экрана доступен
             this.initModalEventListeners();

            // Пытаемся получить mySetsListElement. Оборачиваем в setTimeout для надежности после insertAdjacentHTML
            // Используем 0ms задержку, чтобы дать браузеру время распарсить DOM
            setTimeout(() => {
                const mySetsListElement = this.element.querySelector('#mySetsList'); // Ищем mySetsList
                if (mySetsListElement) {
                    console.log('My sets list element found after setTimeout.', mySetsListElement);
                    this.renderSets(mySetsListElement); // Рендерим в mySetsListElement
                } else {
                    console.error('My sets list element still not found after setTimeout!', this.element);
                     // Возможно, здесь стоит добавить логику повторных попыток или сообщение пользователю
                }
            }, 0); // Минимальная задержка для парсинга DOM

            this.element.classList.add('active');
            console.log('SetsManager element class added: active');

        } else {
            // Этот else блок теперь, по идее, не должен выполняться, если загрузка прошла успешно
            console.error('SetsManager element is null in show() after load attempt');
        }
        console.log('SetsManager show finished (initial check)');
    }

     // Метод для инициализации обработчиков событий модальных окон (вызывается один раз)
    initModalEventListeners() {
         if (this._eventListenersAdded) return;

         // Элементы создания набора (получаем из document)
         const createSetBtn = document.querySelector('#createSetBtn');
         const cancelCreateSetBtn = document.querySelector('#cancelCreateSetBtn');
         const saveNewSetBtn = document.querySelector('#saveNewSetBtn');
         // newSetNameInput и newSetQuestionsContainer находятся внутри модалки, получаем при открытии
         const addQuestionBtn = document.querySelector('#addQuestionBtn');

         // Элементы редактирования набора (получаем из document)
         // editSetNameInput, editSetQuestionsContainer, saveEditSetBtn, cancelEditSetBtn, addEditQuestionBtn
         // находятся внутри модалки, получаем при открытии
         const saveEditSetBtn = document.querySelector('#saveEditSetBtn');
         const cancelEditSetBtn = document.querySelector('#cancelEditSetBtn');
         const addEditQuestionBtn = document.querySelector('#addEditQuestionBtn');

         // Получаем сами модальные окна из document
         this.createSetModal = document.querySelector('#createSetModal');
         this.editSetModal = document.querySelector('#editSetModal');


         createSetBtn?.addEventListener('click', () => this.openCreateSetModal());
         cancelCreateSetBtn?.addEventListener('click', () => this.closeCreateSetModal());
         saveNewSetBtn?.addEventListener('click', () => this.saveNewSet());
         addQuestionBtn?.addEventListener('click', () => this.addQuestionInput(document.querySelector('#newSetQuestions'))); // Передаем контейнер из document

         saveEditSetBtn?.addEventListener('click', () => this.saveEditSet());
         cancelEditSetBtn?.addEventListener('click', () => this.closeEditSetModal());
         addEditQuestionBtn?.addEventListener('click', () => this.addQuestionInput(document.querySelector('#editSetQuestions'))); // Передаем контейнер из document

         this._eventListenersAdded = true;
         console.log('Modal event listeners added.');
    }

    hide() {
        console.log('SetsManager hide started');
        if (this.element) {
            this.element.classList.remove('active');
            console.log('SetsManager element class removed: active');
        } else {
            console.error('SetsManager element is null in hide()');
        }
        console.log('SetsManager hide finished');
    }

    renderSets(mySetsListElement) {
        console.log('renderSets called with mySetsListElement:', mySetsListElement);
        if (!mySetsListElement) {
            console.error('My sets list element not provided to renderSets!');
            return;
        }

        const sets = this.app.dataService.getAllSets();
        console.log('Rendering sets:', sets);
        mySetsListElement.innerHTML = '';

        const activeSets = this.app.dataService.getActiveSets();

        sets.forEach(setName => {
            const questions = this.app.dataService.getQuestionsForSet(setName);
            console.log(`Rendering set: ${setName}`, questions);
            const setElement = document.createElement('div');
            const isActive = activeSets.includes(setName);

            // Разделяем вопросы на видимые и скрытые
            const visibleQuestions = questions.slice(0, 5);
            const hiddenQuestions = questions.slice(5);
            const hasHiddenQuestions = hiddenQuestions.length > 0;

            setElement.className = `set-item p-4 border rounded-lg mb-4 ${isActive ? 'bg-green-100 border-green-500' : ''}`;
            setElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">${setName}</h3>
                    <div class="flex gap-2">
                        <button class="toggle-active-btn px-2 py-1 rounded ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300 hover:bg-gray-400'}" data-set="${setName}" title="${isActive ? 'Отключить' : 'Включить'}">
                            <i class="fas ${isActive ? 'fa-check-square' : 'fa-square'}"></i>
                        </button>
                        <button class="edit-set-btn px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-set="${setName}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-set-btn px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" data-set="${setName}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-2">
                    <p class="text-sm text-gray-600">Количество вопросов: ${questions.length}</p>
                    <div class="mt-2 text-sm text-gray-500 max-h-[150px] overflow-y-auto">
                        ${visibleQuestions.map(q => `<div class="py-1">• ${q}</div>`).join('')}
                        ${hasHiddenQuestions ? `
                            <div class="py-1 text-blue-500 cursor-pointer show-more-btn" data-set="${setName}">
                                Показать еще ${hiddenQuestions.length} вопросов...
                            </div>
                            <div class="hidden additional-questions">
                                ${hiddenQuestions.map(q => `<div class="py-1">• ${q}</div>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Добавляем обработчики событий для кнопок
            setElement.querySelector('.toggle-active-btn')?.addEventListener('click', () => {
                this.toggleSetActivity(setName);
            });

            setElement.querySelector('.edit-set-btn')?.addEventListener('click', () => {
                this.openEditSetModal(setName);
            });

            setElement.querySelector('.delete-set-btn')?.addEventListener('click', () => {
                if (confirm(`Вы уверены, что хотите удалить набор "${setName}"?`)) {
                    this.deleteSet(setName);
                }
            });

            // Добавляем обработчик для кнопки "Показать еще"
            const showMoreBtn = setElement.querySelector('.show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.addEventListener('click', () => {
                    const additionalQuestions = setElement.querySelector('.additional-questions');
                    if (additionalQuestions) {
                        additionalQuestions.classList.toggle('hidden');
                        showMoreBtn.textContent = additionalQuestions.classList.contains('hidden') 
                            ? `Показать еще ${hiddenQuestions.length} вопросов...`
                            : 'Скрыть вопросы';
                    }
                });
            }

            mySetsListElement.appendChild(setElement);
        });
        console.log('renderSets finished.');
    }

    // Метод для переключения состояния активности набора
    toggleSetActivity(setName) {
        console.log(`Toggling activity for set: ${setName}`);
        const success = this.app.dataService.toggleSetActivity(setName);
         // Перерисовываем список после изменения активности, только если изменение успешно
         if (success) {
             const mySetsListElement = this.element.querySelector('#mySetsList');
             if (mySetsListElement) this.renderSets(mySetsListElement);
         }
    }

    saveNewSet() {
        console.log('saveNewSet called');
        if (this.newSetNameInput && this.newSetQuestionsContainer) {
            const setName = this.newSetNameInput.value.trim();
            const questionInputs = this.newSetQuestionsContainer.querySelectorAll('.question-input');
            const questions = Array.from(questionInputs)
                .map(input => input.value.trim())
                .filter(question => question !== '');

            console.log('New set data:', { setName, questions });

            if (!setName) {
                alert('Пожалуйста, введите название набора.');
                return;
            }

            if (questions.length === 0) {
                alert('Пожалуйста, добавьте хотя бы один вопрос в набор.');
                return;
            }

            if (this.app.dataService.createSet(setName, questions)) {
                this.closeCreateSetModal();
                const mySetsListElement = this.element.querySelector('#mySetsList');
                if (mySetsListElement) {
                    this.renderSets(mySetsListElement);
                    console.log('Sets list updated after creating new set');
                } else {
                    console.error('mySetsList not found after saving new set!');
                }
            } else {
                alert('Набор с таким названием уже существует.');
            }
        } else {
            console.error('Required elements not found for saving new set');
        }
    }

    saveEditSet() {
        console.log('saveEditSet called');
        if (this.editSetNameInput && this.editSetQuestionsContainer && this.editingSetName) {
            const oldName = this.editingSetName;
            const newName = this.editSetNameInput.value.trim();
            const questionInputs = this.editSetQuestionsContainer.querySelectorAll('.question-input');
            const questions = Array.from(questionInputs)
                .map(input => input.value.trim())
                .filter(question => question !== '');

            console.log('Edit set data:', { oldName, newName, questions });

            if (!newName) {
                alert('Пожалуйста, введите новое название набора.');
                return;
            }

            if (questions.length === 0) {
                alert('Пожалуйста, добавьте хотя бы один вопрос в набор.');
                return;
            }

            if (this.app.dataService.editSet(oldName, newName, questions)) {
                this.closeEditSetModal();
                const mySetsListElement = this.element.querySelector('#mySetsList');
                if (mySetsListElement) {
                    this.renderSets(mySetsListElement);
                    console.log('Sets list updated after editing set');
                } else {
                    console.error('mySetsList not found after saving edit set!');
                }
            } else {
                alert(`Набор с названием "${newName}" уже существует.`);
            }
        } else {
            console.error('Required elements not found for saving edit set');
        }
    }

    deleteSet(setName) {
        console.log('deleteSet called');
        if (this.app.dataService.deleteSet(setName)) {
              // Получаем актуальный setsList перед рендерингом после удаления
             const mySetsListElement = this.element.querySelector('#mySetsList');
             if (mySetsListElement) this.renderSets(mySetsListElement);
             else console.error('mySetsList not found after deleting set!');
        } else {
            alert('Не удалось удалить набор.');
        }
    }

    openCreateSetModal() {
        console.log('openCreateSetModal started');
        const createSetModal = document.querySelector('#createSetModal');
        this.newSetNameInput = document.querySelector('#newSetName');
        this.newSetQuestionsContainer = document.querySelector('#newSetQuestions');

        if (createSetModal) {
            createSetModal.classList.remove('hidden');
            console.log('createSetModal class removed: hidden');
            
            // Очистка полей модального окна при открытии
            if (this.newSetNameInput) this.newSetNameInput.value = '';
            if (this.newSetQuestionsContainer) {
                this.newSetQuestionsContainer.innerHTML = `
                    <div class="question-input-container flex gap-2">
                        <input type="text" class="w-full p-3 border rounded-lg question-input" placeholder="Вопрос #1">
                        <button class="delete-question-btn p-3 text-red-500 hover:text-red-700" title="Удалить вопрос">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="question-input-container flex gap-2">
                        <input type="text" class="w-full p-3 border rounded-lg question-input" placeholder="Вопрос #2">
                        <button class="delete-question-btn p-3 text-red-500 hover:text-red-700" title="Удалить вопрос">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                // Добавляем обработчики для кнопок удаления
                this.newSetQuestionsContainer.querySelectorAll('.delete-question-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.closest('.question-input-container').remove();
                        this.updateQuestionNumbers(this.newSetQuestionsContainer);
                    });
                });
            }
        } else {
            console.error('createSetModal element is null in openCreateSetModal()');
        }
        console.log('openCreateSetModal finished');
    }

    closeCreateSetModal() {
        console.log('closeCreateSetModal started');
         // Получаем актуальную ссылку на модальное окно перед использованием из document
        const createSetModal = document.querySelector('#createSetModal');
        if (createSetModal) {
            createSetModal.classList.add('hidden');
            console.log('createSetModal class added: hidden');
        } else {
            console.error('createSetModal element is null in closeCreateSetModal()');
        }
        console.log('closeCreateSetModal finished');
    }

    openEditSetModal(setName) {
        console.log('openEditSetModal started for set:', setName);
        const editSetModal = document.querySelector('#editSetModal');
        this.editSetNameInput = document.querySelector('#editSetName');
        this.editSetQuestionsContainer = document.querySelector('#editSetQuestions');

        if (editSetModal) {
            this.editingSetName = setName;
            const questions = this.app.dataService.getQuestionsForSet(setName);
            console.log('Questions for set:', questions);

            if (this.editSetNameInput) this.editSetNameInput.value = setName;
            if (this.editSetQuestionsContainer) {
                this.editSetQuestionsContainer.innerHTML = questions
                    .map((q, i) => `
                        <div class="question-input-container flex gap-2">
                            <input type="text" class="w-full p-3 border rounded-lg question-input" 
                                   placeholder="Вопрос #${i + 1}" value="${q}">
                            <button class="delete-question-btn p-3 text-red-500 hover:text-red-700" title="Удалить вопрос">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('');
                
                // Добавляем обработчики для кнопок удаления
                this.editSetQuestionsContainer.querySelectorAll('.delete-question-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.closest('.question-input-container').remove();
                        this.updateQuestionNumbers(this.editSetQuestionsContainer);
                    });
                });
            }

            editSetModal.classList.remove('hidden');
            console.log('editSetModal class removed: hidden');
        } else {
            console.error('editSetModal element is null in openEditSetModal()');
        }
        console.log('openEditSetModal finished');
    }

    closeEditSetModal() {
        console.log('closeEditSetModal started');
         // Получаем актуальную ссылку на модальное окно перед использованием из document
        const editSetModal = document.querySelector('#editSetModal');
        if (editSetModal) {
            editSetModal.classList.add('hidden');
            console.log('editSetModal class added: hidden');
            this.editingSetName = null;
        } else {
             console.error('editSetModal element is null in closeEditSetModal()');
        }
        console.log('closeEditSetModal finished');
    }

    addQuestionInput(container) {
        console.log('addQuestionInput called', container);
        if (container) {
            const questionInputs = container.querySelectorAll('.question-input');
            const nextQuestionNumber = questionInputs.length + 1;
            
            // Создаем контейнер для вопроса и кнопки удаления
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-input-container flex gap-2';
            
            // Создаем поле ввода
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.classList.add('w-full', 'p-3', 'border', 'rounded-lg', 'question-input');
            newInput.placeholder = `Вопрос #${nextQuestionNumber}`;
            
            // Создаем кнопку удаления
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-question-btn p-3 text-red-500 hover:text-red-700';
            deleteButton.title = 'Удалить вопрос';
            deleteButton.innerHTML = '<i class="fas fa-times"></i>';
            
            // Добавляем обработчик для кнопки удаления
            deleteButton.addEventListener('click', () => {
                questionContainer.remove();
                this.updateQuestionNumbers(container);
            });
            
            // Добавляем элементы в контейнер
            questionContainer.appendChild(newInput);
            questionContainer.appendChild(deleteButton);
            container.appendChild(questionContainer);
            
            console.log(`Added input for Question #${nextQuestionNumber}`);
        } else {
            console.error('Question input container is null in addQuestionInput()');
        }
    }

    // Метод для обновления номеров вопросов
    updateQuestionNumbers(container) {
        const questionInputs = container.querySelectorAll('.question-input');
        questionInputs.forEach((input, index) => {
            input.placeholder = `Вопрос #${index + 1}`;
        });
    }
} 