import React, { useState } from 'react';
import { PYTHON_PROJECT_FILES, PythonModuleFile } from '../data/pythonSourceFiles';
import { Copy, Check, Download, FileCode, Terminal } from 'lucide-react';

export const PythonCodeStudio: React.FC = () => {
  const [selectedFileId, setSelectedFileId] =
    useState<PythonModuleFile['id']>('logica.py');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeFile =
    PYTHON_PROJECT_FILES.find((f) => f.id === selectedFileId) ||
    PYTHON_PROJECT_FILES[0];

  const handleCopyCode = async (file: PythonModuleFile) => {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopiedId(file.id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === file.id ? null : prev));
      }, 2000);
    } catch {
      // Fallback silencioso
    }
  };

  const handleDownloadSingleFile = (file: PythonModuleFile) => {
    const blob = new Blob([file.code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = activeFile.code.split('\n');

  return (
    <div className="space-y-5">
      {/* Cabeçalho e barra de seleção de módulos */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Arquitetura Modular em Python 3.10+ (PEP 8 &amp; Type Hints)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Separação estrita entre motor matemático (logica.py), visão CustomTkinter (interface.py) e inicialização (main.py)
          </p>
        </div>

        {/* Abas de arquivos do projeto */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {PYTHON_PROJECT_FILES.map((file) => {
            const isActive = file.id === selectedFileId;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedFileId(file.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {file.filename}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumo técnico do módulo selecionado */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs text-blue-400 font-medium">
              {activeFile.filename} · {activeFile.roleTitle}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {activeFile.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyCode(activeFile)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedId === activeFile.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar {activeFile.filename}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDownloadSingleFile(activeFile)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar {activeFile.filename}
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          {activeFile.highlights.map((item, idx) => (
            <React.Fragment key={item}>
              {idx > 0 && <span aria-hidden="true">·</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Visualizador de Código com numeração tabular */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span>
            python_project/{activeFile.filename} · {lines.length} linhas · UTF-8
          </span>
          <span>Python 3.10+ · PEP 8 Verified</span>
        </div>

        <div className="overflow-x-auto max-h-[540px] overflow-y-auto p-4 font-mono text-xs leading-relaxed tabular-nums">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} className="hover:bg-slate-900/60">
                  <td className="select-none pr-4 text-right text-slate-600 w-10 align-top">
                    {index + 1}
                  </td>
                  <td className="text-slate-200 whitespace-pre">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guia rápido de execução local no terminal */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          Como Executar Localmente na Sua Máquina (Python 3.10+)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">1. Criar ambiente virtual e instalar</div>
            <code className="text-blue-300">pip install -r requirements.txt</code>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">2. Executar suíte de testes unitários</div>
            <code className="text-emerald-300">python -m unittest test_logica.py -v</code>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[11px] mb-1">3. Iniciar a interface CustomTkinter</div>
            <code className="text-slate-100">python main.py</code>
          </div>
        </div>
      </div>
    </div>
  );
};
