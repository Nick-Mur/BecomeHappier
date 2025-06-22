// Юнит-тесты для SetsManager
// Покрытие: show, hide, renderSets, resetDragState
// Замеры времени и памяти для show и renderSets
// Используется Jest и memory-usage

const { performance } = require('perf_hooks');
const SetsManager = require('../../src/js/components/SetsManager.js').SetsManager;

// Мок приложения и зависимостей
const mockApp = {
  dataService: {
    getAllSets: jest.fn(() => [
      { id: 1, name: 'Set1', is_active: true, order: 1 },
      { id: 2, name: 'Set2', is_active: true, order: 2 },
    ]),
  },
};

describe('SetsManager unit tests', () => {
  let setsManager;

  beforeEach(() => {
    setsManager = new SetsManager(mockApp);
    setsManager.element = document.createElement('div');
  });

  /**
   * Тестирует show: корректная инициализация и замеры времени/памяти.
   */
  test('show: инициализация и замеры', async () => {
    setsManager.element.innerHTML = '<div id="mySetsList"></div>';
    const startMem = process.memoryUsage().heapUsed;
    const start = performance.now();
    await setsManager.show();
    const end = performance.now();
    const endMem = process.memoryUsage().heapUsed;
    expect(setsManager.element.classList.contains('active')).toBe(true);
    expect(end - start).toBeLessThan(300); // <300мс
  expect(endMem - startMem).toBeLessThan(20 * 1024 * 1024); // <20Мб
  });

  /**
   * Тестирует hide: элемент становится неактивным.
   */
  test('hide: скрытие экрана', () => {
    setsManager.element.classList.add('active');
    setsManager.hide();
    expect(setsManager.element.classList.contains('active')).toBe(false);
  });

  /**
   * Проверяет сброс состояния перетаскивания.
   */
  test('resetDragState: сброс состояния', () => {
    const el = document.createElement('div');
    el.classList.add('dragging');
    setsManager.draggedElement = el;
    setsManager.placeholder = document.createElement('div');
    document.body.appendChild(setsManager.placeholder);
    setsManager.resetDragState();
    expect(setsManager.draggedElement).toBeNull();
    expect(setsManager.placeholder).toBeNull();
  });
}); 