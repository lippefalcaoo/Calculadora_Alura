export interface PythonModuleFile {
  id:
    | 'logica.py'
    | 'interface.py'
    | 'main.py'
    | 'test_logica.py'
    | 'requirements.txt'
    | 'gerar_executavel.bat';
  filename: string;
  roleTitle: string;
  summary: string;
  highlights: string[];
  code: string;
}

export const PYTHON_PROJECT_FILES: PythonModuleFile[] = [
  {
    id: 'logica.py',
    filename: 'logica.py',
    roleTitle: 'Camada de Domínio & Regras de Negócio (Backend)',
    summary:
      'Motor matemático puro em Python 3.10+ utilizando Decimal para precisão exata, dataclasses imutáveis com slots, Type Hints estritos e zero dependência de bibliotecas gráficas.',
    highlights: [
      'Aritmética exata com decimal.Decimal (elimina erros como 0.1 + 0.2 = 0.30000000000000004)',
      'Tratamento seguro para divisão por zero (MSG_ERRO_DIVISAO_ZERO) sem uso de eval()',
      'Estado imutável via @dataclass(frozen=True, slots=True) para comunicação limpa com a GUI',
    ],
    code: `"""
Módulo de lógica de negócios e cálculos matemáticos da Calculadora.

Implementa uma máquina de estados determinística utilizando \`Decimal\` para
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

        return f"-{resultado}" if negativo else resultado`,
  },
  {
    id: 'interface.py',
    filename: 'interface.py',
    roleTitle: 'Camada de Apresentação CustomTkinter (Frontend Desktop)',
    summary:
      'Janela gráfica responsiva construída com CustomTkinter (CTk), implementando tema adaptativo (Dark/Light), visor duplo, grade 5x4 de botões, painel lateral de histórico e listener de teclado físico.',
    highlights: [
      'Injeção de dependência de CalculadoraLogica no construtor (__init__)',
      'Suporte nativo a tuplas de cores (Light, Dark) do CustomTkinter',
      'Mapeamento completo de eventos <Key>, <Return>, <KP_Enter>, <BackSpace> e <Escape>',
    ],
    code: `"""
Módulo de Interface Gráfica (GUI) da Calculadora utilizando CustomTkinter.

Implementa janela responsiva em Dark Mode, visor com tipografia tabular,
grade de botões estilizados, painel lateral de histórico da sessão e
mapeamento completo de eventos do teclado físico.
"""

from __future__ import annotations

import tkinter as tk
from typing import Callable

import customtkinter as ctk

from logica import CalculadoraLogica, EstadoCalculadora, ItemHistorico


class CalculadoraApp(ctk.CTk):
    """Janela principal da calculadora construída com CustomTkinter."""

    def __init__(self, motor_logico: CalculadoraLogica) -> None:
        super().__init__()
        self._logica: CalculadoraLogica = motor_logico

        # Configuração da janela principal
        self.title("PyCalc Studio — Calculadora CustomTkinter")
        self.geometry("680x540")
        self.minsize(640, 500)
        self.configure(fg_color=("#F8FAFC", "#0F172A"))

        # Layout em 2 colunas: Calculadora (esquerda) e Histórico (direita)
        self.grid_columnconfigure(0, weight=3)
        self.grid_columnconfigure(1, weight=2)
        self.grid_rowconfigure(0, weight=1)

        # Fontes padronizadas
        self._fonte_expressao = ctk.CTkFont(family="JetBrains Mono", size=14)
        self._fonte_visor = ctk.CTkFont(family="JetBrains Mono", size=36, weight="bold")
        self._fonte_botao = ctk.CTkFont(family="Plus Jakarta Sans", size=18, weight="bold")
        self._fonte_historico = ctk.CTkFont(family="JetBrains Mono", size=13)

        # Construção dos componentes visuais
        self._criar_painel_calculadora()
        self._criar_painel_historico()
        self._vincular_teclado_fisico()

        # Renderização do estado inicial
        self._atualizar_interface(self._logica.obter_estado())

    def _criar_painel_calculadora(self) -> None:
        """Constrói o container esquerdo com visor duplo e grade 5x4 de botões."""
        self._frame_calc = ctk.CTkFrame(
            self,
            fg_color=("#FFFFFF", "#1E293B"),
            corner_radius=16,
            border_width=1,
            border_color=("#E2E8F0", "#334155"),
        )
        self._frame_calc.grid(row=0, column=0, padx=(16, 8), pady=16, sticky="nsew")

        for i in range(6):
            self._frame_calc.grid_rowconfigure(i, weight=2 if i == 0 else 1)
        for j in range(4):
            self._frame_calc.grid_columnconfigure(j, weight=1)

        # Visor de expressão e valor principal
        frame_visor = ctk.CTkFrame(
            self._frame_calc,
            fg_color=("#F1F5F9", "#0F172A"),
            corner_radius=12,
            border_width=1,
            border_color=("#CBD5E1", "#1E293B"),
        )
        frame_visor.grid(
            row=0, column=0, columnspan=4, padx=14, pady=(14, 10), sticky="nsew"
        )

        self._lbl_expressao = ctk.CTkLabel(
            frame_visor,
            text="",
            anchor="e",
            font=self._fonte_expressao,
            text_color=("#64748B", "#94A3B8"),
        )
        self._lbl_expressao.pack(fill="x", padx=16, pady=(12, 2))

        self._lbl_visor = ctk.CTkLabel(
            frame_visor,
            text="0",
            anchor="e",
            font=self._fonte_visor,
            text_color=("#0F172A", "#F8FAFC"),
        )
        self._lbl_visor.pack(fill="both", expand=True, padx=16, pady=(0, 12))

        # Definição da grade de botões: (rótulo, linha, coluna, tipo, callback)
        botoes: list[tuple[str, int, int, str, Callable[[], None]]] = [
            ("C", 1, 0, "acao_perigo", lambda: self._executar(self._logica.limpar_tudo)),
            ("⌫", 1, 1, "acao_secundaria", lambda: self._executar(self._logica.apagar_ultimo)),
            ("%", 1, 2, "acao_secundaria", lambda: self._executar(self._logica.aplicar_porcentagem)),
            ("÷", 1, 3, "operador", lambda: self._executar(lambda: self._logica.definir_operador("/"))),
            ("7", 2, 0, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("7"))),
            ("8", 2, 1, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("8"))),
            ("9", 2, 2, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("9"))),
            ("×", 2, 3, "operador", lambda: self._executar(lambda: self._logica.definir_operador("*"))),
            ("4", 3, 0, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("4"))),
            ("5", 3, 1, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("5"))),
            ("6", 3, 2, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("6"))),
            ("−", 3, 3, "operador", lambda: self._executar(lambda: self._logica.definir_operador("-"))),
            ("1", 4, 0, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("1"))),
            ("2", 4, 1, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("2"))),
            ("3", 4, 2, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("3"))),
            ("+", 4, 3, "operador", lambda: self._executar(lambda: self._logica.definir_operador("+"))),
            ("±", 5, 0, "acao_secundaria", lambda: self._executar(self._logica.inverter_sinal)),
            ("0", 5, 1, "numero", lambda: self._executar(lambda: self._logica.inserir_digito("0"))),
            (",", 5, 2, "numero", lambda: self._executar(self._logica.inserir_decimal)),
            ("=", 5, 3, "igual", lambda: self._executar(self._logica.calcular)),
        ]

        estilos: dict[str, dict[str, tuple[str, str]]] = {
            "numero": {
                "fg_color": ("#F1F5F9", "#334155"),
                "hover_color": ("#E2E8F0", "#475569"),
                "text_color": ("#0F172A", "#F8FAFC"),
            },
            "acao_secundaria": {
                "fg_color": ("#E2E8F0", "#1E293B"),
                "hover_color": ("#CBD5E1", "#334155"),
                "text_color": ("#334155", "#CBD5E1"),
            },
            "acao_perigo": {
                "fg_color": ("#FEE2E2", "#451A1A"),
                "hover_color": ("#FECACA", "#7F1D1D"),
                "text_color": ("#DC2626", "#FCA5A5"),
            },
            "operador": {
                "fg_color": ("#DBEAFE", "#1E3A8A"),
                "hover_color": ("#BFDBFE", "#1D4ED8"),
                "text_color": ("#1D4ED8", "#93C5FD"),
            },
            "igual": {
                "fg_color": ("#2563EB", "#2563EB"),
                "hover_color": ("#1D4ED8", "#3B82F6"),
                "text_color": ("#FFFFFF", "#FFFFFF"),
            },
        }

        for rotulo, linha, coluna, categoria, comando in botoes:
            cores = estilos[categoria]
            botao = ctk.CTkButton(
                self._frame_calc,
                text=rotulo,
                font=self._fonte_botao,
                corner_radius=10,
                fg_color=cores["fg_color"],
                hover_color=cores["hover_color"],
                text_color=cores["text_color"],
                command=comando,
            )
            botao.grid(row=linha, column=coluna, padx=6, pady=6, sticky="nsew")

    def _criar_painel_historico(self) -> None:
        """Constrói o painel lateral direito para consulta e reutilização do histórico."""
        self._frame_hist = ctk.CTkFrame(
            self,
            fg_color=("#FFFFFF", "#1E293B"),
            corner_radius=16,
            border_width=1,
            border_color=("#E2E8F0", "#334155"),
        )
        self._frame_hist.grid(row=0, column=1, padx=(8, 16), pady=16, sticky="nsew")
        self._frame_hist.grid_rowconfigure(1, weight=1)
        self._frame_hist.grid_columnconfigure(0, weight=1)

        header = ctk.CTkFrame(self._frame_hist, fg_color="transparent")
        header.grid(row=0, column=0, padx=14, pady=(14, 6), sticky="ew")

        lbl_titulo = ctk.CTkLabel(
            header,
            text="Histórico da Sessão",
            font=ctk.CTkFont(family="Plus Jakarta Sans", size=14, weight="bold"),
            text_color=("#0F172A", "#F8FAFC"),
        )
        lbl_titulo.pack(side="left")

        btn_limpar_hist = ctk.CTkButton(
            header,
            text="Limpar",
            width=64,
            height=26,
            corner_radius=6,
            fg_color=("#F1F5F9", "#0F172A"),
            hover_color=("#E2E8F0", "#334155"),
            text_color=("#475569", "#94A3B8"),
            font=ctk.CTkFont(family="Plus Jakarta Sans", size=12),
            command=lambda: self._executar(self._logica.limpar_historico),
        )
        btn_limpar_hist.pack(side="right")

        self._scroll_historico = ctk.CTkScrollableFrame(
            self._frame_hist,
            fg_color="transparent",
        )
        self._scroll_historico.grid(row=1, column=0, padx=10, pady=(0, 12), sticky="nsew")

    def _vincular_teclado_fisico(self) -> None:
        """Associa teclas do teclado físico e numérico às operações da calculadora."""
        self.bind("<Key>", self._processar_tecla)
        self.bind("<Return>", lambda _: self._executar(self._logica.calcular))
        self.bind("<KP_Enter>", lambda _: self._executar(self._logica.calcular))
        self.bind("<BackSpace>", lambda _: self._executar(self._logica.apagar_ultimo))
        self.bind("<Escape>", lambda _: self._executar(self._logica.limpar_tudo))
        self.bind("<Delete>", lambda _: self._executar(self._logica.limpar_tudo))

    def _processar_tecla(self, evento: tk.Event) -> None:  # type: ignore[type-arg]
        """Filtra caracteres digitados pelo usuário no teclado físico."""
        caractere = evento.char
        if not caractere:
            return

        if caractere.isdigit():
            self._executar(lambda: self._logica.inserir_digito(caractere))
        elif caractere in ("+", "-", "*", "/"):
            self._executar(lambda: self._logica.definir_operador(caractere))
        elif caractere in (".", ","):
            self._executar(self._logica.inserir_decimal)
        elif caractere == "%":
            self._executar(self._logica.aplicar_porcentagem)
        elif caractere == "=":
            self._executar(self._logica.calcular)
        elif caractere.lower() == "c":
            self._executar(self._logica.limpar_tudo)

    def _executar(self, acao: Callable[[], EstadoCalculadora]) -> None:
        """Executa uma operação do motor lógico e sincroniza os elementos visuais."""
        novo_estado = acao()
        self._atualizar_interface(novo_estado)

    def _atualizar_interface(self, estado: EstadoCalculadora) -> None:
        """Atualiza textos, cores semânticas de erro e lista lateral de histórico."""
        self._lbl_expressao.configure(text=estado.expressao_acumulada)
        self._lbl_visor.configure(text=estado.valor_visor)

        if estado.erro_ativo:
            self._lbl_visor.configure(text_color=("#DC2626", "#F87171"))
        else:
            self._lbl_visor.configure(text_color=("#0F172A", "#F8FAFC"))

        self._renderizar_itens_historico(estado.historico)

    def _renderizar_itens_historico(self, itens: list[ItemHistorico]) -> None:
        """Reconstrói os cartões clicáveis do histórico lateral."""
        for widget in self._scroll_historico.winfo_children():
            widget.destroy()

        if not itens:
            lbl_vazio = ctk.CTkLabel(
                self._scroll_historico,
                text="Nenhuma operação realizada\\nnesta sessão.",
                font=ctk.CTkFont(family="Plus Jakarta Sans", size=12),
                text_color=("#94A3B8", "#64748B"),
                justify="center",
            )
            lbl_vazio.pack(pady=32)
            return

        for item in itens:
            btn_item = ctk.CTkButton(
                self._scroll_historico,
                text=f"{item.expressao}\\n{item.resultado}  ·  {item.horario}",
                anchor="e",
                font=self._fonte_historico,
                fg_color=("#F8FAFC", "#0F172A"),
                hover_color=("#E2E8F0", "#334155"),
                text_color=("#0F172A", "#F8FAFC"),
                corner_radius=8,
                height=52,
                command=lambda val=item.resultado: self._executar(
                    lambda: self._logica.restaurar_do_historico(val)
                ),
            )
            btn_item.pack(fill="x", pady=4)`,
  },
  {
    id: 'main.py',
    filename: 'main.py',
    roleTitle: 'Ponto de Entrada & Inicialização (Entry Point)',
    summary:
      'Inicializa o tema Dark Mode do CustomTkinter, instancia o motor lógico desacoplado e injeta na janela gráfica principal.',
    highlights: [
      'Configuração explícita de ctk.set_appearance_mode("dark")',
      'Injeção de dependência limpa: CalculadoraApp(motor_logico=motor_logico)',
      'Guarda padrão if __name__ == "__main__": conforme PEP 8',
    ],
    code: `"""
Ponto de entrada (Entry Point) da Calculadora Desktop em Python 3.10+.

Configura o tema padrão Dark Mode do CustomTkinter, instancia a camada de
lógica de negócios (\`CalculadoraLogica\`) e inicia o loop de eventos da GUI.
"""

from __future__ import annotations

import customtkinter as ctk

from interface import CalculadoraApp
from logica import CalculadoraLogica


def main() -> None:
    """Inicializa as configurações globais de tema e executa a aplicação."""
    ctk.set_appearance_mode("dark")
    ctk.set_default_color_theme("blue")

    motor_logico = CalculadoraLogica()
    app = CalculadoraApp(motor_logico=motor_logico)
    app.mainloop()


if __name__ == "__main__":
    main()`,
  },
  {
    id: 'test_logica.py',
    filename: 'test_logica.py',
    roleTitle: 'Suíte de Testes Unitários (unittest)',
    summary:
      'Valida todas as operações obrigatórias (+, -, *, /), precisão decimal sem ruído de ponto flutuante e recuperação automática após divisão por zero.',
    highlights: [
      'Testa as 4 operações obrigatórias sem necessidade de abrir janela gráfica',
      'Garante que 0.1 * 0.2 retorna exatamente 0,02',
      'Verifica captura e recuperação de divisão por zero (ZeroDivisionError)',
    ],
    code: `"""
Suíte de Testes Unitários para o motor \`CalculadoraLogica\`.

Pode ser executada localmente via:
    python -m unittest test_logica.py -v
"""

from __future__ import annotations

import unittest

from logica import CalculadoraLogica, MSG_ERRO_DIVISAO_ZERO


class TestCalculadoraLogica(unittest.TestCase):
    """Valida as quatro operações básicas, casos de borda e tratamento de erros."""

    def setUp(self) -> None:
        self.calc = CalculadoraLogica()

    def test_adicao_basica(self) -> None:
        self.calc.inserir_digito("1")
        self.calc.inserir_digito("5")
        self.calc.definir_operador("+")
        self.calc.inserir_digito("2")
        self.calc.inserir_digito("7")
        estado = self.calc.calcular()
        self.assertEqual(estado.valor_visor, "42")
        self.assertFalse(estado.erro_ativo)

    def test_subtracao_com_resultado_negativo(self) -> None:
        self.calc.inserir_digito("8")
        self.calc.definir_operador("-")
        self.calc.inserir_digito("2")
        self.calc.inserir_digito("0")
        estado = self.calc.calcular()
        self.assertEqual(estado.valor_visor, "-12")

    def test_multiplicacao_precisao_decimal(self) -> None:
        # Verifica ausência de erro IEEE 754 (0.1 * 0.2 == 0.02 exato)
        self.calc.inserir_digito("0")
        self.calc.inserir_decimal()
        self.calc.inserir_digito("1")
        self.calc.definir_operador("*")
        self.calc.inserir_digito("0")
        self.calc.inserir_decimal()
        self.calc.inserir_digito("2")
        estado = self.calc.calcular()
        self.assertEqual(estado.valor_visor, "0,02")

    def test_divisao_exata_e_fracionaria(self) -> None:
        self.calc.inserir_digito("1")
        self.calc.inserir_digito("0")
        self.calc.definir_operador("/")
        self.calc.inserir_digito("4")
        estado = self.calc.calcular()
        self.assertEqual(estado.valor_visor, "2,5")

    def test_divisao_por_zero_tratamento_robusto(self) -> None:
        self.calc.inserir_digito("9")
        self.calc.definir_operador("/")
        self.calc.inserir_digito("0")
        estado = self.calc.calcular()
        self.assertTrue(estado.erro_ativo)
        self.assertEqual(estado.valor_visor, MSG_ERRO_DIVISAO_ZERO)

        # Deve se recuperar automaticamente ao digitar um novo número
        estado_recuperado = self.calc.inserir_digito("5")
        self.assertFalse(estado_recuperado.erro_ativo)
        self.assertEqual(estado_recuperado.valor_visor, "5")

    def test_backspace_e_inversao_sinal(self) -> None:
        self.calc.inserir_digito("4")
        self.calc.inserir_digito("8")
        self.calc.apagar_ultimo()
        estado = self.calc.inverter_sinal()
        self.assertEqual(estado.valor_visor, "-4")


if __name__ == "__main__":
    unittest.main()`,
  },
  {
    id: 'requirements.txt',
    filename: 'requirements.txt',
    roleTitle: 'Dependências do Ambiente Python 3.10+',
    summary:
      'Lista de pacotes necessários para instalar e executar a interface gráfica CustomTkinter em qualquer sistema operacional (Windows, macOS ou Linux).',
    highlights: [
      'customtkinter >= 5.2.2 para componentes modernos e suporte a Dark Mode',
      'Instalação rápida via pip install -r requirements.txt',
    ],
    code: `customtkinter>=5.2.2
packaging>=23.2
darkdetect>=0.8.0`,
  },
  {
    id: 'gerar_executavel.bat',
    filename: 'gerar_executavel.bat',
    roleTitle: 'Automação de Build para Windows (.exe com 1 Clique)',
    summary:
      'Script em lote do Windows que instala o PyInstaller, limpa caches anteriores, empacota main.py + CustomTkinter em arquivo único sem console e abre a pasta dist automaticamente.',
    highlights: [
      'Inclui --collect-all customtkinter para embutir temas JSON e fontes do CustomTkinter',
      'Usa --onefile e --windowed para gerar Calculadora.exe limpo sem tela preta no fundo',
      'Abre automaticamente o Windows Explorer na pasta dist ao concluir',
    ],
    code: `@echo off
chcp 65001 >nul
title Empacotador Automatico - Calculadora CustomTkinter (.exe)

echo ============================================================================
echo   INICIANDO GERACAO DO EXECUTAVEL (.EXE) - CALCULADORA CUSTOMTKINTER
echo ============================================================================
echo.

:: 1. Verifica e instala/atualiza as dependencias necessarias
echo [1/4] Verificando dependencias (CustomTkinter e PyInstaller)...
python -m pip install --upgrade pip >nul
python -m pip install -r requirements.txt pyinstaller
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias. Verifique se o Python esta no PATH.
    pause
    exit /b 1
)

:: 2. Limpa pastas de compilacoes anteriores para evitar conflitos de cache
echo.
echo [2/4] Limpando arquivos temporarios de builds anteriores...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist Calculadora.spec del /f /q Calculadora.spec

:: 3. Executa o PyInstaller empacotando temas e JSONs do CustomTkinter
echo.
echo [3/4] Compilando main.py, interface.py e logica.py em arquivo unico...
python -m PyInstaller --noconfirm --onefile --windowed --name "Calculadora" --collect-all customtkinter main.py
if %errorlevel% neq 0 (
    echo [ERRO] Ocorreu um problema durante a execucao do PyInstaller.
    pause
    exit /b 1
)

:: 4. Finalizacao e abertura automatica da pasta dist
echo.
echo [4/4] Concluido com sucesso!
echo ============================================================================
echo   Executavel gerado em: %cd%\\dist\\Calculadora.exe
echo ============================================================================
echo.
explorer dist
pause`,
  },
];
