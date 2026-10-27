"""
Suíte de Testes Unitários para o motor `CalculadoraLogica`.

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
    unittest.main()
