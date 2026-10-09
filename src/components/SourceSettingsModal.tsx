import React, { useState, useEffect } from 'react';
import { X, Check, Globe } from 'lucide-react';
import { NewsSource } from '../types';

interface SourceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: NewsSource[];
  enabledSourceIds: string[];
  onToggleSource: (sourceId: string) => void;
  onSelectAll: () => void;
  onResetDefaults: () => void;
}

export const SourceSettingsModal: React.FC<SourceSettingsModalProps> = ({
  isOpen,
  onClose,
  sources,
  enabledSourceIds,
  onToggleSource,
  onSelectAll,
  onResetDefaults,
}) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    } else if (isRendered) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 250);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, isVisible]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity duration-250 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-[#15161A] border border-stone-300 dark:border-stone-800 rounded-none max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transform transition-all duration-250 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Nastavení sledovaných médií
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Vyberte, které české deníky a servery se mají zobrazovat ve vašem feedu.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-none cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tools */}
        <div className="px-5 sm:px-6 py-2.5 bg-stone-50 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">
            Aktivní zdroje: <strong className="text-stone-800 dark:text-stone-200 font-mono tabular-nums">{enabledSourceIds.length}</strong> z {sources.length}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-semibold cursor-pointer underline"
            >
              Vybrat vše
            </button>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <button
              onClick={onResetDefaults}
              className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-semibold cursor-pointer underline"
            >
              Výchozí nastavení
            </button>
          </div>
        </div>

        {/* Source List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {sources.map((source) => {
            const isEnabled = enabledSourceIds.includes(source.id);
            return (
              <div
                key={source.id}
                onClick={() => onToggleSource(source.id)}
                className={`p-3.5 sm:p-4 rounded-none border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isEnabled
                    ? 'border-stone-400 dark:border-stone-600 bg-stone-50/70 dark:bg-stone-900/40'
                    : 'border-stone-200 dark:border-stone-800 bg-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-none mt-1.5 shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        {source.name}
                      </span>
                      <a
                        href={source.siteUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                        title="Otevřít web"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                      {source.description}
                    </p>
                  </div>
                </div>

                {/* Custom Checkbox Toggle */}
                <div
                  className={`w-5 h-5 rounded-none flex items-center justify-center shrink-0 mt-1 transition-colors ${
                    isEnabled
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'border border-stone-300 dark:border-stone-700 bg-transparent'
                  }`}
                >
                  {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end bg-stone-50/80 dark:bg-stone-900/40">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 rounded-none hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Hotovo ({enabledSourceIds.length} aktivních)
          </button>
        </div>
      </div>
    </div>
  );
};
