// frontend/src/pages/ReportPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Printer, ChevronLeft, AlertCircle, CheckCircle, Info, XCircle, Brain, Filter, X, FileText, BarChart3, PieChart, Shield, Zap } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-900', border: 'border-red-700', icon: XCircle, label: 'Критично' },
  high: { color: 'text-orange-400', bg: 'bg-orange-900', border: 'border-orange-700', icon: AlertCircle, label: 'Высокий' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-900', border: 'border-yellow-700', icon: AlertCircle, label: 'Средний' },
  low: { color: 'text-blue-400', bg: 'bg-blue-900', border: 'border-blue-700', icon: Info, label: 'Низкий' },
  info: { color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700', icon: Info, label: 'Инфо' }
};

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#6b7280'];

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [report, setReport] = useState(null);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [pluginFilter, setPluginFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIOnly, setShowAIOnly] = useState(false);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    const found = history.find(r => r.id === id);
    if (found) {
      setReport(found);
      setFilteredIssues(found.issues);
    } else {
      navigate('/analyze');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!report) return;

    let issues = [...report.issues];

    if (showAIOnly) {
      const aiIssues = (report.ai_insights || []).map(ai => ({ ...ai, isAI: true }));
      issues = aiIssues;
    }

    if (severityFilter !== 'all') {
      issues = issues.filter(i => i.severity?.toLowerCase() === severityFilter);
    }

    if (pluginFilter !== 'all') {
      issues = issues.filter(i => i.plugin === pluginFilter || (i.isAI && pluginFilter === 'xAI Grok'));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      issues = issues.filter(i => 
        i.message?.toLowerCase().includes(term) ||
        i.code?.toLowerCase().includes(term) ||
        i.path?.toLowerCase().includes(term)
      );
    }

    setFilteredIssues(issues);
  }, [report, severityFilter, pluginFilter, searchTerm, showAIOnly]);

  if (!report) return null;

  const total = report.critical + report.high + report.medium + report.low + report.info;
  const pieData = [
    { name: 'Критично', value: report.critical, fill: '#ef4444' },
    { name: 'Высокий', value: report.high, fill: '#f97316' },
    { name: 'Средний', value: report.medium, fill: '#eab308' },
    { name: 'Низкий', value: report.low, fill: '#3b82f6' },
    { name: 'Инфо', value: report.info, fill: '#6b7280' }
  ].filter(d => d.value > 0);

  const pluginData = report.plugins?.map(p => ({
    name: p.name,
    value: p.findings,
    fill: p.name === 'xAI Grok' ? '#8b5cf6' : p.name.includes('Spectral') ? '#10b981' : '#06b6d4'
  })) || [];

  const exportJSON = () => {
    const data = { ...report, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vtb-api-report-${id}.json`;
    a.click();
  };

  const exportPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      windowWidth: 1200
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`vtb-api-report-${id}.pdf`);
  };

  const printReport = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div ref={reportRef} className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад к анализу
          </button>
          <div className="flex gap-3">
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              Печать
            </button>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Отчёт по безопасности API
          </h1>
          <p className="text-xl opacity-90">
            {report.url} • {new Date(report.timestamp).toLocaleString('ru-RU')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-red-900 to-red-800 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Критические</p>
                <p className="text-4xl font-bold">{report.critical}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-400 opacity-70" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-800 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Всего проблем</p>
                <p className="text-4xl font-bold">{total}</p>
              </div>
              <Shield className="w-12 h-12 text-purple-400 opacity-70" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 to-teal-800 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-emerald-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-sm">Плагины</p>
                <p className="text-4xl font-bold">{report.plugins?.length || 0}</p>
              </div>
              <Zap className="w-12 h-12 text-emerald-400 opacity-70" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-purple-700">
            <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              По критичности
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-purple-700">
            <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              По плагинам
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pluginData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                <Bar dataKey="value" fill="#8b5cf6">
                  {pluginData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-purple-700">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Фильтры:</span>
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-lg text-sm"
            >
              <option value="all">Все уровни</option>
              {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>

            <select
              value={pluginFilter}
              onChange={(e) => setPluginFilter(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-lg text-sm"
            >
              <option value="all">Все плагины</option>
              {report.plugins?.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
              {(report.ai_insights?.length > 0) && <option value="xAI Grok">xAI Grok</option>}
            </select>

            <input
              type="text"
              placeholder="Поиск по коду/сообщению..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-lg text-sm flex-1 min-w-64"
            />

            {(report.ai_insights?.length > 0) && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAIOnly}
                  onChange={(e) => setShowAIOnly(e.target.checked)}
                  className="w-4 h-4 text-purple-500"
                />
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Только ИИ</span>
              </label>
            )}

            {(severityFilter !== 'all' || pluginFilter !== 'all' || searchTerm || showAIOnly) && (
              <button
                onClick={() => {
                  setSeverityFilter('all');
                  setPluginFilter('all');
                  setSearchTerm('');
                  setShowAIOnly(false);
                }}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
                Сбросить
              </button>
            )}
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-purple-300">
              Проблемы ({filteredIssues.length}{report.truncated ? '+' : ''})
            </h3>
            {report.truncated && (
              <p className="text-sm text-yellow-400">Показано 50 из {total}</p>
            )}
          </div>

          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Проблем с текущими фильтрами не найдено</p>
            </div>
          ) : (
            filteredIssues.map((issue, idx) => {
              const sev = issue.severity?.toLowerCase() || 'info';
              const config = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.info;
              const Icon = config.icon;

              return (
                <div
                  key={idx}
                  className={`bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-xl p-5 border ${config.border} ${issue.isAI ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`w-6 h-6 ${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-mono ${config.color}`}>{issue.code || 'AI-INSIGHT'}</span>
                          {issue.isAI && (
                            <span className="flex items-center gap-1 text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full">
                              <Brain className="w-3 h-3" />
                              Grok
                            </span>
                          )}
                          <span className="text-xs text-gray-500">• {issue.plugin || 'unknown'}</span>
                        </div>
                        <p className="text-lg font-medium mb-1">{issue.message}</p>
                        {issue.path && (
                          <p className="text-sm text-gray-400 font-mono">
                            Путь: <code className="bg-gray-800 px-2 py-1 rounded">{issue.path}</code>
                          </p>
                        )}
                        {issue.range && (
                          <p className="text-xs text-gray-500 mt-2">
                            Строки: {issue.range.start.line}-{issue.range.end.line}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
                      {config.label}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Insights */}
        {report.ai_insights?.length > 0 && !showAIOnly && (
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-6 border border-purple-700">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-7 h-7 text-purple-300" />
              <h3 className="text-xl font-bold text-purple-300">ИИ-анализ от xAI Grok</h3>
            </div>
            <div className="space-y-3">
              {report.ai_insights.map((ai, idx) => (
                <div key={idx} className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-600">
                  <div className="flex items-start gap-3">
                    <div className="text-purple-400 font-mono text-sm">{ai.code}</div>
                    <div className="flex-1">
                      <p className="font-medium">{ai.message}</p>
                    </div>
                    <div className="px-2 py-1 bg-purple-800 text-purple-200 text-xs rounded-full">
                      {SEVERITY_CONFIG[ai.severity?.toLowerCase()]?.label || 'Info'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}