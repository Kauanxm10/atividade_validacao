const API_URL = 'http://localhost:3000/api/tarefas';

let tarefasState = [];
let abaAtual = 'tarefas';

const tabTarefas = document.getElementById('tab-tarefas');
const tabHistorico = document.getElementById('tab-historico');
const paginaTarefas = document.getElementById('pagina-tarefas');
const paginaHistorico = document.getElementById('pagina-historico');

const badgeCountAtivas = document.getElementById('badge-count-ativas');
const badgeCountConcluidas = document.getElementById('badge-count-concluidas');

const listaTarefasEl = document.getElementById('lista-tarefas');
const listaHistoricoEl = document.getElementById('lista-historico');

const modalEl = document.getElementById('modal-tarefa');
const formTarefa = document.getElementById('form-tarefa');
const btnNovaTarefa = document.getElementById('btn-nova-tarefa');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelar = document.getElementById('btn-cancelar');

const inputId = document.getElementById('tarefa-id');
const inputTitulo = document.getElementById('input-titulo');
const inputDescricao = document.getElementById('input-descricao');
const selectCategoria = document.getElementById('select-categoria');
const selectPrioridade = document.getElementById('select-prioridade');
const inputVencimento = document.getElementById('input-vencimento');


function alternarAba(novaAba) {
  abaAtual = novaAba;

  if (abaAtual === 'tarefas') {
    tabTarefas.classList.add('active');
    tabTarefas.setAttribute('aria-selected', 'true');
    tabHistorico.classList.remove('active');
    tabHistorico.setAttribute('aria-selected', 'false');

    paginaTarefas.classList.remove('hidden');
    paginaHistorico.classList.add('hidden');
  } else {
    tabHistorico.classList.add('active');
    tabHistorico.setAttribute('aria-selected', 'true');
    tabTarefas.classList.remove('active');
    tabTarefas.setAttribute('aria-selected', 'false');

    paginaHistorico.classList.remove('hidden');
    paginaTarefas.classList.add('hidden');
  }
}


async function carregarTarefas() {
  try {
    const resposta = await fetch(API_URL);
    
    if (!resposta.ok) throw new Error("Erro ao buscar tarefas do servidor.");
    
    const resultado = await resposta.json();
    tarefasState = resultado.dados;
    
    atualizarContadores();
    renderizarCards();
    renderizarHistorico();
  } catch (erro) {
    exibirToast(erro.message, 'error');
  }
}

function atualizarContadores() {
  const ativas = tarefasState.filter(t => t.status !== 'Concluída').length;
  const concluidas = tarefasState.filter(t => t.status === 'Concluída').length;

  if (badgeCountAtivas) badgeCountAtivas.textContent = ativas;
  if (badgeCountConcluidas) badgeCountConcluidas.textContent = concluidas;
}

async function salvarTarefa(event) {
  event.preventDefault();

  if (!validarFormulario()) return;

  const id = inputId.value;
  const ehEdicao = Boolean(id);

  let statusTarefa = 'Pendente';
  if (ehEdicao) {
    const tarefaExistente = tarefasState.find(t => t.id === id);
    if (tarefaExistente) statusTarefa = tarefaExistente.status;
  }

  const dadosTarefa = {
    titulo: inputTitulo.value.trim(),
    descricao: inputDescricao.value.trim(),
    categoria: selectCategoria.value,
    prioridade: selectPrioridade.value,
    status: statusTarefa,
    dataVencimento: inputVencimento.value || null
  };

  const url = ehEdicao ? `${API_URL}/${id}` : API_URL;
  const metodo = ehEdicao ? 'PUT' : 'POST';

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosTarefa)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      const msg = resultado.erros ? resultado.erros.join(" ") : resultado.mensagem;
      throw new Error(msg);
    }

    exibirToast(resultado.mensagem, 'success');
    fecharModal();
    carregarTarefas();
  } catch (erro) {
    exibirToast(erro.message, 'error');
  }
}

async function excluirTarefa(id, titulo) {
  if (!confirm(`Tem certeza que deseja excluir a tarefa "${titulo}"?`)) return;

  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem);

    exibirToast(resultado.mensagem, 'success');
    carregarTarefas();
  } catch (erro) {
    exibirToast(erro.message, 'error');
  }
}


function renderizarCards() {
  listaTarefasEl.innerHTML = '';

  const tarefasAtivas = tarefasState.filter(t => t.status !== 'Concluída');

  if (tarefasAtivas.length === 0) {
    listaTarefasEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <p>Nenhuma tarefa pendente ou em andamento.</p>
      </div>
    `;
    return;
  }

  const prioridades = [
    { chave: 'Alta', titulo: 'Prioridade Alta', badgeClass: 'badge-alta' },
    { chave: 'Média', titulo: 'Prioridade Média', badgeClass: 'badge-media' },
    { chave: 'Baixa', titulo: 'Prioridade Baixa', badgeClass: 'badge-baixa' }
  ];

  prioridades.forEach(p => {
    const tarefasDoGrupo = tarefasAtivas.filter(t => t.prioridade === p.chave);

    const grupoSection = document.createElement('section');
    grupoSection.className = 'priority-group';

    const header = document.createElement('div');
    header.className = 'priority-group-header';
    header.innerHTML = `
      <div class="priority-title-wrap">
        <span class="badge ${p.badgeClass}">${p.chave}</span>
        <h3 class="priority-group-title">${p.titulo}</h3>
      </div>
      <span class="priority-count">${tarefasDoGrupo.length} ${tarefasDoGrupo.length === 1 ? 'tarefa' : 'tarefas'}</span>
    `;

    grupoSection.appendChild(header);

    const list = document.createElement('div');
    list.className = 'tasks-list';

    if (tarefasDoGrupo.length === 0) {
      list.innerHTML = `
        <div class="empty-priority-state">
          <p>Nenhuma tarefa de ${p.titulo.toLowerCase()}.</p>
        </div>
      `;
    } else {
      tarefasDoGrupo.forEach(tarefa => {
        const card = criarCardTarefa(tarefa);
        list.appendChild(card);
      });
    }

    grupoSection.appendChild(list);
    listaTarefasEl.appendChild(grupoSection);
  });
}


function renderizarHistorico() {
  if (!listaHistoricoEl) return;
  listaHistoricoEl.innerHTML = '';

  const tarefasConcluidas = tarefasState.filter(t => t.status === 'Concluída');

  if (tarefasConcluidas.length === 0) {
    listaHistoricoEl.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-card); border: 1px dashed var(--border-color);">
        <svg style="width: 48px; height: 48px; margin-bottom: 1rem; color: #94a3b8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <h3 style="font-size: 1.1rem; color: var(--text-main); margin-bottom: 0.5rem;">Nenhuma tarefa no histórico</h3>
        <p>As tarefas marcadas como "Concluída" aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  const list = document.createElement('div');
  list.className = 'tasks-list';

  tarefasConcluidas.forEach(tarefa => {
    const card = criarCardHistorico(tarefa);
    list.appendChild(card);
  });

  listaHistoricoEl.appendChild(list);
}

function criarCardHistorico(tarefa) {
  const card = document.createElement('article');
  card.className = 'task-card task-card-completed';

  const classePrioridade = `badge-${tarefa.prioridade.toLowerCase().replace('é', 'e')}`;

  const dataExibicao = tarefa.dataConclusao
    ? `Concluída em ${formatarData(tarefa.dataConclusao.split('T')[0])}`
    : (tarefa.dataVencimento ? `Vencimento: ${formatarData(tarefa.dataVencimento)}` : 'Concluída');

  card.innerHTML = `
    <div class="task-info">
      <div class="task-card-header">
        <span class="status-tag status-tag-concluida">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Concluída
        </span>
        <h3 class="task-title task-title-completed">${escaparHTML(tarefa.titulo)}</h3>
        <span class="badge ${classePrioridade}">${tarefa.prioridade}</span>
      </div>
      <p class="task-desc">${escaparHTML(tarefa.descricao || 'Sem descrição.')}</p>
    </div>

    <div class="task-side">
      <div class="task-meta">
        <span>
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          ${escaparHTML(tarefa.categoria)}
        </span>
        <span>
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${dataExibicao}
        </span>
      </div>
      <div class="task-actions">
        <button class="btn-secondary btn-reabrir" title="Reabrir tarefa">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          Reabrir
        </button>
        <button class="btn-danger btn-excluir">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Excluir
        </button>
      </div>
    </div>
  `;

  card.querySelector('.btn-reabrir').addEventListener('click', () => alterarStatusRapido(tarefa, 'Pendente'));
  card.querySelector('.btn-excluir').addEventListener('click', () => excluirTarefa(tarefa.id, tarefa.titulo));

  return card;
}

async function alterarStatusRapido(tarefa, novoStatus) {
  if (tarefa.status === novoStatus) return;

  const dadosAtualizados = {
    ...tarefa,
    status: novoStatus
  };

  try {
    const resposta = await fetch(`${API_URL}/${tarefa.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados)
    });

    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem);

    const mensagemToast = novoStatus === 'Concluída'
      ? 'Tarefa enviada para o histórico de concluídas!'
      : `Status alterado para "${novoStatus}"!`;

    exibirToast(mensagemToast, 'success');
    carregarTarefas();
  } catch (erro) {
    exibirToast(erro.message, 'error');
  }
}

function criarCardTarefa(tarefa) {
  const card = document.createElement('article');
  card.className = 'task-card';

  const classePrioridade = `badge-${tarefa.prioridade.toLowerCase().replace('é', 'e')}`;
  
  const statusMap = {
    'Pendente': 'pendente',
    'Em Andamento': 'andamento',
    'Concluída': 'concluida'
  };
  const statusSlug = statusMap[tarefa.status] || 'pendente';
  const classeStatusTag = `status-tag status-tag-${statusSlug}`;

  card.innerHTML = `
    <div class="task-info">
      <div class="task-card-header">
        <h3 class="task-title">${escaparHTML(tarefa.titulo)}</h3>
        <span class="badge ${classePrioridade}">${tarefa.prioridade}</span>
        <span class="${classeStatusTag}">${escaparHTML(tarefa.status)}</span>
      </div>
      <p class="task-desc">${escaparHTML(tarefa.descricao || 'Sem descrição.')}</p>
    </div>

    <div class="task-side">
      <div class="task-meta">
        <span>
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          ${escaparHTML(tarefa.categoria)}
        </span>
        <span>
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${tarefa.dataVencimento ? formatarData(tarefa.dataVencimento) : 'Sem prazo'}
        </span>
      </div>
      <div class="task-actions">
        <select class="select-status-rapido" aria-label="Alterar status rápido">
          <option value="Pendente" ${tarefa.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
          <option value="Em Andamento" ${tarefa.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
          <option value="Concluída" ${tarefa.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
        </select>
        <button class="btn-secondary btn-editar">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Editar
        </button>
        <button class="btn-danger btn-excluir">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Excluir
        </button>
      </div>
    </div>
  `;

  card.querySelector('.select-status-rapido').addEventListener('change', (e) => {
    alterarStatusRapido(tarefa, e.target.value);
  });
  card.querySelector('.btn-editar').addEventListener('click', () => abrirModalParaEdicao(tarefa));
  card.querySelector('.btn-excluir').addEventListener('click', () => excluirTarefa(tarefa.id, tarefa.titulo));

  return card;
}


function validarFormulario() {
  let valido = true;
  document.getElementById('erro-titulo').textContent = '';
  const erroVencimentoEl = document.getElementById('erro-vencimento');
  if (erroVencimentoEl) erroVencimentoEl.textContent = '';
  
  if (!inputTitulo.value.trim() || inputTitulo.value.trim().length < 3) {
    document.getElementById('erro-titulo').textContent = 'Título é obrigatório (mínimo 3 caracteres).';
    inputTitulo.focus();
    valido = false;
  }

  if (inputVencimento.value) {
    const hoje = obterDataHojeISO();
    if (inputVencimento.value < hoje) {
      if (erroVencimentoEl) erroVencimentoEl.textContent = 'A data de vencimento não pode ser no passado.';
      if (valido) inputVencimento.focus();
      valido = false;
    }
  }

  return valido;
}

function abrirModalParaCriacao() {
  document.getElementById('modal-titulo').textContent = 'Nova Tarefa';
  formTarefa.reset();
  inputId.value = '';
  const hoje = obterDataHojeISO();
  inputVencimento.min = hoje;
  document.getElementById('erro-titulo').textContent = '';
  const erroVencimentoEl = document.getElementById('erro-vencimento');
  if (erroVencimentoEl) erroVencimentoEl.textContent = '';
  modalEl.classList.remove('hidden');
  inputTitulo.focus();
}

function abrirModalParaEdicao(tarefa) {
  document.getElementById('modal-titulo').textContent = 'Editar Tarefa';
  inputId.value = tarefa.id;
  inputTitulo.value = tarefa.titulo;
  inputDescricao.value = tarefa.descricao || '';
  selectCategoria.value = tarefa.categoria;
  selectPrioridade.value = tarefa.prioridade;
  inputVencimento.value = tarefa.dataVencimento || '';
  const hoje = obterDataHojeISO();
  inputVencimento.min = hoje;
  document.getElementById('erro-titulo').textContent = '';
  const erroVencimentoEl = document.getElementById('erro-vencimento');
  if (erroVencimentoEl) erroVencimentoEl.textContent = '';
  modalEl.classList.remove('hidden');
  inputTitulo.focus();
}

function fecharModal() {
  modalEl.classList.add('hidden');
  btnNovaTarefa.focus();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
    fecharModal();
  }
});

function exibirToast(mensagem, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function escaparHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function formatarData(dataISO) {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterDataHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

if (tabTarefas) tabTarefas.addEventListener('click', () => alternarAba('tarefas'));
if (tabHistorico) tabHistorico.addEventListener('click', () => alternarAba('historico'));

btnNovaTarefa.addEventListener('click', abrirModalParaCriacao);
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
formTarefa.addEventListener('submit', salvarTarefa);

document.addEventListener('DOMContentLoaded', carregarTarefas);