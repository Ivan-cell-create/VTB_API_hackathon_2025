// frontend/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Shield, Settings, FileText, BookOpen, Info as InfoIcon } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-xl border-b border-purple-700 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/about" className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              VTB API Analyzer
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/about"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/about') ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-purple-800'
              }`}
            >
              <InfoIcon className="w-5 h-5" />
              О проекте
            </Link>
            <Link
              to="/analyze"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/analyze') ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-purple-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              Анализ
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/settings') ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-purple-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              Настройки
            </Link>
            <Link
              to="/docs"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/docs') ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-purple-800'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Документация
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}