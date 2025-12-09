class ObjCollection {
    // Приватное поле для хранения объектов
    #objects;

    /**
     * Конструктор класса
     * @param {Array<Object>} objects - начальный массив объектов
     */
    constructor(objects = []) {
        this.#objects = objects;
        this.#sortById(); // Сортируем по ID при создании
    }

    /**
     * Приватный метод для сортировки объектов по ID
     */
    #sortById() {
        this.#objects.sort((a, b) => a.id.localeCompare(b.id));
    }

    /**
     * Приватный метод для валидации объекта
     * @param {Object} obj - объект для валидации
     * @returns {boolean} - true если объект валиден
     */
    #validateObject(obj) {
        // Проверка обязательных полей
        if (!obj.id || typeof obj.id !== 'string') {
            console.error('Ошибка валидации: неверный или отсутствующий ID');
            return false;
        }
        
        if (!obj.description || typeof obj.description !== 'string') {
            console.error('Ошибка валидации: неверное или отсутствующее описание');
            return false;
        }
        
        if (obj.description.length > 200) {
            console.error('Ошибка валидации: описание превышает 200 символов');
            return false;
        }
        
        if (!obj.createdAt || !(obj.createdAt instanceof Date)) {
            console.error('Ошибка валидации: неверная или отсутствующая дата создания');
            return false;
        }
        
        if (!obj.author || typeof obj.author !== 'string' || obj.author.trim() === '') {
            console.error('Ошибка валидации: неверный или отсутствующий автор');
            return false;
        }

        // Проверка необязательных полей
        if (obj.photoLink && typeof obj.photoLink !== 'string') {
            console.error('Ошибка валидации: неверная ссылка на фото');
            return false;
        }

        // Проверка дополнительных полей по индивидуальному заданию
        if (obj.title && typeof obj.title !== 'string') {
            console.error('Ошибка валидации: неверный заголовок');
            return false;
        }
        
        if (obj.date && !(obj.date instanceof Date)) {
            console.error('Ошибка валидации: неверная дата мероприятия');
            return false;
        }
        
        if (obj.guestsCount && (typeof obj.guestsCount !== 'number' || obj.guestsCount < 0)) {
            console.error('Ошибка валидации: неверное количество гостей');
            return false;
        }
        
        if (obj.eventType && typeof obj.eventType !== 'string') {
            console.error('Ошибка валидации: неверный тип мероприятия');
            return false;
        }
        
        if (obj.status && typeof obj.status !== 'string') {
            console.error('Ошибка валидации: неверный статус');
            return false;
        }
        
        if (obj.hall && typeof obj.hall !== 'string') {
            console.error('Ошибка валидации: неверное название зала');
            return false;
        }

        return true;
    }

    /**
     * Получить массив объектов с пагинацией и фильтрацией
     * @param {number} skip - количество пропускаемых элементов
     * @param {number} top - количество получаемых элементов
     * @param {Object} filterConfig - объект с параметрами фильтрации
     * @returns {Array<Object>} - массив объектов
     */
    getObjs(skip = 0, top = 10, filterConfig = {}) {
        // Проверка параметров
        if (typeof skip !== 'number' || skip < 0) {
            console.warn('Некорректный параметр skip, используется значение по умолчанию: 0');
            skip = 0;
        }
        
        if (typeof top !== 'number' || top <= 0) {
            console.warn('Некорректный параметр top, используется значение по умолчанию: 10');
            top = 10;
        }

        let filtered = [...this.#objects];

        // Применяем фильтры
        if (filterConfig.author) {
            filtered = filtered.filter(obj => 
                obj.author.toLowerCase().includes(filterConfig.author.toLowerCase())
            );
        }
        
        if (filterConfig.eventType) {
            filtered = filtered.filter(obj => 
                obj.eventType === filterConfig.eventType
            );
        }
        
        if (filterConfig.status) {
            filtered = filtered.filter(obj => 
                obj.status === filterConfig.status
            );
        }
        
        if (filterConfig.hall) {
            filtered = filtered.filter(obj => 
                obj.hall === filterConfig.hall
            );
        }
        
        if (filterConfig.title) {
            filtered = filtered.filter(obj => 
                obj.title && obj.title.toLowerCase().includes(filterConfig.title.toLowerCase())
            );
        }
        
        if (filterConfig.description) {
            filtered = filtered.filter(obj => 
                obj.description.toLowerCase().includes(filterConfig.description.toLowerCase())
            );
        }
        
        if (filterConfig.dateFrom) {
            const dateFrom = new Date(filterConfig.dateFrom);
            filtered = filtered.filter(obj => 
                obj.date && new Date(obj.date) >= dateFrom
            );
        }
        
        if (filterConfig.dateTo) {
            const dateTo = new Date(filterConfig.dateTo);
            filtered = filtered.filter(obj => 
                obj.date && new Date(obj.date) <= dateTo
            );
        }
        
        if (filterConfig.guestsMin) {
            filtered = filtered.filter(obj => 
                obj.guestsCount && obj.guestsCount >= filterConfig.guestsMin
            );
        }
        
        if (filterConfig.guestsMax) {
            filtered = filtered.filter(obj => 
                obj.guestsCount && obj.guestsCount <= filterConfig.guestsMax
            );
        }
        
        if (filterConfig.createdAtFrom) {
            const createdAtFrom = new Date(filterConfig.createdAtFrom);
            filtered = filtered.filter(obj => 
                obj.createdAt && new Date(obj.createdAt) >= createdAtFrom
            );
        }
        
        if (filterConfig.createdAtTo) {
            const createdAtTo = new Date(filterConfig.createdAtTo);
            filtered = filtered.filter(obj => 
                obj.createdAt && new Date(obj.createdAt) <= createdAtTo
            );
        }

        // Применяем пагинацию
        return filtered.slice(skip, skip + top);
    }

    /**
     * Получить объект по ID
     * @param {string} id - ID объекта
     * @returns {Object|null} - найденный объект или null
     */
    getObj(id) {
        if (!id || typeof id !== 'string') {
            console.error('Неверный ID');
            return null;
        }
        
        const obj = this.#objects.find(obj => obj.id === id);
        
        if (!obj) {
            console.warn(`Объект с ID "${id}" не найден`);
        }
        
        return obj || null;
    }

    /**
     * Проверить валидность объекта
     * @param {Object} obj - объект для проверки
     * @returns {boolean} - true если объект валиден
     */
    validateObj(obj) {
        const isValid = this.#validateObject(obj);
        console.log(`Валидация объекта ${obj.id || 'без ID'}: ${isValid ? 'УСПЕХ' : 'ОШИБКА'}`);
        return isValid;
    }

    /**
     * Добавить новый объект
     * @param {Object} obj - объект для добавления
     * @returns {boolean} - true если объект добавлен успешно
     */
    addObj(obj) {
        console.log('Попытка добавления объекта:', obj);
        
        if (!this.#validateObject(obj)) {
            console.error('Объект не прошел валидацию');
            return false;
        }
        
        // Проверка уникальности ID
        if (this.#objects.some(existingObj => existingObj.id === obj.id)) {
            console.error(`Объект с ID "${obj.id}" уже существует`);
            return false;
        }
        
        this.#objects.push(obj);
        this.#sortById();
        console.log(`Объект с ID "${obj.id}" успешно добавлен`);
        return true;
    }

    /**
     * Редактировать объект
     * @param {string} id - ID редактируемого объекта
     * @param {Object} updatedFields - поля для обновления
     * @returns {boolean} - true если объект обновлен успешно
     */
    editObj(id, updatedFields) {
        console.log(`Попытка редактирования объекта "${id}" с полями:`, updatedFields);
        
        const index = this.#objects.findIndex(obj => obj.id === id);
        if (index === -1) {
            console.error(`Объект с ID "${id}" не найден`);
            return false;
        }
        
        // Проверяем, что не пытаются изменить запрещенные поля
        if (updatedFields.id !== undefined) {
            console.warn('Поле "id" не может быть изменено');
            delete updatedFields.id;
        }
        
        if (updatedFields.author !== undefined) {
            console.warn('Поле "author" не может быть изменено');
            delete updatedFields.author;
        }
        
        if (updatedFields.createdAt !== undefined) {
            console.warn('Поле "createdAt" не может быть изменено');
            delete updatedFields.createdAt;
        }
        
        // Создаем обновленный объект
        const updatedObj = {
            ...this.#objects[index],
            ...updatedFields
        };
        
        if (!this.#validateObject(updatedObj)) {
            console.error('Обновленный объект не прошел валидацию');
            return false;
        }
        
        this.#objects[index] = updatedObj;
        this.#sortById();
        console.log(`Объект с ID "${id}" успешно обновлен`);
        return true;
    }

    /**
     * Удалить объект по ID
     * @param {string} id - ID объекта
     * @returns {boolean} - true если объект удален успешно
     */
    removeObj(id) {
        console.log(`Попытка удаления объекта "${id}"`);
        
        const index = this.#objects.findIndex(obj => obj.id === id);
        if (index === -1) {
            console.error(`Объект с ID "${id}" не найден`);
            return false;
        }
        
        this.#objects.splice(index, 1);
        console.log(`Объект с ID "${id}" успешно удален`);
        return true;
    }

    /**
     * Добавить массив объектов
     * @param {Array<Object>} objects - массив объектов для добавления
     * @returns {Array<Object>} - массив объектов, которые не были добавлены
     */
    addAll(objects) {
        console.log(`Попытка добавления ${objects.length} объектов`);
        
        if (!Array.isArray(objects)) {
            console.error('Параметр должен быть массивом');
            return objects;
        }
        
        const invalidObjects = [];
        
        objects.forEach(obj => {
            if (!this.addObj(obj)) {
                invalidObjects.push(obj);
            }
        });
        
        console.log(`Добавлено: ${objects.length - invalidObjects.length}, Ошибок: ${invalidObjects.length}`);
        return invalidObjects;
    }

    /**
     * Очистить коллекцию
     */
    clear() {
        console.log('Очистка коллекции');
        this.#objects = [];
    }

    /**
     * Получить количество объектов в коллекции
     * @returns {number} - количество объектов
     */
    getCount() {
        return this.#objects.length;
    }

    /**
     * Получить все объекты (для отладки)
     * @returns {Array<Object>} - все объекты
     */
    getAll() {
        return [...this.#objects];
    }

    /**
     * Поиск объектов по текстовому запросу
     * @param {string} query - поисковый запрос
     * @returns {Array<Object>} - найденные объекты
     */
    search(query) {
        if (!query || typeof query !== 'string') {
            return [];
        }
        
        const lowerQuery = query.toLowerCase();
        
        return this.#objects.filter(obj => 
            (obj.title && obj.title.toLowerCase().includes(lowerQuery)) ||
            (obj.description && obj.description.toLowerCase().includes(lowerQuery)) ||
            (obj.author && obj.author.toLowerCase().includes(lowerQuery)) ||
            (obj.hall && obj.hall.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Получить статистику по коллекции
     * @returns {Object} - объект со статистикой
     */
    getStats() {
        const stats = {
            total: this.#objects.length,
            byEventType: {},
            byStatus: {},
            byAuthor: {},
            upcoming: 0,
            past: 0,
            averageGuests: 0
        };
        
        const now = new Date();
        let totalGuests = 0;
        
        this.#objects.forEach(obj => {
            // Статистика по типу мероприятия
            if (obj.eventType) {
                stats.byEventType[obj.eventType] = (stats.byEventType[obj.eventType] || 0) + 1;
            }
            
            // Статистика по статусу
            if (obj.status) {
                stats.byStatus[obj.status] = (stats.byStatus[obj.status] || 0) + 1;
            }
            
            // Статистика по автору
            if (obj.author) {
                stats.byAuthor[obj.author] = (stats.byAuthor[obj.author] || 0) + 1;
            }
            
            // Подсчет гостей
            if (obj.guestsCount) {
                totalGuests += obj.guestsCount;
            }
            
            // Предстоящие и прошедшие мероприятия
            if (obj.date) {
                if (new Date(obj.date) > now) {
                    stats.upcoming++;
                } else {
                    stats.past++;
                }
            }
        });
        
        // Среднее количество гостей
        if (this.#objects.length > 0) {
            stats.averageGuests = Math.round(totalGuests / this.#objects.length);
        }
        
        return stats;
    }
}

// Пример данных (минимум 20 объектов согласно заданию)
const initialObjects = [
    {
        id: '1',
        description: 'Свадьба Марии и Алексея - торжественная церемония и банкет в стиле бохо',
        createdAt: new Date('2024-11-15T10:00:00'),
        author: 'Мария Иванова',
        photoLink: '/imges/avatar1.png',
        title: 'Свадьба Марии и Алексея',
        date: new Date('2024-12-15T18:00:00'),
        guestsCount: 120,
        eventType: 'wedding',
        status: 'confirmed',
        hall: 'Grand Hall'
    },
    {
        id: '2',
        description: 'Новогодний корпоратив для сотрудников ООО "Технологии" с живой музыкой',
        createdAt: new Date('2024-11-10T14:30:00'),
        author: 'Петр Сидоров',
        photoLink: '/imges/avatar2.png',
        title: 'Корпоратив ООО "Технологии"',
        date: new Date('2024-12-20T19:00:00'),
        guestsCount: 80,
        eventType: 'corporate',
        status: 'processing',
        hall: 'Business Center'
    },
    {
        id: '3',
        description: 'Торжество по случаю 50-летия Анны Петровны с приглашенными артистами',
        createdAt: new Date('2024-11-12T09:15:00'),
        author: 'Сергей Ковалев',
        photoLink: '/imges/avatar1.png',
        title: 'Юбилей Анны Петровны',
        date: new Date('2024-12-10T17:00:00'),
        guestsCount: 60,
        eventType: 'birthday',
        status: 'confirmed',
        hall: 'Grand Hall'
    },
    {
        id: '4',
        description: 'Торжественный выпускной для студентов университета с дипломной церемонией',
        createdAt: new Date('2024-11-08T16:45:00'),
        author: 'Елена Смирнова',
        photoLink: '/imges/avatar2.png',
        title: 'Выпускной вечер',
        date: new Date('2024-12-25T16:00:00'),
        guestsCount: 200,
        eventType: 'graduation',
        status: 'draft',
        hall: 'Grand Hall'
    },
    {
        id: '5',
        description: 'Ежегодная отраслевая конференция с участием международных экспертов',
        createdAt: new Date('2024-11-05T11:20:00'),
        author: 'Андрей Волков',
        photoLink: '/imges/avatar1.png',
        title: 'Бизнес-конференция',
        date: new Date('2024-12-18T09:00:00'),
        guestsCount: 150,
        eventType: 'conference',
        status: 'confirmed',
        hall: 'Business Center'
    },
    {
        id: '6',
        description: 'Праздник для детей с анимацией, конкурсами и сладким столом',
        createdAt: new Date('2024-11-20T13:10:00'),
        author: 'Ольга Новикова',
        photoLink: '/imges/avatar2.png',
        title: 'Детский день рождения',
        date: new Date('2024-12-22T15:00:00'),
        guestsCount: 25,
        eventType: 'kids',
        status: 'processing',
        hall: 'Family Room'
    },
    {
        id: '7',
        description: 'Частное мероприятие для двоих с романтической атмосферой и живой музыкой',
        createdAt: new Date('2024-11-18T20:30:00'),
        author: 'Дмитрий Козлов',
        photoLink: '/imges/avatar1.png',
        title: 'Романтический ужин',
        date: new Date('2024-12-14T20:00:00'),
        guestsCount: 2,
        eventType: 'romantic',
        status: 'confirmed',
        hall: 'VIP Room'
    },
    {
        id: '8',
        description: 'Обучающий семинар для предпринимателей по современным маркетинговым стратегиям',
        createdAt: new Date('2024-11-22T08:45:00'),
        author: 'Ирина Федорова',
        photoLink: '/imges/avatar2.png',
        title: 'Семинар по маркетингу',
        date: new Date('2024-12-28T10:00:00'),
        guestsCount: 50,
        eventType: 'seminar',
        status: 'draft',
        hall: 'Conference Hall'
    },
    {
        id: '9',
        description: 'Профессиональная фотосессия в интерьерах ресторана с опытным фотографом',
        createdAt: new Date('2024-11-25T15:20:00'),
        author: 'Александр Попов',
        photoLink: '/imges/avatar1.png',
        title: 'Фотосессия',
        date: new Date('2024-12-30T14:00:00'),
        guestsCount: 5,
        eventType: 'photo',
        status: 'confirmed',
        hall: 'Studio'
    },
    {
        id: '10',
        description: 'Ежегодная встреча выпускников университета с воспоминаниями и танцами',
        createdAt: new Date('2024-11-28T17:35:00'),
        author: 'Наталья Морозова',
        photoLink: '/imges/avatar2.png',
        title: 'Встреча выпускников',
        date: new Date('2024-12-29T19:00:00'),
        guestsCount: 100,
        eventType: 'alumni',
        status: 'processing',
        hall: 'Grand Hall'
    },
    {
        id: '11',
        description: 'Тематическая вечеринка в стиле 80-х с ретро музыкой и костюмами',
        createdAt: new Date('2024-10-15T12:00:00'),
        author: 'Иван Петров',
        photoLink: '/imges/avatar1.png',
        title: 'Вечеринка в стиле 80-х',
        date: new Date('2024-11-30T20:00:00'),
        guestsCount: 75,
        eventType: 'party',
        status: 'confirmed',
        hall: 'Grand Hall'
    },
    {
        id: '12',
        description: 'Ежегодный семейный сбор с конкурсами и традиционными блюдами',
        createdAt: new Date('2024-10-20T09:30:00'),
        author: 'Татьяна Соколова',
        photoLink: '/imges/avatar2.png',
        title: 'Семейная встреча',
        date: new Date('2024-12-05T15:00:00'),
        guestsCount: 40,
        eventType: 'family',
        status: 'confirmed',
        hall: 'Family Room'
    },
    {
        id: '13',
        description: 'Модный показ новой коллекции с приглашенными гостями и прессой',
        createdAt: new Date('2024-10-25T16:45:00'),
        author: 'Анна Кузнецова',
        photoLink: '/imges/avatar1.png',
        title: 'Модный показ',
        date: new Date('2024-12-12T19:00:00'),
        guestsCount: 120,
        eventType: 'fashion',
        status: 'processing',
        hall: 'Grand Hall'
    },
    {
        id: '14',
        description: 'Торжественный ужин по случаю награждения лучших сотрудников компании',
        createdAt: new Date('2024-11-01T11:15:00'),
        author: 'Михаил Орлов',
        photoLink: '/imges/avatar2.png',
        title: 'Церемония награждения',
        date: new Date('2024-12-08T18:30:00'),
        guestsCount: 60,
        eventType: 'award',
        status: 'confirmed',
        hall: 'Business Center'
    },
    {
        id: '15',
        description: 'Знакомство с новыми продуктами компании для партнеров и клиентов',
        createdAt: new Date('2024-11-03T14:20:00'),
        author: 'Виктор Новиков',
        photoLink: '/imges/avatar1.png',
        title: 'Презентация продукта',
        date: new Date('2024-12-17T11:00:00'),
        guestsCount: 80,
        eventType: 'presentation',
        status: 'draft',
        hall: 'Conference Hall'
    },
    {
        id: '16',
        description: 'Благотворительный вечер с аукционом в поддержку детского фонда',
        createdAt: new Date('2024-11-07T10:45:00'),
        author: 'Екатерина Воробьева',
        photoLink: '/imges/avatar2.png',
        title: 'Благотворительный вечер',
        date: new Date('2024-12-19T19:00:00'),
        guestsCount: 100,
        eventType: 'charity',
        status: 'confirmed',
        hall: 'Grand Hall'
    },
    {
        id: '17',
        description: 'Дегустация вин с комментариями сомелье и легкими закусками',
        createdAt: new Date('2024-11-09T18:30:00'),
        author: 'Павел Семенов',
        photoLink: '/imges/avatar1.png',
        title: 'Дегустация вин',
        date: new Date('2024-12-21T20:00:00'),
        guestsCount: 30,
        eventType: 'tasting',
        status: 'processing',
        hall: 'VIP Room'
    },
    {
        id: '18',
        description: 'Спортивный просмотр матча на большом экране с пиццей и напитками',
        createdAt: new Date('2024-11-11T15:40:00'),
        author: 'Алексей Фролов',
        photoLink: '/imges/avatar2.png',
        title: 'Просмотр футбольного матча',
        date: new Date('2024-12-23T21:00:00'),
        guestsCount: 50,
        eventType: 'sports',
        status: 'confirmed',
        hall: 'Family Room'
    },
    {
        id: '19',
        description: 'Творческая встреча с известным писателем и автограф-сессия',
        createdAt: new Date('2024-11-14T17:25:00'),
        author: 'Марина Григорьева',
        photoLink: '/imges/avatar1.png',
        title: 'Встреча с писателем',
        date: new Date('2024-12-26T18:00:00'),
        guestsCount: 70,
        eventType: 'literary',
        status: 'draft',
        hall: 'Conference Hall'
    },
    {
        id: '20',
        description: 'Празднование Нового года с диджеем, фейерверком и праздничным меню',
        createdAt: new Date('2024-11-16T20:15:00'),
        author: 'Денис Павлов',
        photoLink: '/imges/avatar2.png',
        title: 'Новогодняя вечеринка',
        date: new Date('2024-12-31T22:00:00'),
        guestsCount: 150,
        eventType: 'newyear',
        status: 'confirmed',
        hall: 'Grand Hall'
    },
    {
        id: '21',
        description: 'Мастер-класс по приготовлению суши от шеф-повара ресторана',
        createdAt: new Date('2024-11-19T13:50:00'),
        author: 'Юлия Захарова',
        photoLink: '/imges/avatar1.png',
        title: 'Мастер-класс по суши',
        date: new Date('2024-12-16T17:00:00'),
        guestsCount: 20,
        eventType: 'masterclass',
        status: 'processing',
        hall: 'Studio'
    },
    {
        id: '22',
        description: 'Поэтический вечер с выступлениями местных поэтов и музыкантов',
        createdAt: new Date('2024-11-21T19:05:00'),
        author: 'Артем Белов',
        photoLink: '/imges/avatar2.png',
        title: 'Поэтический вечер',
        date: new Date('2024-12-27T19:30:00'),
        guestsCount: 40,
        eventType: 'poetry',
        status: 'confirmed',
        hall: 'Conference Hall'
    }
];

// Создаем глобальный экземпляр коллекции
const objCollection = new ObjCollection(initialObjects);

// Экспортируем для использования в других файлах и тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ObjCollection, objCollection };
}

// Для удобства тестирования в консоли браузера
window.objCollection = objCollection;

console.log('Коллекция объектов инициализирована');
console.log('Количество объектов:', objCollection.getCount());
console.log('Статистика:', objCollection.getStats());
console.log('');
console.log('Доступные методы для тестирования из консоли:');
console.log('1. objCollection.getObjs(skip, top, filterConfig)');
console.log('2. objCollection.getObj(id)');
console.log('3. objCollection.validateObj(obj)');
console.log('4. objCollection.addObj(obj)');
console.log('5. objCollection.editObj(id, updatedFields)');
console.log('6. objCollection.removeObj(id)');
console.log('7. objCollection.addAll(objects)');
console.log('8. objCollection.clear()');
console.log('9. objCollection.getCount()');
console.log('10. objCollection.search(query)');
console.log('11. objCollection.getStats()');
console.log('');
console.log('Примеры вызовов:');
console.log('- objCollection.getObjs(0, 5)');
console.log('- objCollection.getObjs(0, 10, {author: "Мария"})');
console.log('- objCollection.getObjs(0, 10, {eventType: "wedding", status: "confirmed"})');
console.log('- objCollection.editObj("1", {description: "Новое описание"})');
console.log('- objCollection.removeObj("20")');