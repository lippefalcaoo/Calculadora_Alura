"""
Módulo de lógica de negócios e cálculos matemáticos da Calculadora.

Implementa uma máquina de estados determinística utilizando `Decimal` para
evitar erros de precisão em ponto flutuante (IEEE 754), seguindo a PEP 8,
uso estrito de Type Hints (Python 3.10+) e separação total da camada gráfica.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Final, Literal

OperadorValido = Literal["+", "-", "*", "/"]

SIMBOLOS_VISUAIS: Final[dict[str, str]] = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
}

MSG_ERRO_DIVISAO_ZERO: Final[str] = "Erro: Divisão por 0"
MSG_ERRO_ENTRADA: Final[str] = "Erro: Entrada inválida"
MAX_DIGITOS_ENTRADA: Final[int] = 16


@dataclass(frozen=True, slots=True)
class ItemHistorico:
    """Representa um registro imutável de cálculo concluído na sessão."""

    expressao: str
    resultado: str
    horario: str


@dataclass(frozen=True, slots=True)
class EstadoCalculadora:
    """Estado imutável exportado para a camada de interface gráfica (GUI)."""

    valor_visor: str
    expressao_acumulada: str
    operador_atual: OperadorValido | None
    erro_ativo: bool
    historico: list[ItemHistorico] = field(default_factory=list)


class CalculadoraLogica:
    """
    Motor de cálculo desacoplado de interface gráfica.

    Suporta:
    - As quatro operações básicas obrigatórias: Adição (+), Subtração (-),
      Multiplicação (*) e Divisão (/).
    - Operações extras de usabilidade: Porcentagem (%), Inversão de sinal (±),
      casas decimais e correção por Backspace.
    - Tratamento robusto de divisão por zero e entradas inválidas.
    """

    def __init__(self) -> None:
        self._valor_atual: str = "0"
        self._operando_anterior: Decimal | None = None
        self._operador_atual: OperadorValido | None = None
        self._aguardando_novo_operando: bool = False
        self._expressao_topo: str = ""
        self._erro_ativo: bool = False
        self._historico: list[ItemHistorico] = []

    def obter_estado(self) -> EstadoCalculadora:
        """Retorna um snapshot imutável do estado atual para renderização na GUI."""
        return EstadoCalculadora(
            valor_visor=self._formatar_exibicao(self._valor_atual),
            expressao_acumulada=self._expressao_topo,
            operador_atual=self._operador_atual,
            erro_ativo=self._erro_ativo,
            historico=list(self._historico),
        )

    def limpar_tudo(self) -> EstadoCalculadora:
        """Restaura a calculadora para o estado inicial (tecla C / Escape)."""
        self._valor_atual = "0"
        self._operando_anterior = None
        self._operador_atual = None
        self._aguardando_novo_operando = False
        self._expressao_topo = ""
        self._erro_ativo = False
        return self.obter_estado()

    def limpar_historico(self) -> EstadoCalculadora:
        """Remove todos os registros do histórico da sessão atual."""
        self._historico.clear()
        return self.obter_estado()

    def inserir_digito(self, digito: str) -> EstadoCalculadora:
        """Insere um dígito numérico de '0' a '9' no operando ativo."""
        if not digito.isdigit() or len(digito) != 1:
            return self._definir_erro(MSG_ERRO_ENTRADA)

        if self._erro_ativo:
            self.limpar_tudo()

        if self._aguardando_novo_operando:
            self._valor_atual = digito
            self._aguardando_novo_operando = False
            if self._operador_atual is None:
                self._expressao_topo = ""
            return self.obter_estado()

        digitos_puros = self._valor_atual.replace("-", "").replace(".", "")
        if len(digitos_puros) >= MAX_DIGITOS_ENTRADA:
            return self.obter_estado()

        if self._valor_atual == "0":
            self._valor_atual = digito
        elif self._valor_atual == "-0":
            self._valor_atual = f"-{digito}"
        else:
            self._valor_atual += digito

        return self.obter_estado()

    def inserir_decimal(self) -> EstadoCalculadora:
        """Adiciona o separador decimal ao número atual caso ainda não exista."""
        if self._erro_ativo:
            self.limpar_tudo()

        if self._aguardando_novo_operando:
            self._valor_atual = "0."
            self._aguardando_novo_operando = False
            if self._operador_atual is None:
                self._expressao_topo = ""
            return self.obter_estado()

        if "." not in self._valor_atual:
            self._valor_atual += "."

        return self.obter_estado()

    def apagar_ultimo(self) -> EstadoCalculadora:
        """Remove o último caractere digitado (tecla Backspace)."""
        if self._erro_ativo:
            return self.limpar_tudo()

        if self._aguardando_novo_operando:
            return self.obter_estado()

        if len(self._valor_atual) <= 1 or (
            len(self._valor_atual) == 2 and self._valor_atual.startswith("-")
        ):
            self._valor_atual = "0"
        else:
            self._valor_atual = self._valor_atual[:-1]

        return self.obter_estado()

    def inverter_sinal(self) -> EstadoCalculadora:
        """Alterna o sinal positivo/negativo (±) do valor em exibição."""
        if self._erro_ativo:
            return self.obter_estado()

        try:
            numero = Decimal(self._valor_atual)
        except InvalidOperation:
            return self._definir_erro(MSG_ERRO_ENTRADA)

        if numero == Decimal("0"):
            return self.obter_estado()

        invertido = -numero
        self._valor_atual = self._normalizar_decimal(invertido)
        return self.obter_estado()

    def aplicar_porcentagem(self) -> EstadoCalculadora:
        """
        Calcula a porcentagem contextual:
        - Em adição/subtração (ex: 200 + 10%), calcula 10% da base (20).
        - Nas demais situações, divide o valor atual por 100.
        """
        if self._erro_ativo:
            return self.obter_estado()

        try:
            atual = Decimal(self._valor_atual)
        except InvalidOperation:
            return self._definir_erro(MSG_ERRO_ENTRADA)

        if (
            self._operando_anterior is not None
            and self._operador_atual in ("+", "-")
        ):
            resultado_pct = (self._operando_anterior * atual) / Decimal("100")
        else:
            resultado_pct = atual / Decimal("100")

        self._valor_atual = self._normalizar_decimal(resultado_pct)
        self._aguardando_novo_operando = False
        return self.obter_estado()

    def definir_operador(self, operador: str) -> EstadoCalculadora:
        """Define a operação matemática (+, -, *, /) ou encadeia cálculo pendente."""
        if operador not in ("+", "-", "*", "/"):
            return self._definir_erro(MSG_ERRO_ENTRADA)

        op_tipado: OperadorValido = operador  # type: ignore[assignment]

        if self._erro_ativo:
            return self.obter_estado()

        try:
            valor_decimal_atual = Decimal(self._valor_atual)
        except InvalidOperation:
            return self._definir_erro(MSG_ERRO_ENTRADA)

        if self._operador_atual is not None and not self._aguardando_novo_operando:
            estado_calculado = self.calcular()
            if estado_calculado.erro_ativo:
                return estado_calculado
            valor_decimal_atual = Decimal(self._valor_atual)

        self._operando_anterior = valor_decimal_atual
        self._operador_atual = op_tipado
        self._aguardando_novo_operando = True
        simbolo = SIMBOLOS_VISUAIS[op_tipado]
        self._expressao_topo = (
            f"{self._formatar_exibicao(self._normalizar_decimal(valor_decimal_atual))} {simbolo}"
        )
        return self.obter_estado()

    def calcular(self) -> EstadoCalculadora:
        """Executa a operação pendente e registra no histórico da sessão."""
        if self._erro_ativo:
            return self.obter_estado()

        if self._operador_atual is None or self._operando_anterior is None:
            return self.obter_estado()

        try:
            operando_direito = Decimal(self._valor_atual)
        except InvalidOperation:
            return self._definir_erro(MSG_ERRO_ENTRADA)

        op = self._operador_atual
        esquerda = self._operando_anterior

        if op == "/" and operando_direito == Decimal("0"):
            return self._definir_erro(MSG_ERRO_DIVISAO_ZERO)

        try:
            if op == "+":
                resultado = esquerda + operando_direito
            elif op == "-":
                resultado = esquerda - operando_direito
            elif op == "*":
                resultado = esquerda * operando_direito
            elif op == "/":
                resultado = esquerda / operando_direito
            else:
                return self._definir_erro(MSG_ERRO_ENTRADA)
        except (InvalidOperation, ZeroDivisionError, OverflowError):
            return self._definir_erro(MSG_ERRO_ENTRADA)

        str_esquerda = self._formatar_exibicao(self._normalizar_decimal(esquerda))
        str_direita = self._formatar_exibicao(self._normalizar_decimal(operando_direito))
        str_resultado_norm = self._normalizar_decimal(resultado)
        str_resultado_exib = self._formatar_exibicao(str_resultado_norm)
        simbolo = SIMBOLOS_VISUAIS[op]

        expressao_completa = f"{str_esquerda} {simbolo} {str_direita} ="
        horario_atual = datetime.now().strftime("%H:%M:%S")

        self._historico.insert(
            0,
            ItemHistorico(
                expressao=expressao_completa,
                resultado=str_resultado_exib,
                horario=horario_atual,
            ),
        )

        self._valor_atual = str_resultado_norm
        self._expressao_topo = expressao_completa
        self._operando_anterior = None
        self._operador_atual = None
        self._aguardando_novo_operando = True
        return self.obter_estado()

    def restaurar_do_historico(self, valor_formatado: str) -> EstadoCalculadora:
        """Permite reutilizar um resultado do histórico clicando sobre ele."""
        valor_limpo = valor_formatado.replace(".", "").replace(",", ".")
        try:
            numero = Decimal(valor_limpo)
        except InvalidOperation:
            return self._definir_erro(MSG_ERRO_ENTRADA)

        if self._erro_ativo:
            self.limpar_tudo()

        self._valor_atual = self._normalizar_decimal(numero)
        self._aguardando_novo_operando = False
        return self.obter_estado()

    def _definir_erro(self, mensagem: str) -> EstadoCalculadora:
        """Configura estado seguro de erro preservando o histórico da sessão."""
        self._valor_atual = mensagem
        self._operando_anterior = None
        self._operador_atual = None
        self._aguardando_novo_operando = True
        self._erro_ativo = True
        return self.obter_estado()

    @staticmethod
    def _normalizar_decimal(valor: Decimal) -> str:
        """Arredonda até 10 casas decimais e remove zeros à direita desnecessários."""
        arredondado = valor.quantize(Decimal("0.0000000001"), rounding=ROUND_HALF_UP)
        normalizado = arredondado.normalize()
        texto = format(normalizado, "f")
        if texto == "-0":
            return "0"
        return texto

    @staticmethod
    def _formatar_exibicao(valor_bruto: str) -> str:
        """Formata o número no padrão brasileiro de leitura (vírgula decimal) ou mantém erro."""
        if valor_bruto.startswith("Erro"):
            return valor_bruto

        negativo = valor_bruto.startswith("-")
        sem_sinal = valor_bruto[1:] if negativo else valor_bruto

        if "." in sem_sinal:
            parte_inteira, parte_decimal = sem_sinal.split(".", 1)
            inteiro_formatado = f"{int(parte_inteira):,}".replace(",", ".") if parte_inteira else "0"
            resultado = f"{inteiro_formatado},{parte_decimal}"
        else:
            inteiro_formatado = f"{int(sem_sinal):,}".replace(",", ".") if sem_sinal.isdigit() else sem_sinal
            resultado = inteiro_formatado

        return f"-{resultado}" if negativo else resultado
