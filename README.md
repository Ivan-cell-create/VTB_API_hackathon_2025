# Хакатон от ВТБ банка

## Структура файлов

```md
peredelka/
├── backend/
│   ├── app.py              # FastAPI + Spectral + Bandit + xAI
│   ├── requirements.txt
│   └── Dockerfile         
├── frontend/
│   ├── Dockerfile     
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AnalyzePage.jsx
│   │   │   ├── ReportPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── DocsPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── components/
│   │   │   ├── CodeEditorModal.jsx
│   │   │   └── CodeEditorModal.module.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── docs/
│   │       ├── user-guide.md
|   |       ├── api-docs.md
│   │       └── cicd.md
│   ├── index.html
│   └── vite.config.js
├── docker-compose.yaml
├── nginx.conf
├── .env.example
└── README.md                 
```
