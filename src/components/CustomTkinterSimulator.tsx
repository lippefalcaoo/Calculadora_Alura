import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  CalculadoraLogicaTS,
  EstadoCalculadora,
} from '../engine/calculadoraLogica';
import {
  Delete,
  RotateCcw,
  Sun,
  Moon,
  Keyboard,
  AlertTriangle,
  History,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';

interface CustomTkinterSimulatorProps {
  externalPreset?: {
    label: string;
    sequence: Array<{ type: 'digit' | 'op' | 'decimal' | 'calc' | 'clear' | 'sign' | 'pct' | 'back'; value?: string }>;
  } | null;
  onPresetConsumed?: () => void;
}

interface BotaoDefinicao {
  id: string;
  label: string;
  shortcutHint: string;
  category: 'numero' | 'operador' | 'acao_secundaria' | 'acao_perigo' | 'igual';
  action: () => void;
  matchKeys: string[];
}

export const CustomTkinterSimulator: React.FC<CustomTkinterSimulatorProps> = ({
  externalPreset,
  onPresetConsumed,
}) => {
  const engineRef = useRef<CalculadoraLogicaTS>(new CalculadoraLogicaTS());
  const [estado, setEstado] = useState<EstadoCalculadora>(() =>
    engineRef.current.obterEstado()
  );
  const [ctkTheme, setCtkTheme] = useState<'dark' | 'light'>('dark');
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('Nenhuma tecla pressionada');
  const [keyboardEnabled, setKeyboardEnabled] = useState<boolean>(true);

  const sincronizar = useCallback((acao: () => EstadoCalculadora, feedbackId?: string, keyLabel?: string) => {
    const novoEstado = acao();
    setEstado(novoEstado);
    if (feedbackId) {
      setActiveKeyId(feedbackId);
      setTimeout(() => {
        setActiveKeyId((prev) => (prev === feedbackId ? null : prev));
      }, 140);
    }
    if (keyLabel) {
      setLastKeyPressed(keyLabel);
    }
  }, []);

  // Executa sequência de demonstração quando acionada pela aba de testes ou exemplos
  useEffect(() => {
    if (!externalPreset) return;
    const calc = engineRef.current;
    calc.limparTudo();
    let ultimoEstado = calc.obterEstado();

    externalPreset.sequence.forEach((step) => {
      switch (step.type) {
        case 'digit':
          if (step.value) ultimoEstado = calc.inserirDigito(step.value);
          break;
        case 'op':
          if (step.value) ultimoEstado = calc.definirOperador(step.value);
          break;
        case 'decimal':
          ultimoEstado = calc.inserirDecimal();
          break;
        case 'calc':
          ultimoEstado = calc.calcular();
          break;
        case 'clear':
          ultimoEstado = calc.limparTudo();
          break;
        case 'sign':
          ultimoEstado = calc.inverterSinal();
          break;
        case 'pct':
          ultimoEstado = calc.aplicarPorcentagem();
          break;
        case 'back':
          ultimoEstado = calc.apagarUltimo();
          break;
      }
    });

    setEstado(ultimoEstado);
    setLastKeyPressed(`Cenário carregado: ${externalPreset.label}`);
    if (onPresetConsumed) {
      onPresetConsumed();
    }
  }, [externalPreset, onPresetConsumed]);

  const botoes: BotaoDefinicao[] = [
    {
      id: 'btn-clear',
      label: 'C',
      shortcutHint: 'Esc',
      category: 'acao_perigo',
      action: () => sincronizar(() => engineRef.current.limparTudo(), 'btn-clear', 'Tecla C / Escape (Limpar)'),
      matchKeys: ['Escape', 'Delete', 'c', 'C'],
    },
    {
      id: 'btn-back',
      label: '⌫',
      shortcutHint: 'Back',
      category: 'acao_secundaria',
      action: () => sincronizar(() => engineRef.current.apagarUltimo(), 'btn-back', 'Tecla Backspace'),
      matchKeys: ['Backspace'],
    },
    {
      id: 'btn-pct',
      label: '%',
      shortcutHint: '%',
      category: 'acao_secundaria',
      action: () => sincronizar(() => engineRef.current.aplicarPorcentagem(), 'btn-pct', 'Tecla % (Porcentagem)'),
      matchKeys: ['%'],
    },
    {
      id: 'btn-div',
      label: '÷',
      shortcutHint: '/',
      category: 'operador',
      action: () => sincronizar(() => engineRef.current.definirOperador('/'), 'btn-div', 'Operador / (Divisão)'),
      matchKeys: ['/'],
    },
    {
      id: 'btn-7',
      label: '7',
      shortcutHint: '7',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('7'), 'btn-7', 'Dígito 7'),
      matchKeys: ['7'],
    },
    {
      id: 'btn-8',
      label: '8',
      shortcutHint: '8',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('8'), 'btn-8', 'Dígito 8'),
      matchKeys: ['8'],
    },
    {
      id: 'btn-9',
      label: '9',
      shortcutHint: '9',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('9'), 'btn-9', 'Dígito 9'),
      matchKeys: ['9'],
    },
    {
      id: 'btn-mul',
      label: '×',
      shortcutHint: '*',
      category: 'operador',
      action: () => sincronizar(() => engineRef.current.definirOperador('*'), 'btn-mul', 'Operador * (Multiplicação)'),
      matchKeys: ['*', 'x', 'X'],
    },
    {
      id: 'btn-4',
      label: '4',
      shortcutHint: '4',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('4'), 'btn-4', 'Dígito 4'),
      matchKeys: ['4'],
    },
    {
      id: 'btn-5',
      label: '5',
      shortcutHint: '5',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('5'), 'btn-5', 'Dígito 5'),
      matchKeys: ['5'],
    },
    {
      id: 'btn-6',
      label: '6',
      shortcutHint: '6',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('6'), 'btn-6', 'Dígito 6'),
      matchKeys: ['6'],
    },
    {
      id: 'btn-sub',
      label: '−',
      shortcutHint: '-',
      category: 'operador',
      action: () => sincronizar(() => engineRef.current.definirOperador('-'), 'btn-sub', 'Operador - (Subtração)'),
      matchKeys: ['-'],
    },
    {
      id: 'btn-1',
      label: '1',
      shortcutHint: '1',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('1'), 'btn-1', 'Dígito 1'),
      matchKeys: ['1'],
    },
    {
      id: 'btn-2',
      label: '2',
      shortcutHint: '2',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('2'), 'btn-2', 'Dígito 2'),
      matchKeys: ['2'],
    },
    {
      id: 'btn-3',
      label: '3',
      shortcutHint: '3',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('3'), 'btn-3', 'Dígito 3'),
      matchKeys: ['3'],
    },
    {
      id: 'btn-add',
      label: '+',
      shortcutHint: '+',
      category: 'operador',
      action: () => sincronizar(() => engineRef.current.definirOperador('+'), 'btn-add', 'Operador + (Adição)'),
      matchKeys: ['+'],
    },
    {
      id: 'btn-sign',
      label: '±',
      shortcutHint: 'F9',
      category: 'acao_secundaria',
      action: () => sincronizar(() => engineRef.current.inverterSinal(), 'btn-sign', 'Inversão de Sinal (±)'),
      matchKeys: ['F9'],
    },
    {
      id: 'btn-0',
      label: '0',
      shortcutHint: '0',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDigito('0'), 'btn-0', 'Dígito 0'),
      matchKeys: ['0'],
    },
    {
      id: 'btn-dec',
      label: ',',
      shortcutHint: '. ,',
      category: 'numero',
      action: () => sincronizar(() => engineRef.current.inserirDecimal(), 'btn-dec', 'Separador Decimal (, / .)'),
      matchKeys: ['.', ','],
    },
    {
      id: 'btn-eq',
      label: '=',
      shortcutHint: 'Enter',
      category: 'igual',
      action: () => sincronizar(() => engineRef.current.calcular(), 'btn-eq', 'Tecla Enter / = (Calcular)'),
      matchKeys: ['Enter', '='],
    },
  ];

  // Listener global de teclado físico (espelhando self.bind("<Key>") do CustomTkinter)
  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignora caso o foco esteja em um input de texto futuro
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const matchedButton = botoes.find((b) => b.matchKeys.includes(event.key));
      if (matchedButton) {
        event.preventDefault();
        matchedButton.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const isDark = ctkTheme === 'dark';

  const getButtonClasses = (btn: BotaoDefinicao) => {
    const isPressed = activeKeyId === btn.id;
    const isCurrentOperator =
      (btn.id === 'btn-add' && estado.operadorAtual === '+') ||
      (btn.id === 'btn-sub' && estado.operadorAtual === '-') ||
      (btn.id === 'btn-mul' && estado.operadorAtual === '*') ||
      (btn.id === 'btn-div' && estado.operadorAtual === '/');

    const base =
      'relative flex flex-col items-center justify-center h-14 rounded-[10px] font-semibold transition-all duration-150 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 whitespace-nowrap shrink-0';

    const scaleClass = isPressed ? 'scale-95 ring-2 ring-blue-400' : 'active:scale-95';

    if (btn.category === 'igual') {
      return `${base} ${scaleClass} bg-blue-600 hover:bg-blue-500 text-white shadow-sm`;
    }

    if (btn.category === 'operador') {
      if (isCurrentOperator) {
        return `${base} ${scaleClass} bg-blue-500 text-white ring-2 ring-blue-300`;
      }
      return isDark
        ? `${base} ${scaleClass} bg-blue-950/90 hover:bg-blue-900/90 text-blue-300 border border-blue-800/60`
        : `${base} ${scaleClass} bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200`;
    }

    if (btn.category === 'acao_perigo') {
      return isDark
        ? `${base} ${scaleClass} bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50`
        : `${base} ${scaleClass} bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-200`;
    }

    if (btn.category === 'acao_secundaria') {
      return isDark
        ? `${base} ${scaleClass} bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/70`
        : `${base} ${scaleClass} bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 border border-slate-300`;
    }

    // Número padrão
    return isDark
      ? `${base} ${scaleClass} bg-slate-700/85 hover:bg-slate-600/90 text-slate-100 border border-slate-600/50`
      : `${base} ${scaleClass} bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200`;
  };

  return (
    <div className="space-y-6">
      {/* Barra de controles do Simulador CustomTkinter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Janela CustomTkinter Interativa (Preview em Tempo Real)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ctk.CTk(fg_color=&quot;{isDark ? '#0F172A' : '#F8FAFC'}&quot;) · Motor: CalculadoraLogica · Geometria: 680x540
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Appearance Mode do CustomTkinter */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setCtkTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark Mode
            </button>
            <button
              type="button"
              onClick={() => setCtkTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !isDark
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light Mode
            </button>
          </div>

          <button
            type="button"
            onClick={() => setKeyboardEnabled((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              keyboardEnabled
                ? 'bg-blue-950/60 border-blue-800 text-blue-300 hover:bg-blue-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Ativar ou desativar captura do teclado físico"
          >
            <Keyboard className="w-3.5 h-3.5" />
            {keyboardEnabled ? 'Teclado Físico: Ativo' : 'Teclado Físico: Pausado'}
          </button>
        </div>
      </div>

      {/* Moldura de Janela Desktop Python CustomTkinter */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${
          isDark
            ? 'bg-[#0F172A] border-slate-800 text-slate-100'
            : 'bg-[#F8FAFC] border-slate-300 text-slate-900'
        }`}
      >
        {/* Barra de título nativa da janela CTk */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b text-xs ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-slate-400'
              : 'bg-slate-200/80 border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold tracking-tight">
              python3 main.py
            </span>
            <span aria-hidden="true">·</span>
            <span>PyCalc Studio — Calculadora CustomTkinter</span>
          </div>
          <div className="font-mono text-[11px] opacity-80">
            {lastKeyPressed}
          </div>
        </div>

        {/* Corpo da Janela: 2 Colunas (Calculadora CTkFrame + Histórico CTkFrame) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
          {/* Coluna Esquerda (7 cols): _frame_calc */}
          <div
            className={`lg:col-span-7 rounded-2xl border p-4 flex flex-col justify-between ${
              isDark
                ? 'bg-[#1E293B] border-slate-700/80'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Visor CTkFrame (frame_visor) */}
            <div
              className={`rounded-xl border px-4 py-3.5 mb-4 flex flex-col justify-between min-h-[108px] transition-colors ${
                estado.erroAtivo
                  ? isDark
                    ? 'bg-rose-950/40 border-rose-700/80'
                    : 'bg-rose-50 border-rose-300'
                  : isDark
                  ? 'bg-[#0F172A] border-slate-800'
                  : 'bg-slate-100 border-slate-300'
              }`}
            >
              {/* Linha superior: _lbl_expressao */}
              <div className="flex items-center justify-between gap-2 min-h-[22px]">
                <span
                  className={`text-xs font-mono ${
                    estado.erroAtivo
                      ? 'text-rose-400 font-medium flex items-center gap-1.5'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {estado.erroAtivo ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Exceção tratada em logica.py (ZeroDivisionError)
                    </>
                  ) : (
                    'CTkLabel · Expressão'
                  )}
                </span>
                <span
                  className={`font-mono text-sm tabular-nums text-right truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {estado.expressaoAcumulada || '\u00A0'}
                </span>
              </div>

              {/* Linha principal: _lbl_visor */}
              <div
                className={`font-mono font-bold tabular-nums text-right tracking-tight break-all leading-tight mt-1 ${
                  estado.valorVisor.length > 14
                    ? 'text-2xl'
                    : estado.valorVisor.length > 10
                    ? 'text-3xl'
                    : 'text-4xl'
                } ${
                  estado.erroAtivo
                    ? isDark
                      ? 'text-rose-400'
                      : 'text-rose-600'
                    : isDark
                    ? 'text-slate-50'
                    : 'text-slate-900'
                }`}
                data-testid="calculator-display"
              >
                {estado.valorVisor}
              </div>
            </div>

            {/* Grade 5x4 de Botões CTkButton */}
            <div className="grid grid-cols-4 gap-2.5">
              {botoes.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={btn.action}
                  className={getButtonClasses(btn)}
                  aria-label={`Botão ${btn.label}`}
                >
                  <span className="text-lg leading-none">{btn.label}</span>
                  <span className="text-[10px] font-mono opacity-55 mt-1 leading-none">
                    {btn.shortcutHint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Coluna Direita (5 cols): _frame_hist (Painel Lateral de Histórico da Sessão) */}
          <div
            className={`lg:col-span-5 rounded-2xl border p-4 flex flex-col justify-between min-h-[380px] ${
              isDark
                ? 'bg-[#1E293B] border-slate-700/80'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold">Histórico da Sessão</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    sincronizar(
                      () => engineRef.current.limparHistorico(),
                      undefined,
                      'Histórico da sessão limpo'
                    )
                  }
                  disabled={estado.historico.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-[#0F172A] hover:bg-slate-800 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar
                </button>
              </div>

              {/* Lista rolável CTkScrollableFrame */}
              {estado.historico.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p
                    className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Nenhuma operação realizada nesta sessão.
                  </p>
                  <p
                    className={`text-[11px] mt-1 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Realize um cálculo ou carregue um caso de teste rápido abaixo para popular o histórico.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {estado.historico.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        sincronizar(
                          () => engineRef.current.restaurarDoHistorico(item.valorBruto),
                          undefined,
                          `Restaurado do histórico: ${item.resultado}`
                        )
                      }
                      className={`w-full text-right p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-2 cursor-pointer group ${
                        isDark
                          ? 'bg-[#0F172A] border-slate-800 hover:border-blue-500/60 text-slate-100'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-900'
                      }`}
                      title="Clique para reutilizar este resultado no visor"
                    >
                      <span className="text-[11px] font-mono opacity-60 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                        {item.horario}
                      </span>
                      <div className="font-mono tabular-nums">
                        <div className="text-xs opacity-70">{item.expressao}</div>
                        <div className="text-sm font-bold text-blue-400">
                          {item.resultado}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do painel lateral: Cenários rápidos de validação */}
            <div className="pt-3 mt-3 border-t border-slate-700/50">
              <div className="text-[11px] font-medium opacity-75 mb-2">
                Testar cenários obrigatórios com 1 clique:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const c = engineRef.current;
                    c.limparTudo();
                    c.inserirDigito('4');
                    c.inserirDigito('2');
                    c.definirOperador('/');
                    c.inserirDigito('0');
                    sincronizar(() => c.calcular(), undefined, 'Teste: 42 ÷ 0 (Divisão por Zero)');
                  }}
                  className="px-2.5 py-1.5 text-xs font-mono rounded bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 transition-colors text-left truncate cursor-pointer"
                >
                  42 ÷ 0 = (Erro)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const c = engineRef.current;
                    c.limparTudo();
                    c.inserirDigito('0');
                    c.inserirDecimal();
                    c.inserirDigito('1');
                    c.definirOperador('+');
                    c.inserirDigito('0');
                    c.inserirDecimal();
                    c.inserirDigito('2');
                    sincronizar(() => c.calcular(), undefined, 'Teste Decimal: 0,1 + 0,2 = 0,3');
                  }}
                  className="px-2.5 py-1.5 text-xs font-mono rounded bg-blue-950/60 hover:bg-blue-900/70 text-blue-300 border border-blue-800/50 transition-colors text-left truncate cursor-pointer"
                >
                  0,1 + 0,2 = 0,3
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const c = engineRef.current;
                    c.limparTudo();
                    c.inserirDigito('2');
                    c.inserirDigito('5');
                    c.inserirDigito('0');
                    c.definirOperador('+');
                    c.inserirDigito('1');
                    c.inserirDigito('0');
                    c.aplicarPorcentagem();
                    sincronizar(() => c.calcular(), undefined, 'Teste: 250 + 10% = 275');
                  }}
                  className="px-2.5 py-1.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left truncate cursor-pointer"
                >
                  250 + 10% = 275
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const c = engineRef.current;
                    c.limparTudo();
                    c.inserirDigito('1');
                    c.inserirDigito('2');
                    c.definirOperador('*');
                    c.inserirDigito('8');
                    sincronizar(() => c.calcular(), undefined, 'Teste: 12 × 8 = 96');
                  }}
                  className="px-2.5 py-1.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-left truncate cursor-pointer"
                >
                  12 × 8 = 96
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspetor de Estado em Tempo Real (Mostrando o desacoplamento Backend <-> Frontend) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-xs font-semibold text-slate-200">
            Inspeção em Tempo Real · <code className="text-blue-400">dataclass EstadoCalculadora</code> (Retornado por <code className="text-blue-400">logica.py</code>)
          </div>
          <div className="text-xs text-slate-400">
            Imutável (`frozen=True, slots=True`) · Zero acoplamento com Tkinter
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs tabular-nums">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-slate-400 text-[11px]">valor_visor: str</div>
            <div className="text-slate-100 font-semibold mt-0.5 truncate">
              &quot;{estado.valorVisor}&quot;
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-slate-400 text-[11px]">operador_atual: Literal</div>
            <div className="text-blue-400 font-semibold mt-0.5">
              {estado.operadorAtual ? `"${estado.operadorAtual}"` : 'None'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-slate-400 text-[11px]">erro_ativo: bool</div>
            <div
              className={`font-semibold mt-0.5 ${
                estado.erroAtivo ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {estado.erroAtivo ? 'True (Exceção Capturada)' : 'False (Nominal)'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-slate-400 text-[11px]">len(historico): int</div>
            <div className="text-slate-100 font-semibold mt-0.5">
              {estado.historico.length} registro(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
