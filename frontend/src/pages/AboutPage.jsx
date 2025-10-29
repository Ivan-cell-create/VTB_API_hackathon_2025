import React from "react";
import { motion } from "framer-motion";
//import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Bug, Zap, Layers, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-container">
      <motion.h1
        className="text-center" 
        style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Проблематика и цели проекта
      </motion.h1>

      <motion.p
        className="about-description"
        style={{ textAlign: "center", marginBottom: "2.5rem" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Современные API лежат в основе цифровых сервисов. Однако рост их числа и сложности
        приводит к увеличению уязвимостей. Разработчикам и DevOps-командам нужен инструмент,
        который автоматически анализирует безопасность API и помогает быстро устранять проблемы
        ещё до инцидентов.
      </motion.p>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {/* Проблемы */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="card">
            <div className="card-header">
              <Bug style={{ color: "#ef4444" }} />
              <span className="card-title">Проблематика</span>
            </div>
            <div className="card-content">
              <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", gap: "0.5rem", display: "flex", flexDirection: "column" }}>
                <li>Ручная проверка API занимает много времени и ресурсов.</li>
                <li>Часто уязвимости обнаруживаются уже после инцидентов.</li>
                <li>Отсутствует автоматическая проверка соответствия OpenAPI/Swagger.</li>
                <li>Нет единого инструмента, объединяющего анализ, тестирование и валидацию.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Цели */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <div className="card">
            <div className="card-header">
              <Target style={{ color: "#3b82f6" }} />
              <span className="card-title">Цели проекта</span>
            </div>
            <div className="card-content">
              <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", gap: "0.5rem", display: "flex", flexDirection: "column" }}>
                <li>Разработать инструмент анализа безопасности и корректности API.</li>
                <li>Выполнять анализ OWASP API Top 10 угроз в один клик.</li>
                <li>Проверять поведение API на соответствие спецификации OpenAPI.</li>
                <li>Предоставлять понятный отчёт с рекомендациями и уровнями риска.</li>
                <li>Интегрироваться в CI/CD-процессы DevOps.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Преимущества */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: "3rem" }}>
        <h2 className="text-center" style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          Наше решение объединяет
        </h2>

        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <div className="card">
            <div className="card-header" style={{ flexDirection: "column", alignItems: "center" }}>
              <Shield style={{ color: "#22c55e", marginBottom: "0.5rem" }} />
              <span className="card-title">Безопасность</span>
            </div>
            <div className="card-content" style={{ textAlign: "center" }}>
              Выявление уязвимостей из OWASP API Top 10 и нестандартных атак.
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ flexDirection: "column", alignItems: "center" }}>
              <Layers style={{ color: "#6366f1", marginBottom: "0.5rem" }} />
              <span className="card-title">Валидация контракта</span>
            </div>
            <div className="card-content" style={{ textAlign: "center" }}>
              Проверка реального поведения API на соответствие OpenAPI-спецификации.
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ flexDirection: "column", alignItems: "center" }}>
              <Zap style={{ color: "#facc15", marginBottom: "0.5rem" }} />
              <span className="card-title">Автоматизация</span>
            </div>
            <div className="card-content" style={{ textAlign: "center" }}>
              Интеграция в CI/CD и запуск анализа по расписанию или по коммиту.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
