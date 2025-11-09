# Хакатон от ВТБ банка

## Структура файлов

```md
VTB_API_hackathon_2025/
── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── utils.py
│   └── tools/
│       ├── __init__.py
│       ├── api_scanner.py     
│       ├── kiterunner.py
│       ├── zap.py
│       ├── newman.py
│       └── postman.py
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
├── flake.nix
├── .env.example
└── README.md                 
```


curl -L https://nixos.org/nix/install | sh -s -- --daemon