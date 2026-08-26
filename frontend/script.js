const API_URL = 'http://localhost:3000/api/tarefas';

let tarefasState = [];

const listaTarefasEl = document.getElementById('lista-tarefas');
const modalEl = document.getElementById('modal-tarefa');
const formTarefa = document.getElementById('form-tarefa');
const btnNovaTarefa = document.getElementById('btn-nova-tarefa');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const btnTema = document.getElementById('btn-tema');

const inputId = document.getElementById('tarefa-id');
const inputTitulo = document.getElementById('input-titulo');
const inputDescricao = document.getElementById('input-descricao');
const selectCategoria = document.getElementById('select-categoria');
const selectPrioridade = document.getElementById('select-prioridade');
const selectStatus = document.getElementById('select-status');
const inputVencimento = document.getElementById('input-vencimento');


async function carregarTarefas() {
  try {
    const resposta = await fetch(API_URL);
    
    if (!resposta.ok) throw new Error("Erro ao buscar tarefas do servidor.");
    
    const resultado = await resposta.json();
    tarefasState = resultado.dados;
    
    renderizarCards();
  } catch (erro) {
    exibirToast(erro.message, 'error');
  }
}

async function salvarTarefa(event) {
  event.preventDefault();

  if (!validarFormulario()) return;

  const dadosTarefa = {
    titulo: inputTitulo.value.trim(),
    descricao: inputDescricao.value.trim(),
    categoria: selectCategoria.value,
    prioridade: selectPrioridade.value,
    status: selectStatus.value,
    dataVencimento: inputVencimento.value || null
  };

  const id = inputId.value;
  const ehEdicao = Boolean(id);

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

  if (tarefasState.length === 0) {
    listaTarefasEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <p>Nenhuma tarefa cadastrada.</p>
      </div>
    `;
    return;
  }

  tarefasState.forEach(tarefa => {
    const card = document.createElement('article');
    card.className = 'task-card';

    const classePrioridade = `badge-${tarefa.prioridade.toLowerCase().replace('é', 'e')}`;

    card.innerHTML = `
      <div>
        <div class="task-card-header">
          <h3 class="task-title">${escaparHTML(tarefa.titulo)}</h3>
          <span class="badge ${classePrioridade}">${tarefa.prioridade}</span>
        </div>
        <p class="task-desc">${escaparHTML(tarefa.descricao || 'Sem descrição.')}</p>
      </div>

      <div>
        <div class="task-meta">
          <span>📁 ${escaparHTML(tarefa.categoria)}</span>
          <span>📅 ${tarefa.dataVencimento ? formatarData(tarefa.dataVencimento) : 'Sem prazo'}</span>
        </div>
        <div class="task-actions">
          <button class="btn-secondary btn-editar">✏️ Editar</button>
          <button class="btn-danger btn-excluir">🗑️ Excluir</button>
        </div>
      </div>
    `;

    card.querySelector('.btn-editar').addEventListener('click', () => abrirModalParaEdicao(tarefa));
    card.querySelector('.btn-excluir').addEventListener('click', () => excluirTarefa(tarefa.id, tarefa.titulo));

    listaTarefasEl.appendChild(card);
  });
}


function validarFormulario() {
  let valido = true;
  document.getElementById('erro-titulo').textContent = '';
  
  if (!inputTitulo.value.trim() || inputTitulo.value.trim().length < 3) {
    document.getElementById('erro-titulo').textContent = 'Título é obrigatório (mínimo 3 caracteres).';
    inputTitulo.focus();
    valido = false;
  }

  return valido;
}

function abrirModalParaCriacao() {
  document.getElementById('modal-titulo').textContent = 'Nova Tarefa';
  formTarefa.reset();
  inputId.value = '';
  document.getElementById('erro-titulo').textContent = '';
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
  selectStatus.value = tarefa.status;
  inputVencimento.value = tarefa.dataVencimento || '';
  document.getElementById('erro-titulo').textContent = '';
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

btnNovaTarefa.addEventListener('click', abrirModalParaCriacao);
btnFecharModal.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
formTarefa.addEventListener('submit', salvarTarefa);

btnTema.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

document.addEventListener('DOMContentLoaded', carregarTarefas);