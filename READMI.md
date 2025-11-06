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
│   │   │   └── CodeEditorModal.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── docs/
│   │       ├── petstore.json
│   │       └── admin_leak.yaml
│   ├── index.html
│   └── vite.config.js
├── docker-compose.yaml
├── nginx.conf
├── .env.example
└── README.md                 
```
