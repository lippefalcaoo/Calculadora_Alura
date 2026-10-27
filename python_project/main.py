"""
Ponto de entrada (Entry Point) da Calculadora Desktop em Python 3.10+.

Configura o tema padrão Dark Mode do CustomTkinter, instancia a camada de
lógica de negócios (`CalculadoraLogica`) e inicia o loop de eventos da GUI.
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
    main()
