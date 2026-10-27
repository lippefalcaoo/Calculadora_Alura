"""
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
                text="Nenhuma operação realizada\nnesta sessão.",
                font=ctk.CTkFont(family="Plus Jakarta Sans", size=12),
                text_color=("#94A3B8", "#64748B"),
                justify="center",
            )
            lbl_vazio.pack(pady=32)
            return

        for item in itens:
            btn_item = ctk.CTkButton(
                self._scroll_historico,
                text=f"{item.expressao}\n{item.resultado}  ·  {item.horario}",
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
            btn_item.pack(fill="x", pady=4)
