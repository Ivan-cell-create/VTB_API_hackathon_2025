// frontend/src/components/CodeEditorModal.jsx
import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import styles from './CodeEditorModal.module.css';

export default function CodeEditorModal({
  isOpen,
  onClose,
  title = "Редактировать код",
  initialName = "",
  initialCode = "",
  onSave,
  isSaving = false,
  error = "",
  success = "",
  namePlaceholder = "plugin-name"
}) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setCode(initialCode);
    }
  }, [isOpen, initialName, initialCode]);

  const handleSave = () => {
    if (!name.trim() || !code.trim()) return;
    onSave(name, code);
  };

  const handleClose = () => {
    setName("");
    setCode("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Name */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              className={styles.inputField}
              disabled={isSaving}
            />
            <p className={styles.inputHint}>
              Только буквы, цифры, дефис, подчёркивание
            </p>
          </div>

          {/* Code Editor */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Python код</label>
            <div className={styles.editorWrapper}>
              <CodeEditor
                value={code}
                language="python"
                placeholder="# Напишите функцию analyze(spec)"
                onChange={(e) => setCode(e.target.value)}
                padding={16}
                disabled={isSaving}
                style={{
                  fontFamily: 'ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace',
                  fontSize: 14,
                  backgroundColor: '#1a1a1a',
                  color: '#e2e8f0',
                  minHeight: '400px'
                }}
              />
            </div>
            <p className={styles.editorHint}>
              Функция <code className="bg-gray-800 px-1 rounded">analyze(spec)</code> должна возвращать список словарей
            </p>
          </div>

          {/* Status */}
          {error && (
            <div className={styles.statusError}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div className={styles.statusSuccess}>
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-200">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            onClick={handleClose}
            className={styles.btnSecondary}
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !code.trim()}
            className={styles.btnPrimary}
          >
            {isSaving ? (
              <span className={styles.btnSaving}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}