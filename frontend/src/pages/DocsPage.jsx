import React from "react";
import { motion } from "framer-motion";
import { Terminal, Code, GitBranch } from "lucide-react";

export default function DocsPage() {
  const placeholderDocs = [
    { title: "CLI", description: "Здесь будет описание команд CLI и их параметров.", icon: <Terminal style={{ color: "#22c55e" }} /> },
    { title: "API", description: "Здесь будут примеры запросов и ответов API.", icon: <Code style={{ color: "#3b82f6" }} /> },
    { title: "CI/CD", description: "Здесь будут инструкции по интеграции в пайплайны DevOps.", icon: <GitBranch style={{ color: "#facc15" }} /> },
  ];

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <motion.h1
        style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Документация и интеграция
      </motion.h1>

      <motion.div
        style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {placeholderDocs.map((doc, index) => (
          <div key={index} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {doc.icon}
              <span className="card-title" style={{ fontWeight: 600, color: "#f9fafb" }}>{doc.title}</span>
            </div>
            <div className="card-content" style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6 }}>
              {doc.description}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
