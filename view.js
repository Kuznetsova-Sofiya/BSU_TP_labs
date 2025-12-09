// view.js
class ObjView {
    constructor() {
        this.currentUser = null;
        this.currentPage = 1;
        this.objsPerPage = 2;
    }

    // Установить текущего пользователя
    setCurrentUser(user) {
        this.currentUser = user;
        this.updateUserInterface();
    }

    // Обновить интерфейс в зависимости от пользователя
    updateUserInterface() {
        console.log('Текущий пользователь:', this.currentUser);
        
        // Пример: скрыть/показать кнопки редактирования
        const editButtons = document.querySelectorAll('.testimonial__button');
        editButtons.forEach(btn => {
            if (this.currentUser === 'admin' || this.currentUser === 'Мария Иванова') {
                btn.style.display = 'inline-block';
            } else {
                btn.style.display = 'none';
            }
        });
    }

    // Отобразить объекты
    displayObjects(objects = null) {
        const container = document.querySelector('.testimonials');
        if (!container) return;

        if (!objects) {
            objects = objCollection.getObjs(
                (this.currentPage - 1) * this.objsPerPage,
                this.objsPerPage
            );
        }

        container.innerHTML = '';

        if (objects.length === 0) {
            container.innerHTML = `
                <div class="testimonial" style="text-align: center; width: 100%;">
                    <div class="testimonial__text">
                        <p>Объекты не найдены</p>
                    </div>
                </div>
            `;
            return;
        }

        objects.forEach(obj => {
            const objElement = this.createObjectElement(obj);
            container.appendChild(objElement);
        });

        this.updatePagination();
    }

    // Создать элемент объекта
    createObjectElement(obj) {
        const div = document.createElement('div');
        div.className = 'testimonial';
        div.dataset.objId = obj.id;

        const statusText = this.getStatusText(obj.status);
        const statusClass = this.getStatusClass(obj.status);

        div.innerHTML = `
            <div class="testimonial__text">
                <p>
                    <strong>${obj.title || 'Без названия'}</strong><br>
                    ${obj.description}<br>
                    Дата: ${this.formatDate(obj.date)}<br>
                    Автор: ${obj.author}<br>
                    Зал: ${obj.hall || 'Не указан'}<br>
                    Гостей: ${obj.guestsCount || 0}<br>
                    Тип: ${this.getEventTypeText(obj.eventType)}<br>
                    Статус: <span class="${statusClass}">${statusText}</span>
                </p>
            </div>
            <div class="testimonial__author">
                <div class="testimonial__avatar">
                    <img src="${obj.photoLink || '/imges/avatar1.png'}" alt="${obj.title}">
                </div>
                <div class="testimonial__info">
                    <h3 class="testimonial__name">${obj.author}</h3>
                    <p class="testimonial__position">
                        ${this.createActionButtons(obj)}
                    </p>
                </div>
            </div>
        `;

        return div;
    }

    // Вспомогательные методы
    getStatusText(status) {
        const statusMap = {
            'draft': 'Черновик',
            'processing': 'В обработке',
            'confirmed': 'Подтверждено',
            'cancelled': 'Отменено'
        };
        return statusMap[status] || status;
    }

    getStatusClass(status) {
        const classMap = {
            'draft': 'status-draft',
            'processing': 'status-processing',
            'confirmed': 'status-confirmed',
            'cancelled': 'status-cancelled'
        };
        return classMap[status] || '';
    }

    getEventTypeText(eventType) {
        const typeMap = {
            'wedding': 'Свадьба',
            'corporate': 'Корпоратив',
            'birthday': 'День рождения',
            'graduation': 'Выпускной'
        };
        return typeMap[eventType] || eventType;
    }

    formatDate(date) {
        return date ? new Date(date).toLocaleDateString('ru-RU') : 'Не указана';
    }

    createActionButtons(obj) {
        let buttons = '';
        
        if (this.currentUser && (this.currentUser === obj.author || this.currentUser === 'admin')) {
            buttons += `
                <button class="testimonial__button" onclick="editObj('${obj.id}')">Изменить</button>
                <button class="testimonial__button" onclick="removeObj('${obj.id}')">Удалить</button>
            `;
        }
        
        return buttons || '<span>Действия недоступны</span>';
    }

    // Обновить пагинацию
    updatePagination() {
        const totalObjects = objCollection.getCount();
        const totalPages = Math.ceil(totalObjects / this.objsPerPage);
        
        const container = document.querySelector('.pagination');
        if (!container) return;

        let html = `
            <a href="#" class="pagination__arrow ${this.currentPage === 1 ? 'pagination__arrow--disabled' : ''}" 
               onclick="${this.currentPage > 1 ? `changePage(${this.currentPage - 1})` : ''}">←</a>
            <div class="pagination__numbers">
        `;

        // Показываем первые страницы
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
            html += `
                <a href="#" class="pagination__number ${i === this.currentPage ? 'pagination__number--active' : ''}" 
                   onclick="changePage(${i})">${i}</a>
            `;
        }

        if (totalPages > 5 && this.currentPage < totalPages - 2) {
            html += `<span class="pagination__ellipsis">...</span>`;
        }

        // Показываем последние страницы
        for (let i = Math.max(4, totalPages - 2); i <= totalPages; i++) {
            if (i > 3) {
                html += `
                    <a href="#" class="pagination__number ${i === this.currentPage ? 'pagination__number--active' : ''}" 
                       onclick="changePage(${i})">${i}</a>
                `;
            }
        }

        html += `
            </div>
            <a href="#" class="pagination__arrow ${this.currentPage === totalPages ? 'pagination__arrow--disabled' : ''}" 
               onclick="${this.currentPage < totalPages ? `changePage(${this.currentPage + 1})` : ''}">→</a>
        `;

        container.innerHTML = html;
    }

    // Показать форму добавления/редактирования
    showObjForm(obj = null) {
        const formContainer = document.getElementById('addEvent');
        if (!formContainer) return;

        const isEdit = !!obj;
        
        formContainer.querySelector('.contact__title').textContent = 
            isEdit ? 'РЕДАКТИРОВАНИЕ ОБЪЕКТА' : 'ДОБАВЛЕНИЕ ОБЪЕКТА';
        
        const form = formContainer.querySelector('.contact-form');
        form.innerHTML = this.createFormHTML(obj);
        
        showSection('addEvent');
    }

    createFormHTML(obj = null) {
        const isEdit = !!obj;
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 3);
        const minDateStr = minDate.toISOString().split('T')[0];
        
        return `
            <div class="contact-form__data">
                <div class="contact-form__group">
                    <input type="text" class="contact-form__input" placeholder="Название *" 
                           value="${obj ? obj.title : ''}" required>
                    <input type="date" class="contact-form__input" placeholder="Дата мероприятия *" 
                           value="${obj && obj.date ? new Date(obj.date).toISOString().split('T')[0] : ''}" 
                           min="${minDateStr}" required>
                    <input type="time" class="contact-form__input" placeholder="Время *" 
                           value="${obj && obj.date ? new Date(obj.date).toTimeString().slice(0,5) : ''}" required>
                    <input type="number" class="contact-form__input" placeholder="Количество гостей *" 
                           value="${obj ? obj.guestsCount : ''}" required min="1" max="500">
                    <select class="contact-form__input" required>
                        <option value="">Тип мероприятия *</option>
                        <option value="wedding" ${obj && obj.eventType === 'wedding' ? 'selected' : ''}>Свадьба</option>
                        <option value="corporate" ${obj && obj.eventType === 'corporate' ? 'selected' : ''}>Корпоратив</option>
                        <option value="birthday" ${obj && obj.eventType === 'birthday' ? 'selected' : ''}>День рождения</option>
                    </select>
                    <select class="contact-form__input" required>
                        <option value="">Зал *</option>
                        <option value="Grand Hall" ${obj && obj.hall === 'Grand Hall' ? 'selected' : ''}>Grand Hall</option>
                        <option value="Business Center" ${obj && obj.hall === 'Business Center' ? 'selected' : ''}>Business Center</option>
                    </select>
                </div>
                <textarea class="contact-form__textarea" placeholder="Описание *" required maxlength="200">${obj ? obj.description : ''}</textarea>
            </div>
            <div class="form-notes">
                <p>* - обязательные поля</p>
                <p>Максимум 200 символов в описании</p>
            </div>
            <button type="button" class="contact-form__button" onclick="${isEdit ? `saveEditedObj('${obj.id}')` : 'saveNewObj()'}">
                ${isEdit ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" class="contact-form__button" onclick="cancelObjForm()" 
                    style="background-color: #666; margin-top: 10px;">Отмена</button>
        `;
    }

    showError(message) {
        const errorSection = document.getElementById('error');
        if (!errorSection) return;

        document.getElementById('errorMessage').textContent = message;
        showSection('error');
    }

    showSuccess(message) {
        alert(message);
    }
}

// Создаем глобальный экземпляр View
const objView = new ObjView();