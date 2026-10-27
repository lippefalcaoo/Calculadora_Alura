<div align="center">

# 🧮 PyCalc Studio — Calculadora Desktop

**Uma calculadora moderna em Python com interface gráfica (GUI) em Dark Mode, construída com arquitetura modular e Engenharia de Prompt.**

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![CustomTkinter](https://img.shields.io/badge/GUI-CustomTkinter-1F6AA5?style=for-the-badge)
![Google AI Studio](https://img.shields.io/badge/AI-Google_AI_Studio-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Alura](https://img.shields.io/badge/Imers%C3%A3o-Alura-0A192F?style=for-the-badge)

[Sobre o Projeto](#-sobre-o-projeto) •
[Interface & Funções](#-interface-e-funcionalidades-uiux) •
[Como Executar](#-como-executar-passo-a-passo) •
[Arquitetura](#-arquitetura-do-projeto)

</div>

---

## 💡 Sobre o Projeto

Este projeto foi desenvolvido durante a **Imersão Engenharia de Software: Dev na Era da IA** da **Alura**, utilizando o **Google AI Studio** para estruturar desde o planejamento arquitetural até a automação de empacotamento.

O foco principal foi aplicar boas práticas de Engenharia de Software (Clean Code, PEP 8, Type Hints e testes unitários) separando completamente a **interface gráfica (Frontend)** do **motor de cálculo (Backend)**.

---

## 🎨 Interface e Funcionalidades (UI/UX)

A interface foi projetada com **CustomTkinter** priorizando ergonomia visual, contraste em *Dark Mode* e feedback imediato de erros matemáticos:

| Operação / Recurso | Símbolo | Comportamento na Interface (UX) |
| :--- | :---: | :--- |
| **Adição** | `+` | Soma valores inteiros ou decimais em cadeia |
| **Subtração** | `-` | Realiza subtração e permite números negativos |
| **Multiplicação** | `*` ou `×` | Multiplica fatores com precisão de ponto flutuante |
| **Divisão Segura** | `/` ou `÷` | Calcula a razão e **bloqueia divisão por zero** com alerta amigável no visor |
| **Limpeza Rápida** | `C` / `CE` | Reseta o visor e o estado da memória instantaneamente |
| **Cálculo Direto** | `=` / `Enter` | Processa a expressão atual e exibe o resultado formatado |

---

## 🚀 Como Executar (Passo a Passo)

Os arquivos do aplicativo Python ficam organizados dentro da pasta **`python_project`**. Siga o guia rápido abaixo no seu terminal (VS Code ou PowerShell):

### 1️⃣ Clonar e entrar na pasta correta
```powershell
git clone [https://github.com/lippefalcaoo/Calculadora_Alura.git](https://github.com/lippefalcaoo/Calculadora_Alura.git)
cd Calculadora_Alura/python_project
