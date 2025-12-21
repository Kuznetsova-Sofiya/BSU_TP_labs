// Глобальные переменные
let currentPage = 1;
let currentEditingEventId = null;
let selectedMenu = {};
let totalMenuCost = 0;
let selectedServices = {};
let totalServicesCost = 0;

// Новые функции для управления LocalStorage

/**
 * Резервное копирование данных в файл
 */
function backupData() {
    eventCollection.exportToFile();
    eventView.showSuccess('Данные успешно экспортированы в файл!');
}

/**
 * Восстановление данных из файла
 */
function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (confirm('Текущие данные будут заменены. Продолжить?')) {
        eventCollection.importFromFile(file)
            .then(invalidEvents => {
                if (invalidEvents.length === 0) {
                    eventView.showSuccess('Данные успешно импортированы!');
                    eventView.displayEvents();
                } else {
                    eventView.showSuccess(`Импортировано с ошибками. ${invalidEvents.length} событий не добавлено.`);
                    eventView.displayEvents();
                }
                // Очищаем input файла
                event.target.value = '';
            })
            .catch(error => {
                eventView.showError(`Ошибка импорта: ${error.message}`);
                event.target.value = '';
            });
    }
}

/**
 * Очистить все данные
 */
function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить все мероприятия? Это действие нельзя отменить.')) {
        eventCollection.clear();
        eventView.displayEvents();
        eventView.showSuccess('Все данные удалены!');
    }
}

/**
 * Проверить размер хранилища
 */
function checkStorageSize() {
    const dataStr = JSON.stringify(eventCollection.getAllEvents());
    const size = new Blob([dataStr]).size;
    const sizeKB = (size / 1024).toFixed(2);
    
    eventView.showSuccess(`Размер данных: ${sizeKB} KB. Событий: ${eventCollection.getCount()}`);
}

/**
 * Добавить тестовые данные
 */
function addSampleData() {
    const sampleEvents = [
        {
            id: 'sample-' + Date.now(),
            title: 'Тестовое мероприятие',
            description: 'Это тестовое мероприятие для демонстрации работы системы',
            createdAt: new Date(),
            author: eventView.currentUser || 'Тестовый пользователь',
            photoLink: '/imges/avatar1.png',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            guestsCount: 50,
            eventType: 'conference',
            status: 'draft',
            hall: 'Conference Hall',
            menu: [],
            services: []
        },
        {
            id: 'sample-' + (Date.now() + 1),
            title: 'Встреча с клиентами',
            description: 'Ежеквартальная встреча с ключевыми клиентами',
            createdAt: new Date(),
            author: eventView.currentUser || 'Тестовый пользователь',
            photoLink: '/imges/avatar2.png',
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            guestsCount: 30,
            eventType: 'corporate',
            status: 'processing',
            hall: 'Business Center',
            menu: [],
            services: []
        }
    ];

    sampleEvents.forEach(event => {
        eventCollection.addEvent(event);
    });
    
    eventView.displayEvents();
    eventView.showSuccess('Добавлено тестовых мероприятий: ' + sampleEvents.length);
}

/**
 * Сохранить состояние контроллера в LocalStorage
 */
function saveControllerState() {
    const state = {
        currentPage: eventView.currentPage || 1,
        currentFilter: {},
        savedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('eventControllerState', JSON.stringify(state));
        console.log('Состояние контроллера сохранено');
    } catch (error) {
        console.error('Ошибка сохранения состояния:', error);
    }
}

/**
 * Восстановить состояние контроллера из LocalStorage
 */
function restoreControllerState() {
    try {
        const savedState = localStorage.getItem('eventControllerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            eventView.currentPage = state.currentPage || 1;
            currentPage = state.currentPage || 1;
            console.log('Состояние контроллера восстановлено');
        }
    } catch (error) {
        console.error('Ошибка восстановления состояния:', error);
    }
}

/**
 * Загрузить сохраненные настройки сортировки из LocalStorage
 */
function loadSortPreference() {
    try {
        const savedSort = localStorage.getItem('eventSortPreference');
        if (savedSort && window.eventView) {
            window.eventView.currentSort = savedSort;
            console.log('Настройки сортировки восстановлены:', savedSort);
        }
    } catch (error) {
        console.error('Ошибка загрузки настроек сортировки:', error);
    }
}

/**
 * Сохранить выбор сортировки в LocalStorage
 */
function saveSortPreference(sortBy) {
    try {
        localStorage.setItem('eventSortPreference', sortBy);
        console.log('Настройки сортировки сохранены:', sortBy);
    } catch (error) {
        console.error('Ошибка сохранения настроек сортировки:', error);
    }
}


function saveMenuSelection() {
    calculateMenuTotal();
    
    const menuData = {
        selectedMenu: selectedMenu,
        totalCost: totalMenuCost,
        savedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('eventMenu', JSON.stringify(menuData));
        eventView.showSuccess('Меню успешно сохранено!');
        console.log('Сохраненное меню:', menuData);
        
        showSection('booking');
    } catch (error) {
        eventView.showError('Ошибка при сохранении меню: ' + error.message);
    }
}

function saveServicesSelection() {
    calculateServicesTotal();
    
    const notes = document.querySelector('.service-notes__textarea')?.value || '';
    
    const servicesData = {
        selectedServices: selectedServices,
        totalCost: totalServicesCost,
        notes: notes,
        savedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('eventServices', JSON.stringify(servicesData));
        eventView.showSuccess('Услуги успешно сохранены!');
        console.log('Сохраненные услуги:', servicesData);
        
        showSection('booking');
    } catch (error) {
        eventView.showError('Ошибка при сохранении услуг: ' + error.message);
    }
}

/**
 * Сохранить новое мероприятие
 */
function saveNewEvent() {
    console.log('saveNewEvent вызвана');
    
    const form = document.querySelector('#addEvent .contact-form');
    if (!form) {
        console.error('Форма не найдена');
        return;
    }
    
    const formData = {
        title: form.querySelector('input[type="text"]').value,
        description: form.querySelector('textarea').value,
        date: form.querySelector('input[type="date"]').value,
        time: form.querySelector('input[type="time"]').value,
        guestsCount: form.querySelector('input[type="number"]').value,
        eventType: form.querySelectorAll('select')[0].value,
        hall: form.querySelectorAll('select')[1].value,
        photoLink: '/imges/avatar1.png'
    };

    console.log('Данные формы:', formData);

    // Очищаем предыдущие ошибки
    clearValidationErrors();

    if (addEvent(formData)) {
        clearValidationErrors();
        showSection('events');
    } else {
        console.error('Ошибка при добавлении мероприятия');
    }
}

/**
 * Сохранить отредактированное мероприятие
 */
function saveEditedEvent(id) {
    console.log('saveEditedEvent вызвана для ID:', id);
    
    const form = document.querySelector('#addEvent .contact-form');
    if (!form) {
        console.error('Форма не найдена');
        return;
    }
    
    const formData = {
        title: form.querySelector('input[type="text"]').value,
        description: form.querySelector('textarea').value,
        date: form.querySelector('input[type="date"]').value,
        time: form.querySelector('input[type="time"]').value,
        guestsCount: form.querySelector('input[type="number"]').value,
        eventType: form.querySelectorAll('select')[0].value,
        hall: form.querySelectorAll('select')[1].value
    };

    console.log('Данные для редактирования:', formData);

    // Валидация
    const validationErrors = validateEventData(formData);
    if (validationErrors.length > 0) {
        showValidationErrors(validationErrors);
        return;
    }

    const updatedFields = {
        title: formData.title,
        description: formData.description,
        date: new Date(`${formData.date}T${formData.time}`),
        guestsCount: parseInt(formData.guestsCount),
        eventType: formData.eventType,
        hall: formData.hall
    };

    console.log('Обновляемые поля:', updatedFields);

    if (eventCollection.editEvent(id, updatedFields)) {
        eventView.displayEvents();
        eventView.showSuccess('Мероприятие успешно обновлено!');
        currentEditingEventId = null;
        clearValidationErrors();
        showSection('events');
    } else {
        eventView.showError('Ошибка при обновлении мероприятия');
    }
}

/**
 * Отмена редактирования/добавления
 */
function cancelEventForm() {
    console.log('cancelEventForm вызвана');
    currentEditingEventId = null;
    clearValidationErrors();
    showSection('events');
}

/**
 * Редактировать мероприятие
 */
function editEvent(id) {
    console.log('editEvent вызвана для ID:', id);
    const event = eventCollection.getEvent(id);
    if (event) {
        currentEditingEventId = id;
        eventView.showEventForm(event);
    } else {
        eventView.showError('Мероприятие не найдено');
    }
}

/**
 * Удалить мероприятие
 */
function deleteEvent(id) {
    console.log('deleteEvent вызвана для ID:', id);
    if (confirm('Вы уверены, что хотите отменить это мероприятие?')) {
        if (eventCollection.removeEvent(id)) {
            eventView.displayEvents();
            eventView.showSuccess('Мероприятие успешно отменено!');
        } else {
            eventView.showError('Ошибка при отмене мероприятия');
        }
    }
}

/**
 * Добавить мероприятие (основная функция)
 */
function addEvent(eventData) {
    console.log('addEvent вызвана с данными:', eventData);
    
    // Валидация обязательных полей
    const validationErrors = validateEventData(eventData);
    if (validationErrors.length > 0) {
        console.error('Ошибки валидации:', validationErrors);
        showValidationErrors(validationErrors);
        return false;
    }

    // Создаем уникальный ID
    const eventId = 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const newEvent = {
        id: eventId,
        title: eventData.title,
        description: eventData.description,
        createdAt: new Date(),
        author: eventView.currentUser || 'Гость',
        photoLink: eventData.photoLink || '/imges/avatar1.png',
        date: new Date(`${eventData.date}T${eventData.time}`),
        guestsCount: parseInt(eventData.guestsCount),
        eventType: eventData.eventType,
        status: 'draft',
        hall: eventData.hall,
        menu: [],
        services: []
    };

    console.log('Новое мероприятие создано:', newEvent);

    if (eventCollection.addEvent(newEvent)) {
        eventView.displayEvents();
        eventView.showSuccess('Мероприятие успешно добавлено!');
        return true;
    } else {
        console.error('Ошибка при добавлении в коллекцию');
        showValidationErrors(['Ошибка при добавлении мероприятия в коллекцию']);
        return false;
    }
}

// Модифицируем функцию changePage для сохранения состояния
function changePage(page) {
    console.log('changePage вызвана, страница:', page);
    currentPage = page;
    eventView.currentPage = page;
    eventView.displayEvents();
    saveControllerState();
}

// Модифицируем функцию sortEvents для отладки
function sortEvents(criteria) {
    console.log('sortEvents вызвана с критерием:', criteria);
    eventView.displayEvents();
}

// Модифицируем функцию searchEvents для отладки
function searchEvents(query) {
    console.log('searchEvents вызвана с запросом:', query);
    const filteredEvents = eventCollection.getEvents(0, 100, {
        author: query,
        title: query
    });
    eventView.displayEvents(filteredEvents);
}

// Обновляем initializeApp
function initializeApp() {
    // Устанавливаем тестового пользователя
    eventView.setCurrentUser('Мария Иванова');
    
    // Восстанавливаем состояние контроллера
    restoreControllerState();
    
    // Загружаем настройки сортировки
    loadSortPreference();
    
    // Отображаем мероприятия (теперь загружаются из LocalStorage)
    eventView.displayEvents();
    
    // Загружаем сохраненные выборы
    loadSavedSelections();
    
    // Инициализируем подсчет сумм при загрузке страницы
    initializePriceCalculations();
    
    // Устанавливаем минимальную дату для бронирования
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    
    const dateInput = document.getElementById('hallDate');
    if (dateInput) {
        dateInput.min = minDate.toISOString().split('T')[0];
    }
    
    // Устанавливаем минимальную дату для формы мероприятий
    const eventDateInput = document.querySelector('#addEvent input[type="date"]');
    if (eventDateInput) {
        eventDateInput.min = minDate.toISOString().split('T')[0];
    }
    
    // Добавляем кнопки управления хранилищем
    addStorageManagementButtons();
}

// Добавляем кнопки управления хранилищем в интерфейс
function addStorageManagementButtons() {
    const eventsSection = document.getElementById('events');
    if (!eventsSection) return;
    
    // Проверяем, не добавлены ли уже кнопки
    if (document.querySelector('.storage-management')) return;
    
    const storagePanel = document.createElement('div');
    storagePanel.className = 'storage-management';
    storagePanel.innerHTML = `
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 10px;">
            <h3 style="margin-bottom: 10px; color: #333; font-family: 'Montserrat', sans-serif;">
                Управление данными (LocalStorage)
            </h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <button onclick="backupData()" class="testimonial__button" style="background: #28a745; color: white;">
                    💾 Экспорт данных
                </button>
                <label class="testimonial__button" style="background: #007bff; color: white; cursor: pointer;">
                    📂 Импорт данных
                    <input type="file" accept=".json" onchange="restoreData(event)" 
                           style="display: none;">
                </label>
                <button onclick="addSampleData()" class="testimonial__button" style="background: #6c757d; color: white;">
                    🧪 Добавить тестовые
                </button>
                <button onclick="clearAllData()" class="testimonial__button" style="background: #dc3545; color: white;">
                    🗑️ Очистить все
                </button>
                <button onclick="checkStorageSize()" class="testimonial__button" style="background: #ffc107; color: #333;">
                    📊 Статистика
                </button>
            </div>
            <div style="font-size: 12px; color: #666; padding: 8px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                <strong>Данные сохранены в LocalStorage браузера.</strong><br>
                <span id="storageInfo">Загрузка информации...</span>
            </div>
        </div>
    `;
    
    // Вставляем панель после заголовка
    const titleElement = eventsSection.querySelector('.title');
    if (titleElement) {
        titleElement.parentNode.insertBefore(storagePanel, titleElement.nextSibling.nextSibling);
    }
    
    // Обновляем информацию о хранилище
    setTimeout(updateStorageInfo, 100);
}

// Обновить информацию о хранилище
function updateStorageInfo() {
    const infoElement = document.getElementById('storageInfo');
    if (!infoElement) return;
    
    const eventsCount = eventCollection.getCount();
    const dataStr = JSON.stringify(eventCollection.getAllEvents());
    const sizeKB = (new Blob([dataStr]).size / 1024).toFixed(2);
    
    infoElement.textContent = `Событий: ${eventsCount} | Размер: ${sizeKB} KB`;
}


// Функция для проверки доступности функций
function checkGlobalFunctions() {
    console.log('Проверка глобальных функций:');
    console.log('saveNewEvent:', typeof saveNewEvent);
    console.log('saveEditedEvent:', typeof saveEditedEvent);
    console.log('cancelEventForm:', typeof cancelEventForm);
    console.log('editEvent:', typeof editEvent);
    console.log('deleteEvent:', typeof deleteEvent);
    console.log('showSection:', typeof showSection);
    console.log('eventView:', eventView);
    console.log('eventCollection:', eventCollection);
}

// Вызываем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ЗАГРУЗКА DOM ===');
    
    // 1. Запускаем приложение
    initializeApp();
    
    // 2. Через секунду проверяем функции
    setTimeout(checkGlobalFunctions, 1000);
});