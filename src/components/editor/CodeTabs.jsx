import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { useSandbox } from '../../hooks/useSandbox';
import { useSandboxStore } from '../../store/sandboxStore';
import { syntaxErrorLinter } from './syntaxLinter';
import { smartCloseBracketSkip } from './smartCloseBrackets';

const TABS = [
  { key: 'html', label: 'index.html', ext: html() },
  { key: 'css', label: 'styles.css', ext: css() },
  { key: 'js', label: 'script.js', ext: javascript() },
];

export default function CodeTabs() {
  const { code, setCode } = useSandbox();
  const renderedCode = useSandboxStore((s) => s.renderedCode);
  const requestRender = useSandboxStore((s) => s.requestRender);
  const [active, setActive] = useState('html');
  const tab = TABS.find((t) => t.key === active);

  const isDirty =
    code.html !== renderedCode.html ||
    code.css !== renderedCode.css ||
    code.js !== renderedCode.js;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex flex-shrink-0 border-b border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 text-sm font-mono transition-colors border-r border-gray-800 ${
              active === t.key
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto relative">
        <CodeMirror
          key={tab.key}
          value={code[tab.key]}
          height="100%"
          theme="dark"
          extensions={[tab.ext, syntaxErrorLinter, smartCloseBracketSkip]}
          onChange={(value) => setCode({ [tab.key]: value })}
          basicSetup={{ tabSize: 2 }}
          style={{ height: '100%', fontSize: 13 }}
        />
        <button
          onClick={requestRender}
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 text-sm font-semibold rounded-full shadow-lg transition-colors ${
            isDirty
              ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
              : 'bg-gray-800/90 text-gray-300 hover:bg-gray-700'
          }`}
          title="Renderiza tu código actual en la vista previa"
        >
          Ver en web
          {isDirty && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
