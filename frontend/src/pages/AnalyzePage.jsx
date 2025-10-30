import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Link as LinkIcon, Database } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [openApiFile, setOpenApiFile] = useState(null);

  const placeholderResults = [
    { label: "API Name", value: "Здесь будет имя API из БД", icon: <Database style={{ color: "#22c55e" }} /> },
    { label: "Endpoints Count", value: "Здесь будет количество эндпоинтов", icon: <LinkIcon style={{ color: "#3b82f6" }} /> },
    { label: "Security Risks", value: "Здесь будут найденные уязвимости", icon: <FileText style={{ color: "#ef4444" }} /> },
    { label: "Last Scan Date", value: "Здесь будет дата последнего сканирования", icon: <Database style={{ color: "#facc15" }} /> },
  ];

  return (
    <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <motion.h1
        style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Анализ API
      </motion.h1>

      <motion.div
        className="card"
        style={{ padding: "24px", gap: "16px", marginBottom: "24px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p style={{ textAlign: "center", color: "#cbd5e1", marginBottom: "16px" }}>
          Загрузите файл OpenAPI или введите URL для анализа. Ниже отображены заглушки данных, которые позже будут подгружаться из базы данных.
        </p>

        <form style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="text"
            placeholder="Введите URL API"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            type="file"
            accept=".json,.yaml,.yml"
            onChange={(e) => setOpenApiFile(e.target.files[0])}
          />

          <button type="button" className="btn" style={{ alignSelf: "center", marginTop: "12px" }}>
            Запустить анализ
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem", color: "#f9fafb", textAlign: "center" }}>
          Заглушки данных из БД
        </h2>

        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {placeholderResults.map((item, index) => (
            <div key={index} className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {item.icon}
                <span className="card-title" style={{ fontWeight: 600, color: "#f9fafb" }}>{item.label}</span>
              </div>
              <div className="card-content" style={{ color: "#cbd5e1" }}>{item.value}</div>
            </div>
          ))}
        </div>
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
