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

        // Переменные для отслеживания перетаскивания (общие для десктопа и мобайла)
        this.draggedElement = null;
        this.placeholder = null;
        this.currentContainer = null; // Добавляем для отслеживания контейнера списка
        this.isDragging = false; // Флаг, чтобы отличать перетаскивание от клика/тапа

        // Переменные для мобильного перетаскивания
        this.initialTouchY = 0;
        this.initialTouchX = 0;
        this.initialElementTop = 0; // Начальная верхняя позиция элемента при таче
        this.initialElementLeft = 0; // Начальная левая позиция элемента при таче
        this.DRAG_THRESHOLD_PX = 5; // Порог в пикселях для начала перетаскивания по касанию (уменьшен)
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

             // Инициализация обработчиков событий модальных окон (если еще не добавлены)
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

    // --- Вспомогательная функция для сброса состояния перетаскивания ---
    resetDragState() {
        console.log('Resetting drag state.');
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging', 'touch-dragging');
            this.draggedElement.style.position = '';
            this.draggedElement.style.zIndex = '';
            this.draggedElement.style.width = '';
            this.draggedElement.style.top = '';
            this.draggedElement.style.left = '';
        }
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
        this.draggedElement = null;
        this.placeholder = null;
        this.currentContainer = null;
        this.isDragging = false;
        this.initialTouchY = 0;
        this.initialTouchX = 0;
        this.initialElementTop = 0;
        this.initialElementLeft = 0;
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

        sets.forEach((setName, index) => {
            const questions = this.app.dataService.getQuestionsForSet(setName);
            console.log(`Rendering set: ${setName}`, questions);
            const setElement = document.createElement('div');
            const isActive = activeSets.includes(setName);

            // Разделяем вопросы на видимые и скрытые
            const visibleQuestions = questions.slice(0, 5);
            const hiddenQuestions = questions.slice(5);
            const hasHiddenQuestions = hiddenQuestions.length > 0;

            setElement.className = `set-item p-4 border rounded-lg mb-4 ${isActive ? 'bg-green-100 border-green-500' : ''}`;
            setElement.draggable = true;
            setElement.dataset.setName = setName;
            setElement.dataset.index = index;

            setElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-grip-vertical text-gray-400 cursor-move drag-handle touch-none"></i>
                        <h3 class="text-lg font-semibold">${setName}</h3>
                    </div>
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

            // --- Обработчики событий для каждого setElement ---

            // Обработчики для десктопной версии (Drag and Drop API)
            setElement.addEventListener('dragstart', (e) => {
                console.log('Dragstart:', setName);
                this.draggedElement = setElement;
                this.currentContainer = mySetsListElement;
                this.isDragging = true;
                e.dataTransfer.setData('text/plain', setName);
                setElement.classList.add('dragging');
            });

            setElement.addEventListener('dragend', () => {
                console.log('Dragend:', setName);
                this.resetDragState();
            });

            // Обработчик touchstart для мобильной версии
            setElement.addEventListener('touchstart', (e) => {
                const dragHandle = e.target.closest('.drag-handle');
                if (!dragHandle) return;

                console.log('Touchstart on drag handle:', setName);
                this.draggedElement = setElement;
                this.currentContainer = mySetsListElement;
                this.isDragging = false;

                const touch = e.touches[0];
                this.initialTouchY = touch.clientY;
                this.initialTouchX = touch.clientX;
                this.initialElementTop = setElement.getBoundingClientRect().top;
                this.initialElementLeft = setElement.getBoundingClientRect().left;
            });

            setElement.addEventListener('touchmove', (e) => {
                if (!this.draggedElement || this.currentContainer !== mySetsListElement) return;

                const touch = e.touches[0];
                const currentY = touch.clientY;
                const currentX = touch.clientX;

                if (!this.isDragging) {
                    const deltaY = Math.abs(currentY - this.initialTouchY);
                    const deltaX = Math.abs(currentX - this.initialTouchX);

                    if (deltaY > this.DRAG_THRESHOLD_PX || deltaX > this.DRAG_THRESHOLD_PX) {
                        console.log('Starting mobile drag for:', setName);
                        this.isDragging = true;

                        this.placeholder = document.createElement('div');
                        this.placeholder.className = 'set-item p-4 border rounded-lg mb-4 bg-gray-100 border-dashed border-2';
                        this.placeholder.style.height = `${this.draggedElement.offsetHeight}px`;
                        this.draggedElement.parentNode.insertBefore(this.placeholder, this.draggedElement);

                        this.draggedElement.classList.add('dragging', 'touch-dragging');
                        this.draggedElement.style.position = 'absolute';
                        this.draggedElement.style.zIndex = 1000;
                        this.draggedElement.style.width = `${this.draggedElement.offsetWidth}px`;
                        this.draggedElement.style.top = `${this.initialElementTop}px`;
                        this.draggedElement.style.left = `${this.initialElementLeft}px`;
                    }
                    return;
                }

                if (this.isDragging) {
                    const deltaMoveY = currentY - this.initialTouchY;
                    const deltaMoveX = currentX - this.initialTouchX;

                    this.draggedElement.style.top = `${this.initialElementTop + deltaMoveY}px`;
                    this.draggedElement.style.left = `${this.initialElementLeft + deltaMoveX}px`;

                    const draggedRect = this.draggedElement.getBoundingClientRect();
                    const draggedCenterY = draggedRect.top + draggedRect.height / 2;

                    const elements = Array.from(mySetsListElement.children);
                    let targetElement = null;

                    for (const el of elements) {
                        if (el !== this.draggedElement && el !== this.placeholder && el.classList.contains('set-item')) {
                            const rect = el.getBoundingClientRect();
                            if (draggedCenterY >= rect.top && draggedCenterY <= rect.bottom) {
                                targetElement = el;
                                break;
                            }
                        }
                    }

                    if (targetElement) {
                        const rect = targetElement.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;
                        if (draggedCenterY < midY) {
                            if (this.placeholder.previousSibling !== targetElement) {
                                targetElement.parentNode.insertBefore(this.placeholder, targetElement);
                            }
                        } else {
                            if (this.placeholder.nextSibling !== targetElement) {
                                targetElement.parentNode.insertBefore(this.placeholder, targetElement.nextSibling);
                            }
                        }
                    }
                }

                e.preventDefault();
            });

            setElement.addEventListener('touchend', () => {
                console.log('Touchend:', setName, 'isDragging:', this.isDragging);

                if (!this.isDragging || !this.draggedElement) {
                    this.resetDragState();
                    return;
                }

                if (this.draggedElement && this.placeholder && this.placeholder.parentNode) {
                    this.placeholder.parentNode.insertBefore(this.draggedElement, this.placeholder);
                }

                const currentElements = Array.from(mySetsListElement.children);
                const newOrder = currentElements
                    .filter(el => el.dataset && el.dataset.setName)
                    .map(el => el.dataset.setName);

                if (newOrder.length > 0) {
                    this.app.dataService.reorderSets(newOrder);
                }

                this.resetDragState();
            });

            setElement.addEventListener('touchcancel', () => {
                console.log('Touchcancel:', setName);
                this.resetDragState();
            });

            mySetsListElement.appendChild(setElement);
        });

        // --- Обработчики событий на контейнере списка (для десктопа и отлова drop/dragleave) ---

        // Обработчик drop для десктопа (на контейнере списка)
        mySetsListElement.addEventListener('drop', (e) => {
            e.preventDefault(); // Отменяем стандартное поведение браузера
            console.log('Drop on list container');

            if (!this.isDragging || !this.draggedElement || !this.placeholder || this.currentContainer !== mySetsListElement) {
                this.resetDragState();
                return;
            }

            if (this.draggedElement && this.placeholder && this.placeholder.parentNode) {
                this.placeholder.parentNode.insertBefore(this.draggedElement, this.placeholder);
            }

            const currentElements = Array.from(mySetsListElement.children);
            const newOrder = currentElements
                .filter(el => el.dataset && el.dataset.setName)
                .map(el => el.dataset.setName);

            if (newOrder.length > 0) {
                this.app.dataService.reorderSets(newOrder);
            }

            this.resetDragState();
        });

         // Обработчик dragover на контейнере для разрешения drop на нем, даже если нет setElement
        mySetsListElement.addEventListener('dragover', (e) => {
            e.preventDefault(); // Необходимо для разрешения drop на контейнере
            e.dataTransfer.dropEffect = 'move';

            // Убеждаемся, что это активное перетаскивание внутри нужного контейнера
            if (!this.isDragging || !this.draggedElement || this.currentContainer !== mySetsListElement) {
                return;
            }

            // Если плейсхолдер еще не создан (например, при десктопном старте), создаем его
            if (!this.placeholder) {
                this.placeholder = document.createElement('div');
                this.placeholder.className = 'set-item p-4 border rounded-lg mb-4 bg-gray-100 border-dashed border-2';
                this.placeholder.style.height = `${this.draggedElement.offsetHeight}px`;
                // Вставляем плейсхолдер временно, его позиция будет уточнена ниже
                mySetsListElement.appendChild(this.placeholder);
            }

            // Ищем место для вставки плейсхолдера
            const children = Array.from(mySetsListElement.children)
                .filter(el => el !== this.draggedElement && el !== this.placeholder && el.classList.contains('set-item'));

            if (children.length === 0) {
                // Если других элементов нет, убеждаемся, что плейсхолдер в списке
                 if (!this.placeholder.parentNode || this.placeholder.parentNode !== mySetsListElement) {
                    mySetsListElement.appendChild(this.placeholder);
                }
                return;
            }

            let inserted = false;
            for (const child of children) {
                const rect = child.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    // Вставляем перед текущим элементом, если курсор выше его середины
                    if (this.placeholder.previousSibling !== child) {
                        mySetsListElement.insertBefore(this.placeholder, child);
                    }
                    inserted = true;
                    break;
                }
            }

            // Если плейсхолдер не был вставлен (курсор ниже всех элементов), вставляем в конец
            if (!inserted && children.length > 0) {
                // Убеждаемся, что плейсхолдер не уже является последним элементом
                if (mySetsListElement.lastElementChild !== this.placeholder) {
                     mySetsListElement.appendChild(this.placeholder);
                }
            }
        });

         // Добавляем обработчик dragleave на контейнер для очистки, если элемент вытащили за пределы списка
         mySetsListElement.addEventListener('dragleave', (e) => {
             if (this.isDragging && this.draggedElement && this.currentContainer === mySetsListElement && 
                 !mySetsListElement.contains(e.relatedTarget) && 
                 e.relatedTarget !== this.draggedElement && 
                 e.relatedTarget !== this.placeholder) {
                 this.resetDragState();
             }
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
             else console.error('mySetsList not found after toggling set activity!');
         }
    }

    saveNewSet() {
        console.log('saveNewSet called');
        // Получаем актуальные ссылки на элементы модалки из document
        const newSetNameInput = document.querySelector('#newSetName');
        const newSetQuestionsContainer = document.querySelector('#newSetQuestions');

        if (newSetNameInput && newSetQuestionsContainer) {
            const setName = newSetNameInput.value.trim();
            const questionInputs = newSetQuestionsContainer.querySelectorAll('.question-input');
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
        // Получаем актуальные ссылки на элементы модалки из document
        const editSetNameInput = document.querySelector('#editSetName');
        const editSetQuestionsContainer = document.querySelector('#editSetQuestions');

        if (editSetNameInput && editSetQuestionsContainer && this.editingSetName) {
            const oldName = this.editingSetName;
            const newName = editSetNameInput.value.trim();
            const questionInputs = editSetQuestionsContainer.querySelectorAll('.question-input');
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
        const newSetNameInput = document.querySelector('#newSetName');
        const newSetQuestionsContainer = document.querySelector('#newSetQuestions');

        if (createSetModal) {
            createSetModal.classList.remove('hidden');
            console.log('createSetModal class removed: hidden');

            // Очистка полей модального окна при открытии
            if (newSetNameInput) newSetNameInput.value = '';
            if (newSetQuestionsContainer) {
                newSetQuestionsContainer.innerHTML = `
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
                newSetQuestionsContainer.querySelectorAll('.delete-question-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.closest('.question-input-container').remove();
                        this.updateQuestionNumbers(newSetQuestionsContainer);
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
        const editSetNameInput = document.querySelector('#editSetName');
        const editSetQuestionsContainer = document.querySelector('#editSetQuestions');

        if (editSetModal) {
            this.editingSetName = setName;
            const questions = this.app.dataService.getQuestionsForSet(setName);
            console.log('Questions for set:', questions);

            if (editSetNameInput) editSetNameInput.value = setName;
            if (editSetQuestionsContainer) {
                editSetQuestionsContainer.innerHTML = questions
                    .map((q, i) => `
                        <div class="question-input-container flex gap-2">
                            <input type="text" class="w-full p-3 border rounded-lg question-input"
                                   placeholder="Вопрос #${i + 1}" value="${q.replace(/"/g, '&quot;')}">
                            <button class="delete-question-btn p-3 text-red-500 hover:text-red-700" title="Удалить вопрос">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('');

                // Добавляем обработчики для кнопок удаления
                editSetQuestionsContainer.querySelectorAll('.delete-question-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.closest('.question-input-container').remove();
                        this.updateQuestionNumbers(editSetQuestionsContainer);
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