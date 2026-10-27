# 🧮 Calculadora Desktop em Python (CustomTkinter)

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![CustomTkinter](https://img.shields.io/badge/GUI-CustomTkinter-1F6AA5?style=for-the-badge)
![Google AI Studio](https://img.shields.io/badge/AI-Google_AI_Studio-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Alura](https://img.shields.io/badge/Imers%C3%A3o-Alura-0A192F?style=for-the-badge)

Uma aplicação desktop de calculadora moderna e modular com interface gráfica (GUI), desenvolvida em Python utilizando **CustomTkinter**. 

Este projeto foi construído aplicando técnicas de **Engenharia de Prompt** e desenvolvimento assistido por Inteligência Artificial no **Google AI Studio**, como parte prática do curso **Imersão Engenharia de Software: Dev na Era da IA** da **Alura**.

---

## ✨ Funcionalidades

- **Operações Fundamentais:** Adição (`+`), Subtração (`-`), Multiplicação (`*`) e Divisão (`/`).
- **Interface Gráfica Moderna (GUI):** Visual limpo com suporte nativo a *Dark Mode* utilizando a biblioteca `CustomTkinter`.
- **Tratamento Robusto de Erros:** Proteção contra divisão por zero e entradas matemáticas inválidas sem travar a aplicação.
- **Arquitetura Modular (Clean Code):** Separação clara de responsabilidades entre o motor de cálculo (backend) e a interface do usuário (frontend), seguindo a PEP 8 e utilizando *Type Hints*.
- **Distribuição Standalone (`.exe`):** Suporte completo a empacotamento via `PyInstaller` para execução direta no Windows sem necessidade de ter o Python instalado.

---

## 🗂️ Arquitetura do Projeto

O código foi dividido em módulos independentes para facilitar a manutenção e escalabilidade:

```text
calculadora/
├── main.py                 # Ponto de entrada (Entry point) que inicializa a aplicação
├── interface.py            # Construção da janela, botões, temas e eventos (Frontend GUI)
├── logica.py               # Regras de negócio, operações matemáticas e validações (Backend)
├── requirements.txt        # Dependências do projeto
├── gerar_executavel.bat    # Script de automação para compilar o arquivo .exe com 1 clique
└── README.md               # Documentação do projeto
