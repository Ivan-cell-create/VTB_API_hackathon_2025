import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Link as LinkIcon, Database } from "lucide-react";

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
    </div>
  );
}
