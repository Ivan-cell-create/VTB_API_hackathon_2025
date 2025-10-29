import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import AnalyzePage from "./pages/AnalyzePage.jsx";
import ReportPage from "./pages/Report.jsx";
import DocsPage from "./pages/DocsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

const navItems = [
  { path: "/", label: "Анализ API" },
  { path: "/report", label: "Отчёт" },
  { path: "/docs", label: "Документация" },
  { path: "/about", label: "Проблематика и цели" },
  { path: "/settings", label: "Настройки" },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<AnalyzePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}
