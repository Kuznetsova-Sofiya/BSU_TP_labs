class EventCollection {
    constructor(events = []) {
        this._events = events;
        this._storageKey = 'eventCollection'; // Ключ для LocalStorage
        
        // Автоматически восстанавливаем из LocalStorage
        this.restore();
        this._sortEvents();
    }

    // Сохранить в LocalStorage
    save() {
        try {
            const dataToSave = {
                events: this._events.map(event => ({
                    ...event,
                    createdAt: event.createdAt.toISOString(),
                    date: event.date.toISOString()
                })),
                version: '1.0',
                savedAt: new Date().toISOString(),
                count: this._events.length
            };
            
            localStorage.setItem(this._storageKey, JSON.stringify(dataToSave));
            console.log(`Сохранено в LocalStorage: ${this._events.length} мероприятий`);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в LocalStorage:', error);
            return false;
        }
    }

    // Восстановить из LocalStorage
    restore() {
        try {
            const savedData = localStorage.getItem(this._storageKey);
            
            if (!savedData) {
                console.log('LocalStorage пуст, используются начальные данные');
                // Сохраняем начальные данные
                this.save();
                return false;
            }

            const parsedData = JSON.parse(savedData);
            
            // Восстанавливаем объекты с преобразованием дат
            const restoredEvents = parsedData.events.map(eventData => ({
                ...eventData,
                createdAt: new Date(eventData.createdAt),
                date: new Date(eventData.date)
            }));

            // Проверяем валидность
            const validEvents = restoredEvents.filter(event => this._validateEvent(event));
            
            if (validEvents.length !== restoredEvents.length) {
                console.warn(`Некоторые мероприятия не прошли валидацию: ${restoredEvents.length - validEvents.length} шт.`);
            }

            this._events = validEvents;
            
            console.log(`Восстановлено из LocalStorage: ${this._events.length} мероприятий`);
            return true;
        } catch (error) {
            console.error('Ошибка восстановления из LocalStorage:', error);
            return false;
        }
    }

    // Приватный метод для сортировки
    _sortEvents() {
        this._events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Приватный метод валидации (остаётся без изменений)
    _validateEvent(event) {
        if (!event.id || typeof event.id !== 'string') return false;
        if (!event.description || typeof event.description !== 'string' || event.description.length > 200) return false;
        if (!event.createdAt || !(event.createdAt instanceof Date)) return false;
        if (!event.author || typeof event.author !== 'string' || event.author.trim() === '') return false;
        
        // Проверка дополнительных полей
        if (event.photoLink && typeof event.photoLink !== 'string') return false;
        if (event.title && typeof event.title !== 'string') return false;
        if (event.date && !(event.date instanceof Date)) return false;
        if (event.guestsCount && typeof event.guestsCount !== 'number') return false;
        if (event.eventType && typeof event.eventType !== 'string') return false;
        if (event.status && typeof event.status !== 'string') return false;
        
        return true;
    }

    // Получить мероприятия с пагинацией и фильтрацией (остаётся без изменений)
    getEvents(skip = 0, top = 10, filterConfig = {}) {
        let filteredEvents = [...this._events];
        
        // Применяем фильтры
        if (filterConfig.author) {
            filteredEvents = filteredEvents.filter(event => 
                event.author.toLowerCase().includes(filterConfig.author.toLowerCase())
            );
        }
        
        if (filterConfig.eventType) {
            filteredEvents = filteredEvents.filter(event => 
                event.eventType === filterConfig.eventType
            );
        }
        
        if (filterConfig.status) {
            filteredEvents = filteredEvents.filter(event => 
                event.status === filterConfig.status
            );
        }
        
        if (filterConfig.dateFrom) {
            filteredEvents = filteredEvents.filter(event => 
                new Date(event.date) >= new Date(filterConfig.dateFrom)
            );
        }
        
        if (filterConfig.dateTo) {
            filteredEvents = filteredEvents.filter(event => 
                new Date(event.date) <= new Date(filterConfig.dateTo)
            );
        }
        
        // Применяем пагинацию
        return filteredEvents.slice(skip, skip + top);
    }

    // Получить мероприятие по ID (остаётся без изменений)
    getEvent(id) {
        return this._events.find(event => event.id === id);
    }

    // Проверить валидность мероприятия (остаётся без изменений)
    validateEvent(event) {
        return this._validateEvent(event);
    }

    // Добавить мероприятие (с автоматическим сохранением в LocalStorage)
    addEvent(event) {
        console.log('EventCollection.addEvent вызван:', event.id);
        
        if (!this._validateEvent(event)) {
            console.error('Валидация не пройдена');
            return false;
        }
        
        // Проверяем уникальность ID
        if (this._events.some(e => e.id === event.id)) {
            console.error('ID уже существует:', event.id);
            return false;
        }
        
        this._events.push(event);
        this._sortEvents();
        
        // Автоматически сохраняем в LocalStorage
        const saveResult = this.save();
        console.log('Сохранение в LocalStorage:', saveResult ? 'успешно' : 'ошибка');
        
        console.log(`Мероприятие с ID "${event.id}" успешно добавлено`);
        return true;
    }

    // Редактировать мероприятие (с автоматическим сохранением в LocalStorage)
    editEvent(id, updatedFields) {
        const eventIndex = this._events.findIndex(event => event.id === id);
        if (eventIndex === -1) return false;
        
        // Создаем обновленный объект
        const updatedEvent = {
            ...this._events[eventIndex],
            ...updatedFields,
            // Запрещаем изменение этих полей
            id: this._events[eventIndex].id,
            author: this._events[eventIndex].author,
            createdAt: this._events[eventIndex].createdAt
        };
        
        if (!this._validateEvent(updatedEvent)) return false;
        
        this._events[eventIndex] = updatedEvent;
        this._sortEvents();
        
        // Автоматически сохраняем в LocalStorage
        this.save();
        
        console.log(`Мероприятие с ID "${id}" успешно обновлено`);
        return true;
    }

    // Удалить мероприятие (с автоматическим сохранением в LocalStorage)
    removeEvent(id) {
        const eventIndex = this._events.findIndex(event => event.id === id);
        if (eventIndex === -1) return false;
        
        this._events.splice(eventIndex, 1);
        
        // Автоматически сохраняем в LocalStorage
        this.save();
        
        console.log(`Мероприятие с ID "${id}" успешно удалено`);
        return true;
    }

    // Добавить несколько мероприятий (с автоматическим сохранением в LocalStorage)
    addAll(events) {
        const invalidEvents = [];
        
        events.forEach(event => {
            if (!this.addEvent(event)) {
                invalidEvents.push(event);
            }
        });
        
        console.log(`Добавлено мероприятий: ${events.length - invalidEvents.length}`);
        return invalidEvents;
    }

    // Очистить коллекцию (и LocalStorage)
    clear() {
        console.log('Очистка коллекции мероприятий');
        this._events = [];
        
        // Очищаем LocalStorage
        localStorage.removeItem(this._storageKey);
    }

    // Получить все мероприятия (остаётся без изменений)
    getAllEvents() {
        return [...this._events];
    }

    // Получить количество мероприятий (остаётся без изменений)
    getCount() {
        return this._events.length;
    }

    // Экспортировать данные в файл
    exportToFile() {
        try {
            const data = {
                events: this._events,
                exportedAt: new Date().toISOString(),
                count: this._events.length
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = 'events-backup-' + new Date().toISOString().split('T')[0] + '.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            console.log('Данные экспортированы в файл');
            return true;
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            return false;
        }
    }

    // Импортировать данные из файла
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    if (!importedData.events || !Array.isArray(importedData.events)) {
                        reject(new Error('Некорректный формат файла'));
                        return;
                    }

                    // Преобразуем даты
                    const eventsWithDates = importedData.events.map(event => ({
                        ...event,
                        createdAt: new Date(event.createdAt),
                        date: new Date(event.date)
                    }));

                    const invalidEvents = this.addAll(eventsWithDates);
                    
                    if (invalidEvents.length === 0) {
                        console.log(`Импортировано мероприятий: ${eventsWithDates.length}`);
                    } else {
                        console.warn(`Импортировано с ошибками. ${invalidEvents.length} событий не добавлено.`);
                    }
                    
                    resolve(invalidEvents);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
}

// Инициализация данных
const initialEvents = [
    {
        id: '1',
        title: 'Свадьба Марии и Алексея',
        description: 'Торжественная церемония и банкет',
        createdAt: new Date('2024-11-15T10:00:00'),
        author: 'Мария Иванова',
        photoLink: '/imges/avatar1.png',
        date: new Date('2024-12-15T18:00:00'),
        guestsCount: 120,
        eventType: 'wedding',
        status: 'confirmed',
        hall: 'Grand Hall',
        menu: [],
        services: []
    },
    {
        id: '2',
        title: 'Корпоратив ООО "Технологии"',
        description: 'Новогодний корпоратив для сотрудников',
        createdAt: new Date('2024-11-10T14:30:00'),
        author: 'Петр Сидоров',
        photoLink: '/imges/avatar2.png',
        date: new Date('2024-12-20T19:00:00'),
        guestsCount: 80,
        eventType: 'corporate',
        status: 'processing',
        hall: 'Business Center',
        menu: [],
        services: []
    },
    {
        id: '3',
        title: 'Юбилей Анны Петровны',
        description: 'Торжество по случаю 50-летия',
        createdAt: new Date('2024-11-12T09:15:00'),
        author: 'Сергей Ковалев',
        photoLink: '/imges/avatar1.png',
        date: new Date('2024-12-10T17:00:00'),
        guestsCount: 60,
        eventType: 'birthday',
        status: 'confirmed',
        hall: 'Grand Hall',
        menu: [],
        services: []
    },
    {
        id: '4',
        title: 'Выпускной вечер',
        description: 'Торжественный выпускной для студентов',
        createdAt: new Date('2024-11-08T16:45:00'),
        author: 'Елена Смирнова',
        photoLink: '/imges/avatar2.png',
        date: new Date('2024-12-25T16:00:00'),
        guestsCount: 200,
        eventType: 'graduation',
        status: 'draft',
        hall: 'Grand Hall',
        menu: [],
        services: []
    },
    {
        id: '5',
        title: 'Бизнес-конференция',
        description: 'Ежегодная отраслевая конференция',
        createdAt: new Date('2024-11-05T11:20:00'),
        author: 'Андрей Волков',
        photoLink: '/imges/avatar1.png',
        date: new Date('2024-12-18T09:00:00'),
        guestsCount: 150,
        eventType: 'conference',
        status: 'confirmed',
        hall: 'Business Center',
        menu: [],
        services: []
    },
    {
        id: '6',
        title: 'Детский день рождения',
        description: 'Праздник для детей с анимацией',
        createdAt: new Date('2024-11-20T13:10:00'),
        author: 'Ольга Новикова',
        photoLink: '/imges/avatar2.png',
        date: new Date('2024-12-22T15:00:00'),
        guestsCount: 25,
        eventType: 'kids',
        status: 'processing',
        hall: 'Family Room',
        menu: [],
        services: []
    },
    {
        id: '7',
        title: 'Романтический ужин',
        description: 'Частное мероприятие для двоих',
        createdAt: new Date('2024-11-18T20:30:00'),
        author: 'Дмитрий Козлов',
        photoLink: '/imges/avatar1.png',
        date: new Date('2024-12-14T20:00:00'),
        guestsCount: 2,
        eventType: 'romantic',
        status: 'confirmed',
        hall: 'VIP Room',
        menu: [],
        services: []
    },
    {
        id: '8',
        title: 'Семинар по маркетингу',
        description: 'Обучающий семинар для предпринимателей',
        createdAt: new Date('2024-11-22T08:45:00'),
        author: 'Ирина Федорова',
        photoLink: '/imges/avatar2.png',
        date: new Date('2024-12-28T10:00:00'),
        guestsCount: 50,
        eventType: 'seminar',
        status: 'draft',
        hall: 'Conference Hall',
        menu: [],
        services: []
    },
    {
        id: '9',
        title: 'Фотосессия',
        description: 'Профессиональная фотосессия в интерьерах',
        createdAt: new Date('2024-11-25T15:20:00'),
        author: 'Александр Попов',
        photoLink: '/imges/avatar1.png',
        date: new Date('2024-12-30T14:00:00'),
        guestsCount: 5,
        eventType: 'photo',
        status: 'confirmed',
        hall: 'Studio',
        menu: [],
        services: []
    },
    {
        id: '10',
        title: 'Встреча выпускников',
        description: 'Ежегодная встреча выпускников университета',
        createdAt: new Date('2024-11-28T17:35:00'),
        author: 'Наталья Морозова',
        photoLink: '/imges/avatar2.png',
        date: new Date('2024-12-29T19:00:00'),
        guestsCount: 100,
        eventType: 'alumni',
        status: 'processing',
        hall: 'Grand Hall',
        menu: [],
        services: []
    }
];

// Создаем экземпляр коллекции
const eventCollection = new EventCollection(initialEvents);