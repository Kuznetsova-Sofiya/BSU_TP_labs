// view.js

class EventView {
    constructor() {
        this.currentUser = null; // Текущий пользователь
        this.currentPage = 1;
        this.eventsPerPage = 2;
    }

    // Установить текущего пользователя
    setCurrentUser(user) {
        this.currentUser = user;
        this._updateUserInterface();
    }

    // Обновить интерфейс в зависимости от пользователя
    _updateUserInterface() {
        // Здесь можно добавить логику показа/скрытия элементов
        // в зависимости от прав пользователя
        console.log('User updated:', this.currentUser);
    }

    // Отобразить мероприятия
    displayEvents(events = null) {
    const eventsContainer = document.querySelector('.testimonials');
    if (!eventsContainer) return;

    if (!events) {
        events = eventCollection.getEvents(
            (this.currentPage - 1) * this.eventsPerPage,
            this.eventsPerPage
        );
    }

    eventsContainer.innerHTML = '';

    if (events.length === 0) {
        eventsContainer.innerHTML = `
            <div class="testimonial" style="text-align: center; width: 100%;">
                <div class="testimonial__text">
                    <p>Мероприятия не найдены</p>
                    <p style="font-size: 14px; color: #666; margin-top: 10px;">
                        Создайте новое мероприятие или импортируйте данные
                    </p>
                </div>
            </div>
        `;
        return;
    }

        events.forEach(event => {
            const eventElement = this._createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });

        this._updatePagination();
    }

    // Создать элемент мероприятия
    _createEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'testimonial';
        eventDiv.dataset.eventId = event.id;

        const statusText = this._getStatusText(event.status);
        const statusClass = this._getStatusClass(event.status);

        eventDiv.innerHTML = `
            <div class="testimonial__text">
                <p>
                    <strong>${event.title}</strong><br>
                    Дата: ${this._formatDate(event.date)}<br>
                    Зал: ${event.hall}<br>
                    Гостей: ${event.guestsCount}<br>
                    Тип: ${this._getEventTypeText(event.eventType)}<br>
                    Статус: <span class="${statusClass}">${statusText}</span>
                </p>
            </div>
            <div class="testimonial__author">
                <div class="testimonial__avatar">
                    <img src="${event.photoLink}" alt="${event.title}">
                </div>
                <div class="testimonial__info">
                    <h3 class="testimonial__name">${event.author}</h3>
                    <p class="testimonial__position">
                        ${this._createActionButtons(event)}
                    </p>
                </div>
            </div>
        `;

        return eventDiv;
    }

    // Получить текст статуса
    _getStatusText(status) {
        const statusMap = {
            'draft': 'Черновик',
            'processing': 'В обработке',
            'confirmed': 'Подтверждено',
            'cancelled': 'Отменено'
        };
        return statusMap[status] || status;
    }

    // Получить класс для статуса
    _getStatusClass(status) {
        const classMap = {
            'draft': 'status-draft',
            'processing': 'status-processing',
            'confirmed': 'status-confirmed',
            'cancelled': 'status-cancelled'
        };
        return classMap[status] || '';
    }

    // Получить текст типа мероприятия
    _getEventTypeText(eventType) {
        const typeMap = {
            'wedding': 'Свадьба',
            'corporate': 'Корпоратив',
            'birthday': 'День рождения',
            'graduation': 'Выпускной',
            'conference': 'Конференция',
            'kids': 'Детский праздник',
            'romantic': 'Романтический ужин',
            'seminar': 'Семинар',
            'photo': 'Фотосессия',
            'alumni': 'Встреча выпускников'
        };
        return typeMap[eventType] || eventType;
    }

    // Создать кнопки действий
    _createActionButtons(event) {
        let buttons = '';
        
        if (this.currentUser && (this.currentUser === event.author || this.currentUser === 'admin')) {
            buttons += `
                <button class="testimonial__button" onclick="editEvent('${event.id}')">Изменить</button>
                <button class="testimonial__button" onclick="deleteEvent('${event.id}')">Отменить</button>
            `;
        }
        
        return buttons || '<span>Действия недоступны</span>';
    }

    // Форматировать дату
    _formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }

    // Обновить пагинацию
    _updatePagination() {
        const totalEvents = eventCollection.getCount();
        const totalPages = Math.ceil(totalEvents / this.eventsPerPage);
        
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        let paginationHTML = `
            <a href="#" class="pagination__arrow ${this.currentPage === 1 ? 'pagination__arrow--disabled' : ''}" 
               onclick="${this.currentPage > 1 ? `changePage(${this.currentPage - 1})` : ''}">←</a>
            <div class="pagination__numbers">
        `;

        // Показываем первые страницы
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
            paginationHTML += `
                <a href="#" class="pagination__number ${i === this.currentPage ? 'pagination__number--active' : ''}" 
                   onclick="changePage(${i})">${i}</a>
            `;
        }

        // Многоточие если нужно
        if (totalPages > 5 && this.currentPage < totalPages - 2) {
            paginationHTML += `<span class="pagination__ellipsis">...</span>`;
        }

        // Показываем последние страницы
        for (let i = Math.max(4, totalPages - 2); i <= totalPages; i++) {
            if (i > 3) {
                paginationHTML += `
                    <a href="#" class="pagination__number ${i === this.currentPage ? 'pagination__number--active' : ''}" 
                       onclick="changePage(${i})">${i}</a>
                `;
            }
        }

        paginationHTML += `
            </div>
            <a href="#" class="pagination__arrow ${this.currentPage === totalPages ? 'pagination__arrow--disabled' : ''}" 
               onclick="${this.currentPage < totalPages ? `changePage(${this.currentPage + 1})` : ''}">→</a>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    // Показать форму добавления/редактирования
    showEventForm(event = null) {
        const formContainer = document.getElementById('addEvent');
        if (!formContainer) return;

        const isEdit = !!event;
        
        formContainer.querySelector('.contact__title').textContent = 
            isEdit ? 'РЕДАКТИРОВАНИЕ МЕРОПРИЯТИЯ' : 'ДОБАВЛЕНИЕ МЕРОПРИЯТИЯ';
        
        const form = formContainer.querySelector('.contact-form');
        form.innerHTML = this._createFormHTML(event);
        
        showSection('addEvent');
    }


    // Создать HTML формы
    _createFormHTML(event = null) {
        const isEdit = !!event;
        
        // Устанавливаем минимальную дату (текущая дата + 3 дня)
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 3);
        const minDateStr = minDate.toISOString().split('T')[0];
        
        // Важно: используем onclick="saveNewEvent()" и onclick="cancelEventForm()"
        // без window. или this., так как функции глобальные
        return `
            <div class="contact-form__data">
                <div class="contact-form__group">
                    <input type="text" class="contact-form__input" placeholder="Название мероприятия *" 
                        value="${event ? event.title : ''}" required>
                    <input type="date" class="contact-form__input" placeholder="Дата *" 
                        value="${event ? new Date(event.date).toISOString().split('T')[0] : ''}" 
                        min="${minDateStr}" required>
                    <input type="time" class="contact-form__input" placeholder="Время *" 
                        value="${event ? new Date(event.date).toTimeString().slice(0,5) : ''}" required>
                    <input type="number" class="contact-form__input" placeholder="Количество гостей *" 
                        value="${event ? event.guestsCount : ''}" required min="1" max="500">
                    <select class="contact-form__input" required>
                        <option value="">Выберите тип мероприятия *</option>
                        <option value="wedding" ${event && event.eventType === 'wedding' ? 'selected' : ''}>Свадьба</option>
                        <option value="corporate" ${event && event.eventType === 'corporate' ? 'selected' : ''}>Корпоратив</option>
                        <option value="birthday" ${event && event.eventType === 'birthday' ? 'selected' : ''}>День рождения</option>
                        <option value="graduation" ${event && event.eventType === 'graduation' ? 'selected' : ''}>Выпускной</option>
                        <option value="conference" ${event && event.eventType === 'conference' ? 'selected' : ''}>Конференция</option>
                    </select>
                    <select class="contact-form__input" required>
                        <option value="">Выберите зал *</option>
                        <option value="Grand Hall" ${event && event.hall === 'Grand Hall' ? 'selected' : ''}>Grand Hall</option>
                        <option value="Business Center" ${event && event.hall === 'Business Center' ? 'selected' : ''}>Business Center</option>
                        <option value="Family Room" ${event && event.hall === 'Family Room' ? 'selected' : ''}>Family Room</option>
                        <option value="VIP Room" ${event && event.hall === 'VIP Room' ? 'selected' : ''}>VIP Room</option>
                        <option value="Conference Hall" ${event && event.hall === 'Conference Hall' ? 'selected' : ''}>Conference Hall</option>
                        <option value="Studio" ${event && event.hall === 'Studio' ? 'selected' : ''}>Studio</option>
                    </select>
                </div>
                <textarea class="contact-form__textarea" placeholder="Описание мероприятия *" required maxlength="200">${event ? event.description : ''}</textarea>
            </div>
            <div class="form-notes">
                <p>* - обязательные для заполнения поля</p>
                <p>Максимальная длина описания: 200 символов</p>
                <p>Дата мероприятия должна быть не ранее ${minDate.toLocaleDateString('ru-RU')}</p>
            </div>
            <button type="button" class="contact-form__button" onclick="${isEdit ? `saveEditedEvent('${event.id}')` : 'saveNewEvent()'}">
                ${isEdit ? 'Сохранить изменения' : 'Создать мероприятие'}
            </button>
            <button type="button" class="contact-form__button" onclick="cancelEventForm()" 
                    style="background-color: #666; margin-top: 10px;">Отмена</button>
        `;
    }
    // Показать ошибку
    showError(message) {
        const errorSection = document.getElementById('error');
        if (!errorSection) return;

        document.getElementById('errorMessage').textContent = message;
        showSection('error');
        
        // Добавляем стили для валидации
        const style = document.createElement('style');
        style.textContent = `
            .validation-errors {
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                border: 1px solid #f5c6cb;
            }
            
            .validation-errors ul {
                margin: 10px 0 0 20px;
            }
            
            .validation-errors li {
                margin: 5px 0;
            }
            
            .invalid-field {
                border-color: #dc3545 !important;
                background-color: #fff8f8;
            }
            
            .invalid-field:focus {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
        `;
        document.head.appendChild(style);
    }

    // Показать успешное сообщение
    showSuccess(message) {
        alert(message); // Можно заменить на красивый toast
    }

    
}

// Создаем экземпляр View
const eventView = new EventView();