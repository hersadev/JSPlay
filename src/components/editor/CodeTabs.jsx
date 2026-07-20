import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { useSandbox } from '../../hooks/useSandbox';

const TABS = [
  { key: 'html', label: 'HTML', ext: html() },
  { key: 'css', label: 'CSS', ext: css() },
  { key: 'js', label: 'JavaScript', ext: javascript() },
];

export default function CodeTabs() {
  const { code, setCode } = useSandbox();
  const [active, setActive] = useState('html');
  const tab = TABS.find((t) => t.key === active);

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
      <div className="flex-1 overflow-auto">
        <CodeMirror
          key={tab.key}
          value={code[tab.key]}
          height="100%"
          theme="dark"
          extensions={[tab.ext]}
          onChange={(value) => setCode({ [tab.key]: value })}
          basicSetup={{ tabSize: 2 }}
          style={{ height: '100%', fontSize: 13 }}
        />
      </div>
    </div>
  );
}
