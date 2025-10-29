import React from "react";
import { motion } from "framer-motion";
import { Shield, BarChart2, Calendar, Zap } from "lucide-react";

export default function ReportPage() {
  const placeholderStats = [
    { label: "Найденные уязвимости", value: "Здесь будет число уязвимостей из БД", icon: <Shield style={{ color: "#ef4444" }} /> },
    { label: "Общее количество эндпоинтов", value: "Здесь будет количество эндпоинтов", icon: <BarChart2 style={{ color: "#3b82f6" }} /> },
    { label: "Дата последнего сканирования", value: "Здесь будет дата из БД", icon: <Calendar style={{ color: "#facc15" }} /> },
    { label: "Рекомендации", value: "Здесь будут рекомендации по исправлению", icon: <Zap style={{ color: "#22c55e" }} /> },
  ];

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <motion.h1
        style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Отчёт
      </motion.h1>

      <motion.p
        style={{ textAlign: "center", color: "#cbd5e1", marginBottom: "24px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Здесь появится визуализация найденных уязвимостей и статистика. Пока отображаются заглушки.
      </motion.p>

      <motion.div
        style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {placeholderStats.map((stat, index) => (
          <div key={index} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {stat.icon}
              <span className="card-title" style={{ fontWeight: 600, color: "#f9fafb" }}>{stat.label}</span>
            </div>
            <div className="card-content" style={{ color: "#cbd5e1", fontSize: "14px" }}>{stat.value}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
