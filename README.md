# VTB_API_hackathon_2025


## Файловая структура

```md
api-analyzer/
│
├── frontend/                    # React-приложение
│   ├── src/
│   │   ├── components/          # UI-компоненты (карточки, таблицы, графики)
│   │   ├── pages/               # Вкладки интерфейса
│   │   │   ├── AnalyzePage.jsx  # Основной анализ API
│   │   │   ├── ReportPage.jsx   # Отчёты, графики, статистика
│   │   │   ├── DocsPage.jsx     # Документация и интеграция (CLI, API)ц
│   │   │   ├── AboutPage.jsx    # Проблематика и цели
│   │   │   └── SettingsPage.jsx # Настройки / плагины (опционально)
│   │   ├── App.jsx              # Роутинг и Tabs
│   │   ├── main.jsx             # Точка входа
│   │   ├── index.css            # Глобальные стили
│   │   └── api/                 # Работа с backend API
│   │       └── apiClient.js
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├──backend/
|  └── src/
|      └── main/
|          ├── java/
|          │   └── com/example/apianalyzer/          # Основной Java-пакет приложения
|          │       ├── controller/                   # Контроллеры (REST endpoints)
|          │       │   └── AnalyzeController.java    # Отвечает за API-запросы с фронта
|          │       ├── service/                      # Слой бизнес-логики
|          │       │   ├── ApiAnalyzerService.java   # Основная логика анализа API
|          │       │   ├── SwaggerParserService.java # Парсинг Swagger/OpenAPI спецификаций
|          │       │   └── VulnerabilityService.java # Работа с уязвимостями (загрузка из api.json)
|          │       ├── model/                        # Модели данных (DTO, сущности)
|          │       │   ├── ApiVulnerability.java     # Модель уязвимости API
|          │       │   ├── AnalysisResult.java       # Результаты анализа API
|          │       │   └── ApiSpec.java              # Структура спецификации API (если нужно)
|          │       ├── util/                         # Утилиты и вспомогательные классы
|          │       │   └── JsonUtils.java            # Работа с JSON (чтение api.json)
|          │       └── ApiAnalyzerApplication.java   # Точка входа Spring Boot приложения (main class)
|          ├── resources/                            # Ресурсы (не код, а конфигурации и данные)
|          │   ├── application.yml                   # Настройки Spring Boot (порт, имя приложения и т.п.)
|          │   ├── api.json                          # Данные об уязвимостях (загружаются при старте)
│          │   └── logback-spring.xml                # Конфигурация логирования (опционально)
│          │
|          ├── pom.xml                               # Maven-конфигурация (зависимости, плагины)
|          └── Dockerfile                                            
├── docker-compose.yml                                    
├── README.md                                             
└── .gitignore                                            