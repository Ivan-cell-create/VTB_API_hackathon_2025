import React from "react";
import { motion } from "framer-motion";
import { Plug, Zap, Settings } from "lucide-react";

export default function SettingsPage() {
  const placeholderSettings = [
    { label: "Плагин A", description: "Описание и статус плагина", icon: <Plug style={{ color: "#22c55e" }} /> },
    { label: "Плагин B", description: "Описание и статус плагина", icon: <Plug style={{ color: "#3b82f6" }} /> },
    { label: "Автоматический анализ", description: "Включить/выключить автоматический анализ при коммите", icon: <Zap style={{ color: "#facc15" }} /> },
  ];

  return (
    <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <motion.h1
        style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center", color: "#f9fafb" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Настройки
      </motion.h1>

      <motion.div
        style={{ display: "grid", gap: "16px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {placeholderSettings.map((setting, index) => (
          <div key={index} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {setting.icon}
              <span className="card-title" style={{ fontWeight: 600, color: "#22c55e" }}>{setting.label}</span>
            </div>
            <div className="card-content" style={{ color: "#cbd5e1", fontSize: "14px" }}>{setting.description}</div>
          </div>
        ))}
      </motion.div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button className="btn">
          Сохранить настройки
        </button>
      </div>
    </div>
  );
}
