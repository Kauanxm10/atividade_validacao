const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let tarefas = [
  {
    id: "1",
    titulo: "Estudar conceitos de REST API",
    descricao: "Revisar os verbos HTTP (GET, POST, PUT, DELETE) e status codes.",
    categoria: "Estudos",
    prioridade: "Alta",
    status: "Concluída",
    dataVencimento: "2026-08-30",
    dataCriacao: new Date().toISOString()
  },
  {
    id: "2",
    titulo: "Desenvolver Back-end em Express",
    descricao: "Criar rotas CRUD e validação de dados recebidos no corpo da requisição.",
    categoria: "Trabalho",
    prioridade: "Média",
    status: "Em Andamento",
    dataVencimento: "2026-09-02",
    dataCriacao: new Date().toISOString()
  },
  {
    id: "3",
    titulo: "Testar acessibilidade com leitor de tela",
    descricao: "Verificar navegação por teclado e marcação de HTML semântico.",
    categoria: "Projetos",
    prioridade: "Alta",
    status: "Pendente",
    dataVencimento: "2026-09-05",
    dataCriacao: new Date().toISOString()
  },
  {
    id: "4",
    titulo: "Refatorar componentes de UI no Front-end",
    descricao: "Atualizar layout para cards arredondados, fonte moderna e ícones minimalistas.",
    categoria: "Projetos",
    prioridade: "Média",
    status: "Em Andamento",
    dataVencimento: "2026-09-01",
    dataCriacao: new Date().toISOString()
  },
  {
    id: "5",
    titulo: "Organizar documentação no README.md",
    descricao: "Escrever visão geral, estrutura do projeto e instruções de execução da aplicação.",
    categoria: "Trabalho",
    prioridade: "Baixa",
    status: "Concluída",
    dataVencimento: "2026-08-28",
    dataCriacao: new Date().toISOString()
  },
  {
    id: "6",
    titulo: "Revisar entrega da avaliação com a equipe",
    descricao: "Validar todos os requisitos funcionais e não funcionais exigidos.",
    categoria: "Trabalho",
    prioridade: "Alta",
    status: "Pendente",
    dataVencimento: "2026-08-29",
    dataCriacao: new Date().toISOString()
  },
  {
    id: "7",
    titulo: "Planejar próximos passos dos estudos",
    descricao: "Mapear conteúdos avançados de arquitetura de software e testes automatizados.",
    categoria: "Pessoal",
    prioridade: "Baixa",
    status: "Pendente",
    dataVencimento: "2026-09-10",
    dataCriacao: new Date().toISOString()
  }
];

function validarTarefa(dados) {
  const erros = [];
  
  if (!dados.titulo || typeof dados.titulo !== 'string' || dados.titulo.trim().length < 3) {
    erros.push("O título é obrigatório e deve ter no mínimo 3 caracteres.");
  }
  if (!dados.categoria || typeof dados.categoria !== 'string' || dados.categoria.trim() === '') {
    erros.push("A categoria é obrigatória.");
  }
  const prioridadesValidas = ["Baixa", "Média", "Alta"];
  if (!dados.prioridade || !prioridadesValidas.includes(dados.prioridade)) {
    erros.push("A prioridade deve ser 'Baixa', 'Média' ou 'Alta'.");
  }
  const statusValidos = ["Pendente", "Em Andamento", "Concluída"];
  if (!dados.status || !statusValidos.includes(dados.status)) {
    erros.push("O status deve ser 'Pendente', 'Em Andamento' ou 'Concluída'.");
  }
  
  if (dados.dataVencimento) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const hojeISO = `${ano}-${mes}-${dia}`;

    if (dados.dataVencimento < hojeISO) {
      erros.push("A data de vencimento não pode ser uma data no passado.");
    }
  }

  return erros;
}

app.get('/api/tarefas', (req, res) => {
  const { busca, status, prioridade } = req.query;
  let resultado = [...tarefas];

  if (busca) {
    const termo = busca.toLowerCase();
    resultado = resultado.filter(t => 
      t.titulo.toLowerCase().includes(termo) || 
      t.descricao.toLowerCase().includes(termo)
    );
  }

  if (status) {
    resultado = resultado.filter(t => t.status === status);
  }

  if (prioridade) {
    resultado = resultado.filter(t => t.prioridade === prioridade);
  }

  res.json({
    sucesso: true,
    total: resultado.length,
    dados: resultado
  });
});

app.get('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const tarefa = tarefas.find(t => t.id === id);

  if (!tarefa) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Tarefa não encontrada."
    });
  }

  res.json({
    sucesso: true,
    dados: tarefa
  });
});

app.post('/api/tarefas', (req, res) => {
  const { titulo, descricao, categoria, prioridade, status, dataVencimento } = req.body;
  const statusDefinido = status || "Pendente";

  const erros = validarTarefa({ titulo, categoria, prioridade, status: statusDefinido });
  if (erros.length > 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Falha na validação dos dados.",
      erros: erros
    });
  }

  const novaTarefa = {
    id: Date.now().toString(),
    titulo: titulo.trim(),
    descricao: descricao ? descricao.trim() : "",
    categoria: categoria.trim(),
    prioridade,
    status: statusDefinido,
    dataVencimento: dataVencimento || null,
    dataCriacao: new Date().toISOString()
  };

  tarefas.push(novaTarefa);

  res.status(201).json({
    sucesso: true,
    mensagem: "Tarefa cadastrada com sucesso!",
    dados: novaTarefa
  });
});

app.put('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const index = tarefas.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Tarefa não encontrada para atualização."
    });
  }

  const { titulo, descricao, categoria, prioridade, status, dataVencimento } = req.body;

  const erros = validarTarefa({ titulo, categoria, prioridade, status });
  if (erros.length > 0) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Falha na validação dos dados.",
      erros: erros
    });
  }

  tarefas[index] = {
    ...tarefas[index],
    titulo: titulo.trim(),
    descricao: descricao ? descricao.trim() : "",
    categoria: categoria.trim(),
    prioridade,
    status,
    dataVencimento: dataVencimento || null
  };

  res.json({
    sucesso: true,
    mensagem: "Tarefa atualizada com sucesso!",
    dados: tarefas[index]
  });
});

app.delete('/api/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const index = tarefas.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      sucesso: false,
      mensagem: "Tarefa não encontrada para remoção."
    });
  }

  const tarefaRemovida = tarefas.splice(index, 1)[0];

  res.json({
    sucesso: true,
    mensagem: "Tarefa excluída com sucesso!",
    dados: tarefaRemovida
  });
});

app.listen(PORT, () => {
  console.log(` Servidor backend rodando com sucesso na porta ${PORT}: http://localhost:${PORT}`);
});
