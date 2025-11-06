// frontend/src/pages/AboutPage.jsx
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-white bg-opacity-20 rounded-full backdrop-blur-md">
          <span className="text-5xl">Search</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          VTB API Analyzer
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
          Автоматизированная система анализа безопасности API с поддержкой OWASP, валидацией контрактов и ИИ
        </p>
      </section>

      {/* Problem & Solution Cards */}
      <section className="container mx-auto px-6 mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 transform transition-all hover:scale-105">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">Warning</div>
              <h2 className="text-2xl font-bold text-amber-300">Проблематика</h2>
            </div>
            <ul className="space-y-3 text-lg opacity-95">
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-1.5">•</span>
                <span>Ручная проверка — медленная и подвержена ошибкам</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-1.5">•</span>
                <span>Нет автоматизации соответствия API контракту</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-1.5">•</span>
                <span>Слабая защита от OWASP API Top 10</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300 mt-1.5">•</span>
                <span>Отсутствие единого инструмента анализа</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 transform transition-all hover:scale-105">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">Lightbulb</div>
              <h2 className="text-2xl font-bold text-emerald-300">Решение</h2>
            </div>
            <ul className="space-y-3 text-lg opacity-95">
              <li className="flex items-start gap-2">
                <span className="text-emerald-300 mt-1.5">•</span>
                <span>Анализ в один клик или в CI/CD</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-300 mt-1.5">•</span>
                <span>Проверка OWASP API Top 10</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-300 mt-1.5">•</span>
                <span>Валидация поведения по OpenAPI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-300 mt-1.5">•</span>
                <span>Понятные отчёты с рекомендациями</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-amber-300">
          Ключевые возможности
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "Lock", title: "OWASP Top 10", desc: "BOLA, IDOR, инъекции, слабая аутентификация" },
            { icon: "FileText", title: "Валидация контракта", desc: "Сравнение поведения API с OpenAPI" },
            { icon: "Zap", title: "CI/CD интеграция", desc: "GitHub Actions, GitLab CI, CLI" },
            { icon: "BarChart3", title: "Отчёты", desc: "HTML/PDF/JSON с уровнями критичности" },
            { icon: "Plug", title: "Плагины", desc: "Расширяемая система на Python" },
            { icon: "Brain", title: "xAI Grok", desc: "ИИ-анализ уязвимостей" }
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 transform transition-all hover:scale-105 hover:bg-opacity-20"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="opacity-90">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hackathon Badge */}
      <section className="container mx-auto px-6 text-center">
        <div className="inline-flex flex-col items-center bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-2xl p-8 shadow-2xl">
          <div className="text-5xl mb-3">Trophy</div>
          <h3 className="text-2xl font-bold mb-2">VTB API Hackathon 2025</h3>
          <p className="text-lg opacity-90">Разработано за 24 часа • Готово к продакшену</p>
        </div>
      </section>

      {/* Footer Space */}
      <div className="h-20" />
    </div>
  );
}