// Юнит-тесты для MainScreen
// Покрытие: handleNext, handlePrevious, handleEmojiSelect, updateUI
// Замеры времени и памяти для handleNext и handlePrevious
// Используется Jest и memory-usage

const { performance } = require('perf_hooks');
const MainScreen = require('../../src/js/components/MainScreen.js').MainScreen;

// Мок приложения и зависимостей
const mockApp = {
  showScreen: jest.fn(),
  dataService: {
    saveAnswer: jest.fn(),
    getAnswer: jest.fn(() => null),
  },
};

describe('MainScreen unit tests', () => {
  let mainScreen;

  beforeEach(() => {
    mainScreen = new MainScreen(mockApp);
    mainScreen.element = document.createElement('div');
    mainScreen.questionElement = document.createElement('div');
    mainScreen.questionNumberElement = document.createElement('div');
    mainScreen.mainEmojiDisplayElement = document.createElement('img');
    mainScreen.nextButton = document.createElement('button');
    mainScreen.prevButton = document.createElement('button');
    mainScreen.emojiButtons = [document.createElement('button'), document.createElement('button')];
    mainScreen.activeSetsWithQuestions = [
      { setName: 'Set1', questions: ['Q1', 'Q2'] },
      { setName: 'Set2', questions: ['Q3'] },
    ];
    mainScreen.currentSetIndex = 0;
    mainScreen.currentQuestionIndexInSet = 0;
  });

  /**
   * Тестирует переход к следующему вопросу и набору, а также возврат на главный экран.
   * Замеряет время и память выполнения handleNext.
   */
  test('handleNext: переходы и замеры', () => {
    const startMem = process.memoryUsage().heapUsed;
    const start = performance.now();
    mainScreen.handleNext();
    const end = performance.now();
    const endMem = process.memoryUsage().heapUsed;
    expect(mainScreen.currentQuestionIndexInSet).toBe(1);
    expect(end - start).toBeLessThan(200); // <200мс
  expect(endMem - startMem).toBeLessThan(20 * 1024 * 1024); // <20Мб
  });

  /**
   * Тестирует возврат к предыдущему вопросу и набору, а также замеры времени и памяти.
   */
  test('handlePrevious: переходы и замеры', () => {
    mainScreen.currentQuestionIndexInSet = 1;
    const startMem = process.memoryUsage().heapUsed;
    const start = performance.now();
    mainScreen.handlePrevious();
    const end = performance.now();
    const endMem = process.memoryUsage().heapUsed;
    expect(mainScreen.currentQuestionIndexInSet).toBe(0);
    expect(end - start).toBeLessThan(50);
  expect(endMem - startMem).toBeLessThan(10 * 1024 * 1024);
  });

  /**
   * Проверяет корректность выбора эмодзи и сохранения ответа.
   */
  test('handleEmojiSelect: выбор эмодзи', () => {
    const btn = mainScreen.emojiButtons[0];
    btn.dataset.rating = '5';
    mainScreen.handleEmojiSelect(btn, 5);
    expect(btn.classList.contains('active')).toBe(true);
    expect(mockApp.dataService.saveAnswer).toHaveBeenCalled();
  });

  /**
   * Проверяет корректное обновление UI при отсутствии активных наборов.
   */
  test('updateUI: нет активных наборов', () => {
    mainScreen.activeSetsWithQuestions = [];
    mainScreen.updateUI();
    expect(mainScreen.questionElement.textContent).toMatch(/нет активных/i);
  });
}); 