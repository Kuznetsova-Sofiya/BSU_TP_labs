// Посмотреть все сохраненные данные
console.log('Все услуги:', localStorage.getItem('eventServices'));
console.log('Все меню:', localStorage.getItem('eventMenu'));
console.log('Сортировка:', localStorage.getItem('eventSortPreference'));

// Посмотреть в формате JSON
console.log('Услуги:', JSON.parse(localStorage.getItem('eventServices')));
console.log('Меню:', JSON.parse(localStorage.getItem('eventMenu')));