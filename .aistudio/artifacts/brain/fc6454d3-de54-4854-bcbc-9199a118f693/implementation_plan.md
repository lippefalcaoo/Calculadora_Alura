# Calculadora Desktop em Python 3.10+ com CustomTkinter & Estúdio Interativo

Este projeto entrega uma solução completa de engenharia para a **Calculadora Desktop em Python 3.10+ com CustomTkinter**, combinando um **Simulador Interativo fiel ao CustomTkinter (Dark Mode)** diretamente executável no navegador com o **Código-Fonte Modular em Python (`main.py`, `interface.py`, `logica.py` e `test_logica.py`)** pronto para cópia, download e execução local.

### User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem suas escolhas confirmadas na etapa de alinhamento e definem o escopo funcional e arquitetural antes da geração do código.

- **Decisão Confirmada 1 — Biblioteca Gráfica**: Uso do **CustomTkinter** com tema moderno em **Dark Mode** nativo, cantos arredondados suaves, contraste elevado e tipografia tabular.
- **Decisão Confirmada 2 — Arquitetura Modular**: Separação estrita de responsabilidades em três módulos independentes (`main.py` para inicialização, `interface.py` para a camada visual e eventos de UI, e `logica.py` para o motor matemático puro com Type Hints e conformidade com a PEP 8).
- **Decisão Confirmada 3 — Entrada Híbrida (Teclado Físico + Mouse)**: Mapeamento completo de teclas numéricas (`0-9`), operadores (`+`, `-`, `*`, `/`, `%`), ponto/vírgula decimal (`.` ou `,`), cálculo (`Enter` / `=`), correção (`Backspace`) e limpeza total (`Escape` / `Delete`).
- **Decisão Confirmada 4 — Escopo de Operações e Usabilidade**: As quatro operações básicas obrigatórias (`+`, `-`, `*`, `/`) com proteção robusta contra divisão por zero e entradas inválidas, acompanhadas de suporte a decimais, `Backspace`, inversão de sinal (`±`), porcentagem (`%`) e painel lateral de histórico da sessão.

---

### 1. Overview & Core Concept

- **O Que Faz**: Fornece tanto a experiência funcional imediata da calculadora CustomTkinter (com suporte a teclado físico, histórico lateral e inspeção de estado em tempo real) quanto os scripts Python 3.10+ completos, documentados com *docstrings*, *Type Hints* e bateria de testes automatizados.
- **Público-Alvo / Persona**: Desenvolvedores e estudantes de Engenharia de Software em Python que buscam uma referência prática de *Clean Code*, desacoplamento MVC/MVP entre lógica de negócios e interface gráfica, e tratamento seguro de exceções.
- **Valor Principal**: Elimina o acoplamento comum em tutoriais de GUI (onde expressões são avaliadas com `eval()` diretamente nos callbacks dos botões), substituindo-o por um motor de cálculo seguro, testável e determinístico.

---

### 2. User Experience & Visual Design

- **Fluxos Principais do Usuário**:
  1. **Operação na Calculadora (Teclado ou Clique)**: O usuário digita ou clica nos números e operadores; o visor secundário exibe a expressão acumulada (ex: `125 × 4 =`) enquanto o visor principal apresenta o valor formatado com precisão decimal.
  2. **Tratamento Visual de Erros**: Ao tentar dividir por zero (ex: `42 ÷ 0`), o motor captura a condição, exibe uma mensagem clara (`Erro: Divisão por zero`) no visor sem travar a aplicação, destaca o estado de erro visualmente e permite recuperação imediata ao pressionar qualquer número ou `C`.
  3. **Consulta e Reutilização do Histórico Lateral**: Cada operação concluída é registrada no painel lateral de histórico com horário e expressão completa; clicar em um item do histórico restaura o resultado no visor para novos cálculos.
  4. **Inspeção e Exportação do Código Python**: O usuário alterna entre os módulos Python (`logica.py`, `interface.py`, `main.py`, `test_logica.py`), executa a suíte de testes unitários para validar os casos de borda e copia ou baixa os arquivos `.py` prontos para rodar localmente.
- **Identidade Visual & Tema**:
  - *Direção Estética*: Utilitário de precisão inspirado no **CustomTkinter Dark Mode** (`#0F172A` / `#1E293B`), combinando superfícies foscas discretas, bordas de 1px sutis e hierarquia funcional clara.
  - *Paleta de Cores (60-30-10)*:
    - **60% Canvas Dominante**: Slate profundo (`#0F172A` no modo escuro, `#F8FAFC` no modo claro) para descanso visual.
    - **30% Superfícies Estruturais**: Painéis e botões numéricos em cinza-azulado escuro (`#1E293B` / `#334155`) com texto de alto contraste (`#F8FAFC`).
    - **10% Orçamento de Acento**: Azul CustomTkinter (`#2563EB` / `#3B82F6`) para operadores principais e botão de igualdade (`=`), além de vermelho semântico (`#DC2626`) acompanhado de rótulo textual explícito para estados de erro.
  - *Tipografia & Hierarquia*:
    - Interface e Títulos: `Plus Jakarta Sans` para cabeçalhos e controles.
    - Visor Numérico, Histórico e Código Python: `JetBrains Mono` com `font-variant-numeric: tabular-nums` obrigatório para alinhamento vertical perfeito de dígitos e casas decimais.
- **Feedback Interativo & Movimento**:
  - Resposta tátil visual imediata ($\le 150\text{ms}$) ao pressionar teclas físicas no teclado (o botão correspondente na interface ilumina-se em sincronia com a tecla física pressionada).

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Máquina de Estados Explícita vs. `eval()` em Python**
  - *Abordagem Escolhida*: Implementar uma classe dedicada `CalculadoraLogica` em `logica.py` utilizando `Decimal` (da biblioteca padrão `decimal`) ou aritmética controlada com máquina de estados explícita (`operando_anterior`, `operador_atual`, `operando_atual`).
  - *Por Quê*: Evita falhas de segurança e imprecisões de ponto flutuante binário (como `0.1 + 0.2 = 0.30000000000000004`), além de permitir tratamento exato para `ZeroDivisionError` e entradas inválidas.
  - *Alternativas Consideradas*: Uso de `eval()` nativo do Python foi descartado por violar boas práticas de Clean Code e segurança.
- **Decisão 2: Desacoplamento Total entre `interface.py` e `logica.py`**
  - *Abordagem Escolhida*: O módulo `logica.py` não importa `customtkinter` nem conhece elementos visuais; ele expõe métodos tipados puros (`inserir_digito`, `definir_operador`, `calcular`, `limpar`, `apagar_ultimo`, `inverter_sinal`, `aplicar_porcentagem`) e retorna um `EstadoCalculadora` imutável (`dataclass`).
  - *Por Quê*: Permite testar 100% das regras de negócio via `unittest`/`pytest` sem precisar abrir janelas gráficas e facilita a manutenção.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Diagrama de Arquitetura e Componentes**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         main.py (Entry Point)                            │
│    Configura tema CustomTkinter (Dark Mode) e instancia a aplicação      │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    interface.py (Camada de Visão / GUI)                  │
│  ┌──────────────────────────────┐    ┌────────────────────────────────┐  │
│  │  Visor Principal & Expressão │    │  Painel Lateral de Histórico   │  │
│  │   (Display Tabular-Nums)     │    │  (Sessão atual + Reutilização) │  │
│  └──────────────┬───────────────┘    └───────────────▲────────────────┘  │
│                 │                                    │                   │
│  ┌──────────────┴───────────────┐    ┌───────────────┴────────────────┐  │
│  │   Grade de Botões CTkButton  │    │  Listener de Teclado Físico    │  │
│  │  (Números, Operadores, Ações)│    │ (<Key>, <Return>, <BackSpace>) │  │
│  └──────────────┬───────────────┘    └───────────────┬────────────────┘  │
└─────────────────┼────────────────────────────────────┼───────────────────┘
                  │         Chamadas Tipadas           │
                  └──────────────────┬─────────────────┘
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                logica.py (Camada de Domínio / Motor Puro)                │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ Classe CalculadoraLogica (Python 3.10+ | PEP 8 | Type Hints)       │  │
│  │  • Aritmética precisa (Decimal) para +, -, *, /, %, ±              │  │
│  │  • Validação de entradas e captura de Divisão por Zero             │  │
│  │  • Registro estruturado de ItemHistorico (dataclass)               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Modelo de Dados & Estado (`EstadoCalculadora` & `ItemHistorico`)**:
  - `valor_visor` (`str`): Texto formatado exibido no visor principal (ou mensagem de erro amigável).
  - `expressao_acumulada` (`str`): Linha superior indicando o primeiro operando e a operação pendente.
  - `erro_ativo` (`bool`): Flag booleana indicando se o estado atual é um erro aritmético (ex: divisão por zero), bloqueando encadeamento inválido até que o usuário insira novo dígito ou limpe.
  - `historico` (`list[ItemHistorico]`): Lista de registros contendo `expressao`, `resultado` e `horario`.
- **Mapeamento Interativo de Componentes e Estados**:
  - **Entrada de Dígitos e Decimal (`0-9`, `.`, `,`)**: Ignora múltiplos pontos decimais no mesmo número; se `erro_ativo` for verdadeiro ou um cálculo acabou de ser finalizado com `=`, inicia um novo operando automaticamente.
  - **Operadores (`+`, `-`, `*`, `/`)**: Se já houver um operador pendente e o segundo operando tiver sido digitado, resolve a operação intermediária antes de registrar o novo operador (suporte a operações encadeadas como `10 + 5 - 3`). Permite trocar o operador caso o usuário clique em outro operador consecutivamente.
  - **Divisão por Zero (`/ 0 =`)**: Captura a exceção no motor de cálculo, define `erro_ativo = True`, atualiza `valor_visor = "Erro: Divisão por 0"` e preserva a estabilidade da GUI.
  - **Ações Rápidas (`Backspace`, `C`, `±`, `%`)**: `Backspace` remove o último caractere do operando atual (voltando para `"0"` quando esvaziado); `±` alterna o sinal algébrico do valor exibido; `%` calcula o percentual contextual (em adições/subtrações aplica sobre a base, ou divide por 100 em operações diretas).
