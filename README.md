#  Task Tracker - Gerenciamento de Tarefas e Projetos

##  Descrição do Problema
O **Task Tracker** é uma aplicação Web Full Stack simplificada e intuitiva desenvolvida para a gestão e acompanhamento de tarefas diárias. A aplicação oferece uma interface direta e acessível para que os usuários possam cadastrar, visualizar, atualizar e remover tarefas com facilidade.

---

##  Funcionalidades Implementadas
- **Operações CRUD Completas via API REST**:
  - **Cadastrar (POST `/api/tarefas`)**: Adição de novas tarefas com título, descrição, categoria, prioridade, status e data de vencimento.
  - **Listar/Consultar (GET `/api/tarefas`)**: Exibição dinâmica de todas as tarefas cadastradas na interface.
  - **Editar/Alterar (PUT `/api/tarefas/:id`)**: Atualização dos dados de uma tarefa existente.
  - **Excluir (DELETE `/api/tarefas/:id`)**: Remoção de tarefas com confirmação do usuário.
- **Validação de Dados**:
  - Validação no Front-end com indicação clara de erro.
  - Validação no Back-end com resposta em padrão REST (HTTP status 400 Bad Request em caso de dados inválidos).
- **Notificações Toast**: Avisos de sucesso ou erro informados via `aria-live`.
- **Tema Claro / Escuro**: Suporte a alternância de tema para melhor conforto visual.

---

##  Tecnologias Utilizadas

### Back-end
- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework para criação da API REST.
- **CORS**: Middleware para liberação de requisições cross-origin.

### Front-end
- **HTML5 Semântico**: Estruturação com tags semânticas (`header`, `nav`, `main`, `section`, `article`, `form`, `footer`).
- **CSS3**: Estilos limpos e responsivos com Flexbox, CSS Grid, variáveis e Dark Mode.
- **JavaScript ES6+**: Manipulação do DOM, funções assíncronas (`async/await`), `Fetch API` e desestruturação.

---

##  Instruções para Execução

### 1. Executando o Back-end
No terminal, entre na pasta `backend` e execute:

```bash
cd backend
npm install
npm start
```
O servidor estará rodando em: `http://localhost:3000`

### 2. Executando o Front-end
- Abra o arquivo `frontend/index.html` diretamente no seu navegador de preferência, ou utilize a extensão **Live Server** do VS Code.

---

##  Avaliação de Acessibilidade e Usabilidade

### Ferramentas e Técnicas Utilizadas:
1. **Google Chrome Lighthouse**: Auditoria de acessibilidade garantindo bom contraste e tags acessíveis.
2. **Navegação Exclusiva por Teclado**: Foco visível (`:focus-visible`), atalho para o conteúdo principal (`skip-link`) e fechamento de modal com a tecla `Escape`.
3. **Leitores de Tela (WAI-ARIA)**: Uso de rótulos `<label for="...">`, `aria-live="polite"` para notificações e `role="dialog"` na janela modal.