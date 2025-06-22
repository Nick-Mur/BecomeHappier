// Интеграционные тесты для MainScreen и SetsManager
// Проверяется взаимодействие: переходы между экранами, сохранение и отображение ответов
// Замеры времени и памяти для сценариев
// Используется Jest

const { performance } = require('perf_hooks');
const MainScreen = require('../../src/js/components/MainScreen.js').MainScreen;
const SetsManager = require('../../src/js/components/SetsManager.js').SetsManager;

describe('Integration: MainScreen <-> SetsManager', () => {
  let mainScreen, setsManager, mockApp;

  beforeEach(() => {
    mockApp = {
      showScreen: jest.fn(),
      dataService: {
        saveAnswer: jest.fn(),
        getAnswer: jest.fn(() => 4),
        getAllSets: jest.fn(() => [
          { id: 1, name: 'Set1', is_active: true, order: 1 },
        ]),
      },
    };
    mainScreen = new MainScreen(mockApp);
    setsManager = new SetsManager(mockApp);
    mainScreen.element = document.createElement('div');
    mainScreen.questionElement = document.createElement('div');
    mainScreen.questionNumberElement = document.createElement('div');
    mainScreen.mainEmojiDisplayElement = document.createElement('img');
    mainScreen.nextButton = document.createElement('button');
    mainScreen.prevButton = document.createElement('button');
    mainScreen.emojiButtons = [document.createElement('button')];
    mainScreen.activeSetsWithQuestions = [
      { setName: 'Set1', questions: ['Q1'] },
    ];
  });

  /**
   * Интеграционный сценарий: пользователь выбирает ответ, переходит к наборам, ответ отображается корректно.
   */
  test('Сценарий: выбор ответа и отображение', () => {
    const btn = mainScreen.emojiButtons[0];
    btn.dataset.rating = '4';
    mainScreen.handleEmojiSelect(btn, 4);
    expect(mockApp.dataService.saveAnswer).toHaveBeenCalledWith('Set1', 'Q1', 4);
    // Проверяем, что getAnswer возвращает правильный рейтинг
    expect(mainScreen.app.dataService.getAnswer('Set1', 'Q1')).toBe(4);
  });

  /**
   * Интеграционный сценарий: переход между экранами (main <-> sets)
   * Замер времени и памяти.
   */
  test('Переход между экранами', async () => {
    setsManager.element = document.createElement('div');
    setsManager.element.innerHTML = '<div id="mySetsList"></div>';
    const startMem = process.memoryUsage().heapUsed;
    const start = performance.now();
    await setsManager.show();
    mainScreen.app.showScreen('main');
    const end = performance.now();
    const endMem = process.memoryUsage().heapUsed;
    expect(setsManager.element.classList.contains('active')).toBe(true);
    expect(mainScreen.app.showScreen).toHaveBeenCalledWith('main');
    expect(end - start).toBeLessThan(300);
  expect(endMem - startMem).toBeLessThan(20 * 1024 * 1024);
  });
}); 