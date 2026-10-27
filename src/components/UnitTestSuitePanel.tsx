import React, { useState, useCallback, useEffect } from 'react';
import {
  CalculadoraLogicaTS,
  MSG_ERRO_DIVISAO_ZERO,
} from '../engine/calculadoraLogica';
import { Play, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export interface TestCaseResult {
  id: string;
  testMethodName: string;
  description: string;
  expectedDisplay: string;
  actualDisplay: string;
  passed: boolean;
  durationMs: string;
  sequence: Array<{
    type: 'digit' | 'op' | 'decimal' | 'calc' | 'clear' | 'sign' | 'pct' | 'back';
    value?: string;
  }>;
}

interface UnitTestSuitePanelProps {
  onLoadScenarioInSimulator: (preset: {
    label: string;
    sequence: TestCaseResult['sequence'];
  }) => void;
}

export const UnitTestSuitePanel: React.FC<UnitTestSuitePanelProps> = ({
  onLoadScenarioInSimulator,
}) => {
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string>('');

  const runAllUnitTests = useCallback(() => {
    const definitions: Array<{
      id: string;
      testMethodName: string;
      description: string;
      expectedDisplay: string;
      sequence: TestCaseResult['sequence'];
      customAssert?: (calc: CalculadoraLogicaTS) => { actual: string; passed: boolean };
    }> = [
      {
        id: 't1',
        testMethodName: 'test_adicao_basica',
        description: 'Valida adição inteira padrão (15 + 27 = 42)',
        expectedDisplay: '42',
        sequence: [
          { type: 'digit', value: '1' },
          { type: 'digit', value: '5' },
          { type: 'op', value: '+' },
          { type: 'digit', value: '2' },
          { type: 'digit', value: '7' },
          { type: 'calc' },
        ],
      },
      {
        id: 't2',
        testMethodName: 'test_subtracao_com_resultado_negativo',
        description: 'Valida subtração resultando em valor negativo (8 - 20 = -12)',
        expectedDisplay: '-12',
        sequence: [
          { type: 'digit', value: '8' },
          { type: 'op', value: '-' },
          { type: 'digit', value: '2' },
          { type: 'digit', value: '0' },
          { type: 'calc' },
        ],
      },
      {
        id: 't3',
        testMethodName: 'test_multiplicacao_precisao_decimal',
        description: 'Garante ausência de erro IEEE 754 em ponto flutuante (0,1 × 0,2 = 0,02)',
        expectedDisplay: '0,02',
        sequence: [
          { type: 'digit', value: '0' },
          { type: 'decimal' },
          { type: 'digit', value: '1' },
          { type: 'op', value: '*' },
          { type: 'digit', value: '0' },
          { type: 'decimal' },
          { type: 'digit', value: '2' },
          { type: 'calc' },
        ],
      },
      {
        id: 't4',
        testMethodName: 'test_divisao_exata_e_fracionaria',
        description: 'Valida divisão com resultado decimal formatado (10 ÷ 4 = 2,5)',
        expectedDisplay: '2,5',
        sequence: [
          { type: 'digit', value: '1' },
          { type: 'digit', value: '0' },
          { type: 'op', value: '/' },
          { type: 'digit', value: '4' },
          { type: 'calc' },
        ],
      },
      {
        id: 't5',
        testMethodName: 'test_divisao_por_zero_tratamento_robusto',
        description: 'Captura divisão por zero (9 ÷ 0) e sinaliza erro sem quebrar a GUI',
        expectedDisplay: MSG_ERRO_DIVISAO_ZERO,
        sequence: [
          { type: 'digit', value: '9' },
          { type: 'op', value: '/' },
          { type: 'digit', value: '0' },
          { type: 'calc' },
        ],
      },
      {
        id: 't6',
        testMethodName: 'test_recuperacao_apos_divisao_por_zero',
        description: 'Verifica que digitar um número após erro restaura operação normal (9 ÷ 0 = Erro -> 5)',
        expectedDisplay: '5',
        sequence: [
          { type: 'digit', value: '9' },
          { type: 'op', value: '/' },
          { type: 'digit', value: '0' },
          { type: 'calc' },
          { type: 'digit', value: '5' },
        ],
      },
      {
        id: 't7',
        testMethodName: 'test_backspace_e_inversao_sinal',
        description: 'Testa remoção do último dígito e inversão de sinal ± (48 -> Backspace -> ± = -4)',
        expectedDisplay: '-4',
        sequence: [
          { type: 'digit', value: '4' },
          { type: 'digit', value: '8' },
          { type: 'back' },
          { type: 'sign' },
        ],
      },
      {
        id: 't8',
        testMethodName: 'test_porcentagem_contextual_adicao',
        description: 'Calcula acréscimo percentual sobre o operando base (200 + 15% = 230)',
        expectedDisplay: '230',
        sequence: [
          { type: 'digit', value: '2' },
          { type: 'digit', value: '0' },
          { type: 'digit', value: '0' },
          { type: 'op', value: '+' },
          { type: 'digit', value: '1' },
          { type: 'digit', value: '5' },
          { type: 'pct' },
          { type: 'calc' },
        ],
      },
    ];

    const executed: TestCaseResult[] = definitions.map((def) => {
      const start = performance.now();
      const calc = new CalculadoraLogicaTS();
      let ultimoEstado = calc.obterEstado();

      def.sequence.forEach((step) => {
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

      const elapsed = Math.max(0.05, performance.now() - start).toFixed(2);
      const actual = ultimoEstado.valorVisor;
      const passed = actual === def.expectedDisplay;

      return {
        id: def.id,
        testMethodName: def.testMethodName,
        description: def.description,
        expectedDisplay: def.expectedDisplay,
        actualDisplay: actual,
        passed,
        durationMs: `${elapsed} ms`,
        sequence: def.sequence,
      };
    });

    setResults(executed);
    setLastRunTimestamp(
      new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  }, []);

  useEffect(() => {
    runAllUnitTests();
  }, [runAllUnitTests]);

  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Suíte de Testes Unitários (<code className="text-blue-400">test_logica.py</code>)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Validação determinística das 4 operações obrigatórias, precisão decimal e captura de divisão por zero · Última execução: {lastRunTimestamp || 'Agora'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 tabular-nums">
            {passedCount}/{results.length} aprovados
          </span>
          <button
            type="button"
            onClick={runAllUnitTests}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Executar Testes Novamente
          </button>
        </div>
      </div>

      {/* Tabela de alta densidade com resultados tabulares */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-medium">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Método de Teste (unittest)</th>
                <th className="py-3 px-4">Cenário Avaliado</th>
                <th className="py-3 px-4 text-right">Esperado</th>
                <th className="py-3 px-4 text-right">Obtido</th>
                <th className="py-3 px-4 text-right">Tempo</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {results.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    {item.passed ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                        <XCircle className="w-4 h-4 shrink-0" />
                        FALHA
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-300 whitespace-nowrap">
                    {item.testMethodName}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {item.description}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                    {item.expectedDisplay}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-400 whitespace-nowrap">
                    {item.actualDisplay}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400 whitespace-nowrap">
                    {item.durationMs}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        onLoadScenarioInSimulator({
                          label: item.testMethodName,
                          sequence: item.sequence,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Testar na GUI
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
