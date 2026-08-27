# Task Tracker - Gerenciamento de Tarefas e Projetos

## Visão Geral
O **Task Tracker** é uma aplicação Web Full Stack moderna, intuitiva e acessível desenvolvida para a gestão e acompanhamento de tarefas e projetos diários. A aplicação oferece uma interface limpa e responsiva para que os usuários possam cadastrar, visualizar, editar, remover e acompanhar o histórico de tarefas concluídas com praticidade e rapidez.

---

## Destaques de Design e Interface (UI/UX)
- **Navegação por Abas (SPA)**: Alternância fluida entre as visões **"Minhas Tarefas"** e **"Histórico de Concluídas"**, com contadores dinâmicos de tarefas em tempo real no cabeçalho.
- **Organização Visual por Prioridade**: Agrupamento automático dos cards de tarefas ativas em seções distintas por nível de prioridade (**Alta**, **Média** e **Baixa**).
- **Tema Claro por Padrão**: Interface limpa e minimalista focada na legibilidade do conteúdo.
- **Ícones Vetoriais SVG Minimalistas**: Emojis substituídos por ícones vetoriais modernos para ações, abas e metadados das tarefas.
- **Cards Arredondados e Estilização de Histórico**: Cartões com cantos arredondados (`16px`), transições de *hover*, sombras suaves e indicador lateral colorido para tarefas concluídas.
- **Tipografia Modernizada**: Integração com a fonte **Plus Jakarta Sans** via Google Fonts.

---

## Funcionalidades Implementadas
- **Navegação em Duas Páginas / Visões**:
  - **Minhas Tarefas**: Focada exclusivamente em tarefas pendentes e em andamento.
  - **Histórico de Concluídas**: Página dedicada que registra todas as tarefas finalizadas, exibindo a data de conclusão e permitindo a ação de **Reabrir** (restaurando o status da tarefa para *Pendente*).
- **Operações CRUD Completas via API REST**:
  - **Cadastrar (`POST /api/tarefas`)**: Criação de novas tarefas com título, descrição, categoria, prioridade e data de vencimento (iniciando automaticamente com status **Pendente** e controle de `dataConclusao`).
  - **Listar/Consultar (`GET /api/tarefas`)**: Carregamento e renderização dinâmica dos cards com suporte a filtros por query (`?status=Concluída`).
  - **Editar (`PUT /api/tarefas/:id`)**: Atualização completa de tarefas via modal interativo, gerenciando o registro automático da data de conclusão.
  - **Excluir (`DELETE /api/tarefas/:id`)**: Remoção de tarefas com confirmação de segurança.
- **Validação de Dados Robustas**:
  - **Front-end**: Feedback instantâneo no formulário, restrição nativa de calendário (`min`) e bloqueio de datas de vencimento no passado com mensagem informativa.
  - **Back-end**: Validação de campos obrigatórios e rejeição de datas no passado (`HTTP 400 Bad Request`).
- **Alteração Rápida de Status Sem Abrir o Modal**: Seletor interativo em cada card para alterar o status (*Pendente*, *Em Andamento*, *Concluída*) em 1 clique diretamente na lista, enviando automaticamente a tarefa para o histórico ao finalizá-la.
- **Notificações Toast**: Avisos de sucesso e erro apresentados de forma não intrusiva.

---

## Estrutura do Projeto

```text
atividade_validacao/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

---

## Tecnologias Utilizadas

### Back-end
- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express.js**: Framework Web minimalista para estruturação da API REST.
- **CORS**: Middleware para liberação de requisições *cross-origin*.

### Front-end
- **HTML5 Semântico**: Tags semânticas (`header`, `nav`, `main`, `section`, `article`, `form`, `footer`).
- **CSS3 Moderno**: Flexbox, CSS Grid, variáveis CSS, cantos arredondados e sombras em camadas.
- **Plus Jakarta Sans**: Tipografia limpa e legível integrada via Google Fonts.
- **JavaScript ES6+**: Manipulação dinâmica do DOM, `async/await` e `Fetch API`.

---

## Instruções para Execução

### 1. Iniciar o Back-end
No terminal, navegue até a pasta `backend` e execute os comandos:

```bash
cd backend
npm install
npm start
```
O servidor estará ativo em: `http://localhost:3000`

### 2. Abrir o Front-end
- Abra o arquivo `frontend/index.html` diretamente no seu navegador, ou utilize a extensão **Live Server** do VS Code.

---

## Avaliação de Acessibilidade e Usabilidade
1. **Navegação Exclusiva por Teclado**:
   - Link de atalho para pular direto para o conteúdo principal (`skip-link`).
   - Navegação por abas com atributos WAI-ARIA (`aria-selected`).
   - Destaque visual de foco acessível (`:focus-visible`).
   - Fechamento da janela modal com a tecla `Escape`.
2. **Leitores de Tela (WAI-ARIA)**:
   - Notificações toast com atributo `aria-live="polite"`.
   - Navegação de páginas rotulada com `aria-label="Navegação do aplicativo"`.
   - Modal com marcação `role="dialog"` e `aria-modal="true"`.
   - Associação direta entre rótulos `<label>` e campos `<input>`.