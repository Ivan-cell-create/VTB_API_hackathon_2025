import React from "react";
import { motion } from "framer-motion";
import { Shield, BarChart2, Calendar, Zap } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

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

          {/* ФУТЕР — В ЕДИНОМ СТИЛЕ С ТЕМОЙ (тёмный + зелёный акцент) */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{
          marginTop: "5rem",
          padding: "2.5rem 1rem",
          backgroundColor: "#1a1a1a", 
          borderTop: "1px solid #2c2c2c", 
          color: "#cbd5e1",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          {/* Заголовок с зелёным акцентом */}
          <h3 style={{ 
            fontSize: "1.5rem", 
            fontWeight: 700, 
            marginBottom: "0.75rem", 
            color: "#22c55e", 
          }}>
            API Analyzer
          </h3>
      
          <p style={{ 
            fontSize: "0.9rem", 
            color: "#94a3b8", 
            marginBottom: "1.5rem",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            Автоматический анализ безопасности и соответствия API
          </p>
      
          {/* Ссылки */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "2rem", 
            marginBottom: "1.5rem", 
            flexWrap: "wrap",
            fontSize: "0.9rem"
          }}>
            <a
              href="https://github.com/Ivan-cell-create/VTB_API_hackathon_2025"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#cbd5e1",
                textDecoration: "none",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#22c55e"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#cbd5e1"}
            >
              <FaGithub size={18} />
              <span>Исходный код</span>
            </a>
      
            <a
              href="mailto:zhukov28032006@mail.ru"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#cbd5e1",
                textDecoration: "none",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#22c55e"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#cbd5e1"}
            >
              <MdEmail size={18} />
              <span>zhukov28032006@mail.ru</span>
            </a>
          </div>
      
          {/* Копирайт */}
          <div style={{ 
            fontSize: "0.8rem", 
            color: "#64748b", 
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #2c2c2c"
          }}>
            <p style={{ margin: 0 }}>
              © 2025 <span style={{ color: "#22c55e" }}>Ivan Zhukov</span> | VTB API Hackathon 2025
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem" }}>
              Open Source • MIT License
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
