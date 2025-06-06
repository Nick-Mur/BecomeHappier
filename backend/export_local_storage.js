// Скрипт для экспорта данных из localStorage
const data = {
    userSets: JSON.parse(localStorage.getItem('userSets') || '{}'),
    activeMoodSets: JSON.parse(localStorage.getItem('activeMoodSets') || '[]'),
    moodAnswers: JSON.parse(localStorage.getItem('moodAnswers') || '{}')
};

// Создаем элемент для скачивания файла
const element = document.createElement('a');
element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
element.setAttribute('download', 'local_storage_data.json');

// Скрываем элемент
element.style.display = 'none';

// Добавляем элемент на страницу
document.body.appendChild(element);

// Эмулируем клик
element.click();

// Удаляем элемент
document.body.removeChild(element); 