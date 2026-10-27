export type OperadorValido = '+' | '-' | '*' | '/';

export interface ItemHistorico {
  id: string;
  expressao: string;
  resultado: string;
  valorBruto: string;
  horario: string;
}

export interface EstadoCalculadora {
  valorVisor: string;
  valorInterno: string;
  expressaoAcumulada: string;
  operadorAtual: OperadorValido | null;
  operandoAnterior: string | null;
  aguardandoNovoOperando: boolean;
  erroAtivo: boolean;
  historico: ItemHistorico[];
}

export const SIMBOLOS_VISUAIS: Record<OperadorValido, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

export const MSG_ERRO_DIVISAO_ZERO = 'Erro: Divisão por 0';
export const MSG_ERRO_ENTRADA = 'Erro: Entrada inválida';
const MAX_DIGITOS_ENTRADA = 16;

/**
 * Motor de cálculo determinístico (espelho fiel da classe Python `CalculadoraLogica` em `logica.py`).
 * Evita imprecisões IEEE 754 através de normalização decimal de alta precisão (10 casas decimais).
 */
export class CalculadoraLogicaTS {
  private valorAtual: string = '0';
  private operandoAnterior: number | null = null;
  private operadorAtual: OperadorValido | null = null;
  private aguardandoNovoOperando: boolean = false;
  private expressaoTopo: string = '';
  private erroAtivo: boolean = false;
  private historico: ItemHistorico[] = [];

  public obterEstado(): EstadoCalculadora {
    return {
      valorVisor: CalculadoraLogicaTS.formatarExibicao(this.valorAtual),
      valorInterno: this.valorAtual,
      expressaoAcumulada: this.expressaoTopo,
      operadorAtual: this.operadorAtual,
      operandoAnterior:
        this.operandoAnterior !== null
          ? CalculadoraLogicaTS.normalizarDecimal(this.operandoAnterior)
          : null,
      aguardandoNovoOperando: this.aguardandoNovoOperando,
      erroAtivo: this.erroAtivo,
      historico: [...this.historico],
    };
  }

  public limparTudo(): EstadoCalculadora {
    this.valorAtual = '0';
    this.operandoAnterior = null;
    this.operadorAtual = null;
    this.aguardandoNovoOperando = false;
    this.expressaoTopo = '';
    this.erroAtivo = false;
    return this.obterEstado();
  }

  public limparHistorico(): EstadoCalculadora {
    this.historico = [];
    return this.obterEstado();
  }

  public inserirDigito(digito: string): EstadoCalculadora {
    if (!/^\d$/.test(digito)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    if (this.erroAtivo) {
      this.limparTudo();
    }

    if (this.aguardandoNovoOperando) {
      this.valorAtual = digito;
      this.aguardandoNovoOperando = false;
      if (this.operadorAtual === null) {
        this.expressaoTopo = '';
      }
      return this.obterEstado();
    }

    const digitosPuros = this.valorAtual.replace('-', '').replace('.', '');
    if (digitosPuros.length >= MAX_DIGITOS_ENTRADA) {
      return this.obterEstado();
    }

    if (this.valorAtual === '0') {
      this.valorAtual = digito;
    } else if (this.valorAtual === '-0') {
      this.valorAtual = `-${digito}`;
    } else {
      this.valorAtual += digito;
    }

    return this.obterEstado();
  }

  public inserirDecimal(): EstadoCalculadora {
    if (this.erroAtivo) {
      this.limparTudo();
    }

    if (this.aguardandoNovoOperando) {
      this.valorAtual = '0.';
      this.aguardandoNovoOperando = false;
      if (this.operadorAtual === null) {
        this.expressaoTopo = '';
      }
      return this.obterEstado();
    }

    if (!this.valorAtual.includes('.')) {
      this.valorAtual += '.';
    }

    return this.obterEstado();
  }

  public apagarUltimo(): EstadoCalculadora {
    if (this.erroAtivo) {
      return this.limparTudo();
    }

    if (this.aguardandoNovoOperando) {
      return this.obterEstado();
    }

    if (
      this.valorAtual.length <= 1 ||
      (this.valorAtual.length === 2 && this.valorAtual.startsWith('-'))
    ) {
      this.valorAtual = '0';
    } else {
      this.valorAtual = this.valorAtual.slice(0, -1);
    }

    return this.obterEstado();
  }

  public inverterSinal(): EstadoCalculadora {
    if (this.erroAtivo) {
      return this.obterEstado();
    }

    const numero = Number(this.valorAtual);
    if (Number.isNaN(numero)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    if (numero === 0) {
      return this.obterEstado();
    }

    this.valorAtual = CalculadoraLogicaTS.normalizarDecimal(-numero);
    return this.obterEstado();
  }

  public aplicarPorcentagem(): EstadoCalculadora {
    if (this.erroAtivo) {
      return this.obterEstado();
    }

    const atual = Number(this.valorAtual);
    if (Number.isNaN(atual)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    let resultadoPct: number;
    if (
      this.operandoAnterior !== null &&
      (this.operadorAtual === '+' || this.operadorAtual === '-')
    ) {
      resultadoPct = (this.operandoAnterior * atual) / 100;
    } else {
      resultadoPct = atual / 100;
    }

    this.valorAtual = CalculadoraLogicaTS.normalizarDecimal(resultadoPct);
    this.aguardandoNovoOperando = false;
    return this.obterEstado();
  }

  public definirOperador(operador: string): EstadoCalculadora {
    if (operador !== '+' && operador !== '-' && operador !== '*' && operador !== '/') {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    if (this.erroAtivo) {
      return this.obterEstado();
    }

    let valorNumericoAtual = Number(this.valorAtual);
    if (Number.isNaN(valorNumericoAtual)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    if (this.operadorAtual !== null && !this.aguardandoNovoOperando) {
      const estadoIntermediario = this.calcular();
      if (estadoIntermediario.erroAtivo) {
        return estadoIntermediario;
      }
      valorNumericoAtual = Number(this.valorAtual);
    }

    this.operandoAnterior = valorNumericoAtual;
    this.operadorAtual = operador;
    this.aguardandoNovoOperando = true;
    const simbolo = SIMBOLOS_VISUAIS[operador];
    const valorFormatado = CalculadoraLogicaTS.formatarExibicao(
      CalculadoraLogicaTS.normalizarDecimal(valorNumericoAtual)
    );
    this.expressaoTopo = `${valorFormatado} ${simbolo}`;
    return this.obterEstado();
  }

  public calcular(): EstadoCalculadora {
    if (this.erroAtivo) {
      return this.obterEstado();
    }

    if (this.operadorAtual === null || this.operandoAnterior === null) {
      return this.obterEstado();
    }

    const operandoDireito = Number(this.valorAtual);
    if (Number.isNaN(operandoDireito)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    const op = this.operadorAtual;
    const esquerda = this.operandoAnterior;

    if (op === '/' && operandoDireito === 0) {
      return this.definirErro(MSG_ERRO_DIVISAO_ZERO);
    }

    let resultado: number;
    switch (op) {
      case '+':
        resultado = esquerda + operandoDireito;
        break;
      case '-':
        resultado = esquerda - operandoDireito;
        break;
      case '*':
        resultado = esquerda * operandoDireito;
        break;
      case '/':
        resultado = esquerda / operandoDireito;
        break;
    }

    if (!Number.isFinite(resultado)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    const strEsquerda = CalculadoraLogicaTS.formatarExibicao(
      CalculadoraLogicaTS.normalizarDecimal(esquerda)
    );
    const strDireita = CalculadoraLogicaTS.formatarExibicao(
      CalculadoraLogicaTS.normalizarDecimal(operandoDireito)
    );
    const strResultadoNorm = CalculadoraLogicaTS.normalizarDecimal(resultado);
    const strResultadoExib = CalculadoraLogicaTS.formatarExibicao(strResultadoNorm);
    const simbolo = SIMBOLOS_VISUAIS[op];

    const expressaoCompleta = `${strEsquerda} ${simbolo} ${strDireita} =`;
    const agora = new Date();
    const horario = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    this.historico.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      expressao: expressaoCompleta,
      resultado: strResultadoExib,
      valorBruto: strResultadoNorm,
      horario,
    });

    this.valorAtual = strResultadoNorm;
    this.expressaoTopo = expressaoCompleta;
    this.operandoAnterior = null;
    this.operadorAtual = null;
    this.aguardandoNovoOperando = true;
    return this.obterEstado();
  }

  public restaurarDoHistorico(valorBrutoOuFormatado: string): EstadoCalculadora {
    const limpo = valorBrutoOuFormatado.includes(',')
      ? valorBrutoOuFormatado.replace(/\./g, '').replace(',', '.')
      : valorBrutoOuFormatado;

    const numero = Number(limpo);
    if (Number.isNaN(numero)) {
      return this.definirErro(MSG_ERRO_ENTRADA);
    }

    if (this.erroAtivo) {
      this.limparTudo();
    }

    this.valorAtual = CalculadoraLogicaTS.normalizarDecimal(numero);
    this.aguardandoNovoOperando = false;
    return this.obterEstado();
  }

  private definirErro(mensagem: string): EstadoCalculadora {
    this.valorAtual = mensagem;
    this.operandoAnterior = null;
    this.operadorAtual = null;
    this.aguardandoNovoOperando = true;
    this.erroAtivo = true;
    return this.obterEstado();
  }

  public static normalizarDecimal(valor: number): string {
    const arredondado = Number(Math.round(Number(valor + 'e10')) + 'e-10');
    if (Object.is(arredondado, -0) || arredondado === 0) {
      return '0';
    }
    return arredondado.toString();
  }

  public static formatarExibicao(valorBruto: string): string {
    if (valorBruto.startsWith('Erro')) {
      return valorBruto;
    }

    const negativo = valorBruto.startsWith('-');
    const semSinal = negativo ? valorBruto.slice(1) : valorBruto;

    if (semSinal.includes('.')) {
      const [parteInteira, parteDecimal] = semSinal.split('.');
      const inteiroNum = parteInteira ? Number(parteInteira) : 0;
      const inteiroFormatado = Number.isNaN(inteiroNum)
        ? '0'
        : inteiroNum.toLocaleString('pt-BR');
      return `${negativo ? '-' : ''}${inteiroFormatado},${parteDecimal}`;
    } else {
      const inteiroNum = Number(semSinal);
      const inteiroFormatado = Number.isNaN(inteiroNum)
        ? semSinal
        : inteiroNum.toLocaleString('pt-BR');
      return `${negativo ? '-' : ''}${inteiroFormatado}`;
    }
  }
}
