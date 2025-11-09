// frontend/src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit2, AlertCircle, CheckCircle,
  Code, Settings, Loader2, FileCode
} from 'lucide-react';
import CodeEditorModal from '../components/CodeEditorModal';

export default function SettingsPage() {
  const [plugins, setPlugins] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState(null);
  const [modalName, setModalName] = useState('');
  const [modalCode, setModalCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const res = await fetch('/api/plugins');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlugins(data.plugins || []);
    } catch (err) {
      setError('Не удалось загрузить плагины');
    }
  };

  const handleCreate = () => {
    setEditingPlugin(null);
    setModalName('');
    setModalCode(`def analyze(spec):\n    \"\"\"\n    Анализирует OpenAPI спецификацию.\n    Должен вернуть список словарей: [{'code': '...', 'severity': '...', 'message': '...'}]\n    \"\"\"\n    findings = []\n    # Ваш код здесь\n    return findings`);
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleEdit = async (name) => {
    try {
      const res = await fetch(`/api/plugins/${name}`);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setEditingPlugin(name);
      setModalName(name);
      setModalCode(text);
      setModalOpen(true);
      setError('');
      setSuccess('');
    } catch {
      setError('Не удалось загрузить код плагина');
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`Удалить плагин "${name}"?`)) return;

    try {
      const res = await fetch(`/api/plugins/${name}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error();
      setSuccess(`Плагин "${name}" удалён`);
      fetchPlugins();
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Не удалось удалить плагин');
    }
  };

  const handleSavePlugin = async (name, code) => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    // Валидация
    if (!name.trim()) {
      setError('Введите имя плагина');
      setIsSaving(false);
      return;
    }
    if (!code.trim()) {
      setError('Код не может быть пустым');
      setIsSaving(false);
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      setError('Имя: только буквы, цифры, _, -');
      setIsSaving(false);
      return;
    }

    const blob = new Blob([code], { type: 'text/python' });
    const file = new File([blob], `${name}.py`, { type: 'text/python' });
    const formData = new FormData();
    formData.append('plugin_file', file);

    try {
      let url = '/api/plugins';
      let method = 'POST';

      if (editingPlugin) {
        url = `/api/plugins/${name}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Ошибка сервера');
      }

      setSuccess(editingPlugin ? 'Плагин обновлён!' : 'Плагин создан!');
      fetchPlugins();
      setTimeout(() => {
        setModalOpen(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Настройки
          </h1>
          <p className="text-xl opacity-90">Управление плагинами анализа</p>
        </div>

        {/* Создать новый */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleCreate}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Создать плагин
          </button>
        </div>

        {/* Уведомления */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900 bg-opacity-60 backdrop-blur-xl rounded-xl border border-red-700 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-emerald-900 bg-opacity-60 backdrop-blur-xl rounded-xl border border-emerald-700 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <p className="text-emerald-300">{success}</p>
          </div>
        )}

        {/* Список плагинов */}
        <div className="max-w-5xl mx-auto">
          {plugins.length === 0 ? (
            <div className="text-center py-16">
              <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl text-gray-400">Плагинов пока нет</p>
              <p className="text-sm text-gray-500 mt-2">Создайте первый плагин для кастомного анализа</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {plugins.map(name => (
                <div
                  key={name}
                  className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-xl p-5 border border-purple-700 flex items-center justify-between hover:border-purple-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Code className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-lg font-bold text-purple-300">{name}</h3>
                      <p className="text-sm text-gray-400">Кастомный Python-плагин</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(name)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                      title="Редактировать"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(name)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модальное окно */}
        <CodeEditorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingPlugin ? 'Редактировать плагин' : 'Создать плагин'}
          initialName={modalName}
          initialCode={modalCode}
          onSave={handleSavePlugin}
          isSaving={isSaving}
          error={error}
          success={success}
        />
      </div>
    </div>
  );
}