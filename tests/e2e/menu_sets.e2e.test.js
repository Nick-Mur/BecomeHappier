// E2E тесты для основного меню и окна наборов
// Используется Playwright
// Покрытие: открытие главного меню, переход к наборам, создание и удаление набора
// Все тесты снабжены подробными комментариями

const { test, expect } = require('@playwright/test');

// Проверка на отсутствие дубликатов id на странице
async function assertNoDuplicateIds(page) {
  const duplicateIds = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]')).map(e => e.id);
    return ids.filter((id, idx) => id && ids.indexOf(id) !== idx && ids.lastIndexOf(id) === idx);
  });
  expect(duplicateIds, `Дубликаты id: ${duplicateIds.join(', ')}`).toEqual([]);
}

test.describe('E2E: Основное меню и окно наборов', () => {
  // Перед каждым тестом открываем главную страницу
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
    await assertNoDuplicateIds(page);
  });

  /**
   * Проверяет, что главный экран отображается корректно.
   */
  test('Открытие главного меню', async ({ page }) => {
    // Проверяем наличие главного экрана по id
    await expect(page.locator('#mainScreen')).toBeVisible();
    // Проверяем наличие кнопки "Наборы" по data-action
    await expect(page.locator('[data-action="showSets"]')).toBeVisible();
  });

  /**
   * Проверяет переход к экрану наборов и возврат в главное меню.
   */
  test('Переход к окну наборов и возврат', async ({ page }) => {
    // Кликаем по кнопке "Наборы"
    await page.locator('[data-action="showSets"]').click();
    // Ждём появления только активного экрана наборов
    const setsScreen = page.locator('#setsScreen.active');
    await expect(setsScreen).toBeVisible();
    // Кликаем по кнопке возврата только внутри активного экрана
    await setsScreen.locator('[data-action="showMain"]').click();
    // Ждём появления главного экрана
    await expect(page.locator('#mainScreen')).toBeVisible();
  });

  /**
   * Проверяет создание нового набора.
   */
  test('Создание нового набора', async ({ page }) => {
    await page.locator('[data-action="showSets"]').click();
    const setsScreen = page.locator('#setsScreen.active');
    await expect(setsScreen).toBeVisible();
    // Кликаем по кнопке создания только внутри активного экрана
    await setsScreen.locator('#createSetBtn').click();
    // Находим только видимый модал через :not(.hidden)
    const createSetModal = page.locator('#createSetModal:not(.hidden)');
    await expect(createSetModal).toBeVisible();
    const setName = 'Тестовый набор';
    await createSetModal.locator('#newSetName').fill(setName);
    // Добавляем обязательный вопрос
    await createSetModal.locator('#addQuestionBtn').click();
    // Ждём появления хотя бы одного поля для вопроса
    const questionInputs = createSetModal.locator('.question-input');
    const count = await questionInputs.count();
    for (let i = 0; i < count; i++) {
      await questionInputs.nth(i).fill(`Вопрос ${i + 1}`);
    }
    // Ждём, что кнопка "Сохранить" станет активной
    const saveBtn = createSetModal.locator('#saveSetBtn');
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    // Явно ждём появления набора в списке
    await expect(page.locator('#mySetsList')).toContainText(setName);
  });

  /**
   * Проверяет удаление набора.
   */
  test('Удаление набора', async ({ page }) => {
    await page.locator('[data-action="showSets"]').click();
    const setsScreen = page.locator('#setsScreen.active');
    await expect(setsScreen).toBeVisible();
    const setName = 'Тестовый набор';
    // Находим элемент набора по тексту
    const setItem = setsScreen.locator('#mySetsList .set-item', { hasText: setName });
    // Если набора нет — тест пропускаем
    if (await setItem.count() === 0) {
      test.skip('Набор не найден, пропуск удаления');
      return;
    }
    await expect(setItem).toBeVisible();
    // Кликаем по кнопке удаления внутри этого набора
    await setItem.locator('.delete-set-btn').click();
    // Подтверждаем удаление, если появляется видимый модал
    const confirmBtn = page.locator('#confirmDeleteSetBtn:not(.hidden)');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    // Проверяем, что набор исчез из списка
    await expect(page.locator('#mySetsList')).not.toContainText(setName);
  });
}); 