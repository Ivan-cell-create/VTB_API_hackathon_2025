// frontend/src/pages/DocsPage.jsx
import { useState, useEffect } from 'react';

const docs = [
  { title: 'Работа с приложением', file: '/docs/user-guide.md' },
  { title: 'CI/CD пайплайн', file: '/docs/cicd.md' },
  { title: 'Документация API', file: '/docs/api-docs.md' }
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDoc = async (index) => {
    setLoading(true);
    setActiveTab(index);
    try {
      const res = await fetch(docs[index].file);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setContent(text);
    } catch {
      setContent(`# Документ не найден\n\`${docs[index].file}\` отсутствует в \`public/docs/\``);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoc(0);
  }, []);

  const renderMarkdown = (md) => {
    if (!md) return '';
    return md
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-indigo-400 mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-purple-300 mb-4 mt-6">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-pink-300 mb-3 mt-5">$1</h3>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm my-4">$1</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-pink-300 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
      .replace(/^- (.*$)/gm, '<li class="ml-6 mb-2 flex items-start"><span class="text-purple-400 mr-2">•</span>$1</li>')
      .replace(/\n\n/g, '</p><p class="my-4">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
          Документация
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-purple-700 pb-2">
          {docs.map((doc, i) => (
            <button
              key={i}
              onClick={() => loadDoc(i)}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
                activeTab === i
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-gray-900 bg-opacity-60 backdrop-blur-xl rounded-2xl p-8 border border-purple-700 shadow-2xl min-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl opacity-70">Загрузка документа...</div>
            </div>
          ) : (
            <article
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>
      </div>

      {/* Footer Space */}
      <div className="h-20" />
    </div>
  );
}