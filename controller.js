let currentEditingObjId = null;

// 1. Добавить объект (вызывается из консоли)
function addObj(objData) {
    console.log('addObj вызван с данными:', objData);
    
    // Создаем объект
    const newObj = {
        id: Date.now().toString(),
        description: objData.description || 'Без описания',
        createdAt: new Date(),
        author: objView.currentUser || 'Гость',
        photoLink: objData.photoLink || '/imges/avatar1.png',
        title: objData.title || 'Без названия',
        date: new Date(`${objData.date}T${objData.time}`) || new Date(),
        guestsCount: objData.guestsCount || 1,
        eventType: objData.eventType || 'wedding',
        status: 'draft',
        hall: objData.hall || 'Grand Hall'
    };

    // Валидация
    if (!objCollection.validateObj(newObj)) {
        console.error('Объект невалиден');
        return false;
    }

    // Добавляем
    if (objCollection.addObj(newObj)) {
        objView.displayObjects();
        console.log('Объект добавлен успешно');
        return true;
    } else {
        console.error('Ошибка при добавлении');
        return false;
    }
}

// 2. Получить объекты (вызывается из консоли)
function getObjs(skip = 0, top = 10, filterConfig = {}) {
    console.log(`getObjs(${skip}, ${top}, ${JSON.stringify(filterConfig)})`);
    const result = objCollection.getObjs(skip, top, filterConfig);
    console.log('Результат:', result);
    return result;
}

// 3. Получить объект по ID
function getObj(id) {
    console.log(`getObj('${id}')`);
    const result = objCollection.getObj(id);
    console.log('Результат:', result);
    return result;
}

// 4. Редактировать объект
function editObj(id, updatedFields) {
    console.log(`editObj('${id}', ${JSON.stringify(updatedFields)})`);
    
    if (objCollection.editObj(id, updatedFields)) {
        objView.displayObjects();
        console.log('Объект обновлен');
        return true;
    } else {
        console.error('Ошибка при обновлении');
        return false;
    }
}

// 5. Удалить объект
function removeObj(id) {
    console.log(`removeObj('${id}')`);
    
    if (confirm('Удалить объект?')) {
        if (objCollection.removeObj(id)) {
            objView.displayObjects();
            console.log('Объект удален');
            return true;
        } else {
            console.error('Ошибка при удалении');
            return false;
        }
    }
    return false;
}

// 6. Сохранить новый объект (из формы)
function saveNewObj() {
    const form = document.querySelector('#addEvent .contact-form');
    const formData = {
        title: form.querySelector('input[type="text"]').value,
        description: form.querySelector('textarea').value,
        date: form.querySelector('input[type="date"]').value,
        time: form.querySelector('input[type="time"]').value,
        guestsCount: form.querySelector('input[type="number"]').value,
        eventType: form.querySelectorAll('select')[0].value,
        hall: form.querySelectorAll('select')[1].value
    };

    if (addObj(formData)) {
        showSection('events');
    }
}

// 7. Сохранить отредактированный объект
function saveEditedObj(id) {
    const form = document.querySelector('#addEvent .contact-form');
    const updatedFields = {
        title: form.querySelector('input[type="text"]').value,
        description: form.querySelector('textarea').value,
        date: new Date(`${form.querySelector('input[type="date"]').value}T${form.querySelector('input[type="time"]').value}`),
        guestsCount: parseInt(form.querySelector('input[type="number"]').value),
        eventType: form.querySelectorAll('select')[0].value,
        hall: form.querySelectorAll('select')[1].value
    };

    if (editObj(id, updatedFields)) {
        currentEditingObjId = null;
        showSection('events');
    }
}

// 8. Показать форму редактирования
function editObjForm(id) {
    const obj = objCollection.getObj(id);
    if (obj) {
        currentEditingObjId = id;
        objView.showObjForm(obj);
    }
}

// 9. Отмена формы
function cancelObjForm() {
    currentEditingObjId = null;
    showSection('events');
}

// 10. Сменить страницу
function changePage(page) {
    objView.currentPage = page;
    objView.displayObjects();
}

// 11. Фильтровать объекты
function filterObjects(filterConfig) {
    console.log('Фильтрация:', filterConfig);
    const filtered = objCollection.getObjs(0, 100, filterConfig);
    objView.displayObjects(filtered);
}

// 12. Инициализация приложения
function initializeApp() {
    // Устанавливаем пользователя (для демонстрации)
    objView.setCurrentUser('Мария Иванова');
    
    // Отображаем объекты
    objView.displayObjects();
    
    // Устанавливаем минимальную дату
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    
    const dateInput = document.getElementById('hallDate');
    if (dateInput) {
        dateInput.min = minDate.toISOString().split('T')[0];
    }
    
    console.log('Приложение инициализировано');
    console.log('Доступные функции из консоли:');
    console.log('- addObj({description: "текст", ...})');
    console.log('- getObjs(skip, top, filterConfig)');
    console.log('- getObj(id)');
    console.log('- editObj(id, {field: value})');
    console.log('- removeObj(id)');
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', initializeApp);