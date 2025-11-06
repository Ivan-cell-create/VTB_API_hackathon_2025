// frontend/src/pages/AnalyzePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link, Loader2, AlertCircle, CheckCircle, XCircle, Brain, FileText, Globe, Settings, ChevronRight } from 'lucide-react';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [availablePlugins, setAvailablePlugins] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [analysisId, setAnalysisId] = useState(null);

  // Загрузка списка плагинов
  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const res = await fetch('/api/plugins');
      const data = await res.json();
      setAvailablePlugins(data.plugins || []);
    } catch (err) {
      console.error('Failed to load plugins');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 2 * 1024 * 1024) {
        setError('Файл слишком большой (макс. 2 МБ)');
        return;
      }
      if (!selected.name.match(/\.(yaml|yml|json)$/i)) {
        setError('Поддерживаются только YAML/JSON файлы');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const validateUrl = (input) => {
    try {
      const urlObj = new URL(input);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProgress(0);
    setLoading(true);

    if (!url && !file) {
      setError('Укажите URL или загрузите файл');
      setLoading(false);
      return;
    }

    if (url && !validateUrl(url)) {
      setError('Некорректный URL');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append('openapi_file', file);
    } else {
      formData.append('url', url);
    }

    plugins.forEach(p => formData.append('plugins', p));

    try {
      setProgress(20);
      const res = await fetch('/api/analyze-api', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Ошибка анализа');
      }

      setProgress(60);
      const data = await res.json();

      // AI анализ
      if (aiEnabled && file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const specText = e.target.result;
          try {
            const aiForm = new FormData();
            aiForm.append('spec_data', specText.substring(0, 15000));
            const aiRes = await fetch('/api/ai-analyze', {
              method: 'POST',
              body: aiForm,
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              data.ai_insights = aiData.ai_insights;
            }
          } catch (aiErr) {
            console.error('AI analysis failed', aiErr);
          } finally {
            finalizeAnalysis(data);
          }
        };
        reader.readAsText(file);
      } else {
        finalizeAnalysis(data);
      }
    } catch (err) {
      setError(err.message || 'Не удалось выполнить анализ');
      setLoading(false);
    }
  };

  const finalizeAnalysis = (data) => {
    setProgress(90);
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    setAnalysisId(id);
    
    // Сохраняем в localStorage
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    history.unshift({
      id,
      timestamp: new Date().toISOString(),
      summary: data.summary,
      total: data.total,
      critical: data.critical,
      high: data.high,
      url: url || file?.name,
      plugins: data.plugins,
      issues: data.issues,
      truncated: data.truncated,
      ai_insights: data.ai_insights || []
    });
    localStorage.setItem('analysis_history', JSON.stringify(history.slice(0, 50)));

    setTimeout(() => {
      setProgress(100);
      navigate(`/report/${id}`);
    }, 600);
  };

  const togglePlugin = (plugin) => {
    setPlugins(prev =>
      prev.includes(plugin)
        ? prev.filter(p => p !== plugin)
        : [...prev, plugin]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Анализ API
          </h1>
          <p className="text-xl opacity-90">Загрузите OpenAPI спецификацию или укажите URL</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Input Source */}
          <div className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-purple-700 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              {/* URL Input */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium mb-3 text-purple-300">
                  <Globe className="w-5 h-5" />
                  URL спецификации
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (file) setFile(null);
                  }}
                  placeholder="https://api.example.com/openapi.yaml"
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  disabled={!!file}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="flex items-center gap-2 text-lg font-medium mb-3 text-purple-300">
                  <FileText className="w-5 h-5" />
                  Или загрузите файл
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".yaml,.yml,.json"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!!url}
                  />
                  <div className="px-4 py-3 bg-gray-800 bg-opacity-50 border border-purple-600 rounded-lg flex items-center justify-between hover:bg-opacity-70 transition-all">
                    <span className="truncate pr-2">
                      {file ? file.name : 'Выберите YAML/JSON файл'}
                    </span>
                    <Upload className="w-5 h-5 flex-shrink-0" />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">Максимум 2 МБ</p>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            )}
          </div>

          {/* Plugins & AI */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Plugins */}
            <div className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-purple-700 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Плагины
                </h3>
                <span className="text-sm text-gray-400">
                  {plugins.length} из {availablePlugins.length} выбрано
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availablePlugins.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Нет доступных плагинов</p>
                ) : (
                  availablePlugins.map(plugin => (
                    <label
                      key={plugin}
                      className="flex items-center gap-3 p-3 bg-gray-800 bg-opacity-30 rounded-lg cursor-pointer hover:bg-opacity-50 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={plugins.includes(plugin)}
                        onChange={() => togglePlugin(plugin)}
                        className="w-5 h-5 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="flex-1">{plugin}</span>
                      {plugins.includes(plugin) && (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-purple-700 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  ИИ-анализ (xAI Grok)
                </h3>
                <button
                  type="button"
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiEnabled ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm opacity-90 mb-4">
                {aiEnabled
                  ? 'Grok проанализирует спецификацию на скрытые уязвимости'
                  : 'ИИ-анализ отключён'}
              </p>
              {aiEnabled && (
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>Готов к работе</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || (!url && !file)}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Анализ: {progress}%</span>
                </>
              ) : (
                <>
                  <span>Запустить анализ</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}