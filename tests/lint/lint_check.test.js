// Тест на отсутствие ошибок линтера для MainScreen.js и SetsManager.js
// Используется ESLint

const { ESLint } = require('eslint');

describe('Lint check', () => {
  it('MainScreen.js и SetsManager.js не содержат ошибок линтера', async () => {
    const eslint = new ESLint();
    const results = await eslint.lintFiles([
      'src/js/components/MainScreen.js',
      'src/js/components/SetsManager.js',
    ]);
    for (const result of results) {
      expect(result.errorCount).toBe(0);
      expect(result.warningCount).toBe(0);
    }
  });
}); 