// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AnalyzePage from './page/AnalyzePage.jsx';
import ReportPage from './page/ReportPage.jsx';
import SettingsPage from './page/SettingsPage.jsx';
import DocsPage from './page/DocsPage.jsx';
import AboutPage from './page/AboutPage.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import './index.css';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/analyze" replace />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/analyze" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}