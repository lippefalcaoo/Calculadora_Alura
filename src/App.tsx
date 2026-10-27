/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomTkinterSimulator } from './components/CustomTkinterSimulator';
import { PythonCodeStudio } from './components/PythonCodeStudio';
import { UnitTestSuitePanel, TestCaseResult } from './components/UnitTestSuitePanel';
import { PYTHON_PROJECT_FILES } from './data/pythonSourceFiles';
import { Download, Layers, Code2, FlaskConical, Monitor } from 'lucide-react';

type ActiveSection = 'simulador' | 'codigo' | 'testes' | 'arquitetura';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('simulador');
  const [simulatorPreset, setSimulatorPreset] = useState<{
    label: string;
    sequence: TestCaseResult['sequence'];
  } | null>(null);

  const handleDownloadFullBundle = () => {
    const separator = '\n' + '='.repeat(78) + '\n';
    const bundleContent = PYTHON_PROJECT_FILES.map(
      (f) =>
        `${separator}# ARQUIVO: ${f.filename}\n# FUNÇÃO: ${f.roleTitle}${separator}\n${f.code}\n`
    ).join('\n');

    const blob = new Blob([bundleContent], {
      type: 'text/x-python;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculadora_customtkinter_completa.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadScenarioInSimulator = (preset: {
    label: string;
    sequence: TestCaseResult['sequence'];
  }) => {
    setSimulatorPreset(preset);
    setActiveSection('simulador');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Top Bar Contract: 3 zonas separadas por gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 sticky top-0 z-30">
        {/* Zona 1: Brand title única linha */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('simulador');
          }}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          PyCalc Studio
        </a>

        {/* Zona 2: 4 links de navegação concisos em linha única */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setActiveSection('simulador')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'simulador'
                ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2'
                : ''
            }`}
          >
            Simulador GUI
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('codigo')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'codigo'
                ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2'
                : ''
            }`}
          >
            Código Modular
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('testes')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'testes'
                ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2'
                : ''
            }`}
          >
            Testes Unitários
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('arquitetura')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'arquitetura'
                ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2'
                : ''
            }`}
          >
            Arquitetura
          </button>
        </nav>

        {/* Zona 3: 1 ação primária */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadFullBundle}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Projeto Python
          </button>
        </div>
      </header>

      {/* Container Principal Desktop (max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Cabeçalho de Contexto Técnico + Metadados sem pílulas */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Python 3.10+</span>
              <span aria-hidden="true">·</span>
              <span>CustomTkinter Dark Mode</span>
              <span aria-hidden="true">·</span>
              <span>PEP 8 &amp; Type Hints</span>
              <span aria-hidden="true">·</span>
              <span>main.py / interface.py / logica.py</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50"
              style={{ textWrap: 'balance' }}
            >
              Calculadora Gráfica Desktop com Arquitetura Desacoplada
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Experimente a interface gráfica <strong className="text-white font-medium">CustomTkinter</strong> em tempo real (utilizando cliques ou seu teclado físico) e inspecione os módulos Python 3.10+ prontos para produção com precisão <code className="text-blue-400">decimal.Decimal</code> e tratamento seguro de divisão por zero.
            </p>
          </div>

          {/* Seletor segmentado de visualização (funcional para todas as larguras de tela) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveSection('simulador')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'simulador'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Simulador CustomTkinter
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('codigo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'codigo'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Módulos Python (5)
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('testes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'testes'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Testes Unitários
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('arquitetura')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'arquitetura'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Decisões de Arquitetura
            </button>
          </div>
        </section>

        {/* Visão 1: Simulador Interativo + Código Lado a Lado em Desktop */}
        {activeSection === 'simulador' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-7">
              <CustomTkinterSimulator
                externalPreset={simulatorPreset}
                onPresetConsumed={() => setSimulatorPreset(null)}
              />
            </div>
            <div className="xl:col-span-5">
              <PythonCodeStudio />
            </div>
          </div>
        )}

        {/* Visão 2: Estúdio de Código Python em Tela Cheia */}
        {activeSection === 'codigo' && <PythonCodeStudio />}

        {/* Visão 3: Suíte de Testes Unitários Interativa */}
        {activeSection === 'testes' && (
          <UnitTestSuitePanel
            onLoadScenarioInSimulator={handleLoadScenarioInSimulator}
          />
        )}

        {/* Visão 4: Guia Didático de Arquitetura Clean Code */}
        {activeSection === 'arquitetura' && (
          <section className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-semibold text-slate-100">
                Boas Práticas de Engenharia &amp; Clean Code Aplicadas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Como estruturamos o projeto Python 3.10+ para garantir manutenibilidade, segurança e testabilidade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-2.5">
                <div className="text-xs font-mono text-blue-400">
                  01. Desacoplamento Total (MVC / MVP)
                </div>
                <h3 className="text-base font-semibold text-slate-100">
                  Zero Tkinter dentro de logica.py
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O módulo <code className="text-slate-100">logica.py</code> não importa <code className="text-slate-100">customtkinter</code> nem manipula widgets diretamente. Ele recebe comandos tipados e devolve uma instância imutável de <code className="text-slate-100">EstadoCalculadora</code>. Isso permite trocar a GUI para PyQt6, Web ou CLI sem alterar uma única linha da regra de negócio.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-2.5">
                <div className="text-xs font-mono text-blue-400">
                  02. Segurança &amp; Precisão Numérica
                </div>
                <h3 className="text-base font-semibold text-slate-100">
                  Máquina de Estados com Decimal vs. eval()
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculadoras iniciantes costumam concatenar strings e chamar <code className="text-rose-300">eval()</code>, o que abre brechas de execução de código arbitrário e sofre com imprecisão binária (<code className="text-slate-100">0.1 + 0.2 = 0.30000000000000004</code>). Nossa classe <code className="text-slate-100">CalculadoraLogica</code> usa <code className="text-emerald-300">decimal.Decimal</code> com arredondamento <code className="text-slate-100">ROUND_HALF_UP</code>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-2.5">
                <div className="text-xs font-mono text-blue-400">
                  03. Tratamento Robusto de Exceções
                </div>
                <h3 className="text-base font-semibold text-slate-100">
                  Proteção contra Divisão por Zero
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tanto a validação preventiva (<code className="text-slate-100">op == &quot;/&quot; and operando_direito == Decimal(&quot;0&quot;)</code>) quanto o bloco <code className="text-slate-100">try/except (InvalidOperation, ZeroDivisionError)</code> capturam falhas matemáticas, ativam a flag <code className="text-slate-100">erro_ativo=True</code> e permitem recuperação automática ao digitar o próximo número.
                </p>
              </div>
            </div>

            {/* Tabela de mapeamento de eventos de teclado físico */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Mapeamento de Eventos de Teclado Físico em <code className="text-blue-400">interface.py</code>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Todos os atalhos abaixo funcionam tanto no aplicativo Python CustomTkinter quanto no Simulador Interativo desta página
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">0 – 9</div>
                  <div className="text-slate-400 mt-1">Inserção de dígitos</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">+  -  *  /</div>
                  <div className="text-slate-400 mt-1">4 operações básicas</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">Enter / =</div>
                  <div className="text-slate-400 mt-1">Executa cálculo</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">Backspace</div>
                  <div className="text-slate-400 mt-1">Apaga último dígito</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">Escape / Delete / C</div>
                  <div className="text-slate-400 mt-1">Limpa estado (C)</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">. ou ,</div>
                  <div className="text-slate-400 mt-1">Separador decimal</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">%</div>
                  <div className="text-slate-400 mt-1">Cálculo de percentual</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-semibold">F9</div>
                  <div className="text-slate-400 mt-1">Inversão de sinal (±)</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Rodapé limpo */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4 max-w-7xl w-full mx-auto">
        <span>PyCalc Studio · Arquitetura Modular em Python 3.10+ &amp; CustomTkinter</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveSection('codigo')}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Ver Módulos Python
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={handleDownloadFullBundle}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Exportar Código (.py)
          </button>
        </div>
      </footer>
    </div>
  );
}
