// ============================================================================
// IMPORTAÇÕES DOS MÓDULOS (ES6)
// ============================================================================
import { consultarMaterialCatmat } from './js/api.js';
import { 
    processos, criarProcesso, excluirProcesso, obterMetricasKPI, 
    obterDadosGraficoStatus, definirCatmat, adicionarFonte, removerFonte, buscarProcesso 
} from './js/processos.js';
import { 
    legislacoes, adicionarLegislacao, removerLegislacao, 
    buscarLegislacao, listarLegislacoes 
} from './js/legislacoes.js';

// ============================================================================
// ESTADO GLOBAL DA INTERFACE
// ============================================================================
let statusChart = null;
let itensAtuaisCatmat = []; // Guarda os últimos 10 itens recebidos da API do governo

// BOA PRÁTICA: Recupera o processo selecionado do sessionStorage para não perder no F5
let RobsonProcessoId = sessionStorage.getItem("govprice_processo_ativo") || null;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    configurarNavegacaoSPA();
    renderTabelaProcessos();
    renderLegislacoes();
    atualizarDashboard();
    verificarLegislacoesPadrao();
    mostrarProcessoAtivoNaPesquisa();
    renderTabelaFontes(); // Renderiza as fontes do processo ativo, se houver
});

// ============================================================================
// NAVEGAÇÃO SPA (Single Page Application)
// ============================================================================
function configurarNavegacaoSPA() {
    const menuButtons = document.querySelectorAll(".menu-btn");
    const pages = document.querySelectorAll(".page");

    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const pageId = btn.dataset.page;

            pages.forEach(p => p.classList.add("hidden"));
            menuButtons.forEach(b => b.classList.remove("active"));

            document.getElementById(pageId).classList.remove("hidden");
            btn.classList.add("active");

            document.getElementById("pageTitle").innerText = btn.innerText.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}/gu, '').trim();
            
            // Sempre que entrar na aba de pesquisa, atualiza as informações do processo logado
            if (pageId === "pesquisa") {
                mostrarProcessoAtivoNaPesquisa();
                renderTabelaFontes();
            }
        });
    });
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ============================================================================
// DASHBOARD E GRÁFICOS
// ============================================================================
function atualizarDashboard() {
    const metricas = obterMetricasKPI();

    document.getElementById("totalProcessos").innerText = metricas.total;
    document.getElementById("totalPesquisa").innerText = metricas.totalPesquisa;
    document.getElementById("totalConcluidos").innerText = metricas.totalConcluidos;
    document.getElementById("valorEstimado").innerText = formatarMoeda(metricas.valorTotalEstimado);

    document.getElementById("dashTotal").innerText = metricas.total;
    document.getElementById("dashAndamento").innerText = metricas.totalPesquisa;
    document.getElementById("dashConcluidos").innerText = metricas.totalConcluidos;

    atualizarGrafico();
}

function atualizarGrafico() {
    const ctx = document.getElementById("statusChart");
    const contagem = obterDadosGraficoStatus();

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Planejamento", "Pesquisa", "TR", "Licitação", "Concluído"],
            datasets: [{
                data: [
                    contagem.planejamento || 0,
                    contagem.pesquisa || 0,
                    contagem.tr || 0,
                    contagem.licitacao || 0,
                    contagem.concluido || 0
                ],
                backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#166534']
            }]
        }
    });
}

// ============================================================================
// UI: GERENCIAMENTO DE PROCESSOS
// ============================================================================
const modalProcesso = document.getElementById("modalProcesso");

document.getElementById("btnNovoProcesso").addEventListener("click", () => modalProcesso.classList.remove("hidden"));
document.getElementById("fecharModal").addEventListener("click", () => modalProcesso.classList.add("hidden"));

document.querySelector("#modalProcesso .btn-primary").addEventListener("click", () => {
    const inputs = modalProcesso.querySelectorAll("input, select");
    
    criarProcesso({
        numero: inputs[0].value,
        objeto: inputs[1].value,
        secretaria: inputs[2].value,
        responsavel: inputs[3].value,
        status: inputs[4].value,
        valorEstimado: inputs[5].value
    });

    inputs.forEach(input => input.value = "");
    modalProcesso.classList.add("hidden");
    
    renderTabelaProcessos();
    atualizarDashboard();
});

function renderTabelaProcessos() {
    const tabela = document.getElementById("processosTable");
    tabela.innerHTML = "";

    processos.forEach(processo => {
        const badgeClass = processo.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const estaAtivo = processo.id === RobsonProcessoId;

        tabela.innerHTML += `
        <tr class="${estaAtivo ? 'bg-indigo-50/50 font-medium' : ''} hover:bg-slate-50 transition">
            <td class="p-4">${processo.numero} ${estaAtivo ? '📌' : ''}</td>
            <td class="p-4">${processo.objeto}</td>
            <td class="p-4"><span class="badge badge-${badgeClass}">${processo.status}</span></td>
            <td class="p-4">${formatarMoeda(processo.valorEstimado)}</td>
            <td class="p-4 space-x-2 text-sm">
                <button onclick="selecionarProcessoUI('${processo.id}')" class="${estaAtivo ? 'text-indigo-800 font-bold' : 'text-indigo-600'} hover:underline">${estaAtivo ? 'Selecionado' : 'Selecionar'}</button>
                <button onclick="excluirProcessoUI('${processo.id}')" class="text-red-600 hover:underline">Excluir</button>
            </td>
        </tr>
        `;
    });
}

// ============================================================================
// UI: INTEGRAÇÃO CATMAT E FONTES DE PESQUISA
// ============================================================================

document.getElementById("codigoCatmat").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Impede comportamentos padrões do navegador (como recarregar a página)
        document.getElementById("btnPesquisarCatmat").click(); // Simula o clique no botão de busca
    }
});

// Mantém o evento de clique do botão normal
document.getElementById("btnPesquisarCatmat").addEventListener("click", async () => {
    const inputCodigo = document.getElementById("codigoCatmat");
    const termo = inputCodigo.value.trim();

    if (!termo) {
        alert("Informe um termo para pesquisa.");
        return;
    }

    const btn = document.getElementById("btnPesquisarCatmat");
    btn.innerText = "Buscando...";
    btn.disabled = true;

    const dados = await consultarMaterialCatmat(termo);
    renderResultadoCatmat(dados);

    btn.innerText = "Pesquisar";
    btn.disabled = false;
});

document.getElementById("btnPesquisarCatmat").addEventListener("click", async () => {
    const inputCodigo = document.getElementById("codigoCatmat");
    const termo = inputCodigo.value.trim();

    if (!termo) {
        alert("Informe um termo para pesquisa.");
        return;
    }

    const btn = document.getElementById("btnPesquisarCatmat");
    btn.innerText = "Buscando...";
    btn.disabled = true;

    const dados = await consultarMaterialCatmat(termo);
    renderResultadoCatmat(dados);

    btn.innerText = "Pesquisar";
    btn.disabled = false;
});

function renderResultadoCatmat(dados) {
    const container = document.getElementById("resultadoCatmat");
    itensAtuaisCatmat = dados?.resultado || []; // Alimenta nosso array de controle por índice

    if (itensAtuaisCatmat.length === 0) {
        container.innerHTML = `<div class="p-4 bg-amber-50 text-amber-700 rounded border border-amber-200">Nenhum registro de preço encontrado para este código no Compras Gov.</div>`;
        return;
    }

    let html = `<div class="grid gap-3">`;
    itensAtuaisCatmat.forEach((item, index) => {
        const descricao = item.descricaoItem || item.descricaoMaterial || 'Item sem descrição';
        const codigo = item.codigoItemCatalogo || item.codigoItem || '---';
        const preco = item.precoUnitario || item.valorUnitario || 0;
        const orgao = item.nomeOrgao || 'Órgão Público';

        html += `
        <div class="bg-white p-4 border rounded-xl flex justify-between items-center shadow-sm">
            <div>
                <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">CATMAT ${codigo}</span>
                <h4 class="font-bold text-slate-800 text-sm mt-1">${descricao}</h4>
                <p class="text-xs text-slate-500">🏢 ${orgao}</p>
            </div>
            <div class="text-right flex items-center gap-4">
                <div>
                    <p class="text-xs text-slate-400">Preço Unitário</p>
                    <p class="text-lg font-black text-slate-900">${formatarMoeda(preco)}</p>
                </div>
                <button onclick="vincularCatmatUI(${index})" class="btn-primary text-xs px-3 py-1.5">
                    Vincular Fonte
                </button>
            </div>
        </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function mostrarProcessoAtivoNaPesquisa() {
    const container = document.getElementById("resultadoCatmat");
    if (!RobsonProcessoId) {
        container.innerHTML = `
            <div class="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium mb-4">
                ⚠️ Alerta: Nenhum processo selecionado. Vá na aba <strong>📁 Processos</strong> e selecione um processo antes de realizar e vincular pesquisas.
            </div>`;
    } else {
        const proc = buscarProcesso(RobsonProcessoId);
        container.innerHTML = `
            <div class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex justify-between items-center mb-4">
                <span>📌 <strong>Processo Vinculado:</strong> Nº ${proc?.numero} - ${proc?.objeto}</span>
                <span class="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">${proc?.status}</span>
            </div>`;
    }
}

function renderTabelaFontes() {
    const tbody = document.getElementById("fontesTable");
    tbody.innerHTML = "";

    if (!RobsonProcessoId) return;

    const proc = buscarProcesso(RobsonProcessoId);
    const fontes = proc?.pesquisa?.fontes || [];

    fontes.forEach(fonte => {
        tbody.innerHTML += `
        <tr class="text-sm hover:bg-slate-50">
            <td class="p-3"><span class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold">${fonte.tipo}</span></td>
            <td class="p-3 font-medium text-slate-800">${fonte.descricao}</td>
            <td class="p-3 text-slate-500">${fonte.fornecedor}</td>
            <td class="p-3 font-bold text-slate-900">${formatarMoeda(fonte.valor)}</td>
        </tr>
        `;
    });
}

// ============================================================================
// UI: GERENCIAMENTO DE LEGISLAÇÕES
// ============================================================================
const modalLeg = document.getElementById("modalLegislacao");

document.getElementById("btnNovaLegislacao").addEventListener("click", () => modalLeg.classList.remove("hidden"));
document.getElementById("fecharLegislacao").addEventListener("click", () => modalLeg.classList.add("hidden"));

document.getElementById("salvarLegislacao").addEventListener("click", () => {
    const arquivoInput = document.getElementById("legArquivo").files[0];
    if (!arquivoInput) return alert("Selecione um arquivo PDF.");

    const reader = new FileReader();
    reader.onload = function(event) {
        adicionarLegislacao({
            nome: document.getElementById("legNome").value,
            tipo: document.getElementById("legTipo").value,
            descricao: document.getElementById("legDescricao").value,
            arquivo: event.target.result
        });
        renderLegislacoes();
        modalLeg.classList.add("hidden");
    };
    reader.readAsDataURL(arquivoInput);
});

function renderLegislacoes() {
    const tbody = document.getElementById("legislacoesTable");
    tbody.innerHTML = "";

    listarLegislacoes().forEach(leg => {
        tbody.innerHTML += `
        <tr class="hover:bg-slate-50 transition text-sm">
            <td class="p-4 font-medium">${leg.nome}</td>
            <td class="p-4"><span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">${leg.tipo}</span></td>
            <td class="p-4 text-slate-500">${leg.dataUpload}</td>
            <td class="p-4 space-x-3">
                ${leg.arquivo ? `<button onclick="downloadLegislacaoUI('${leg.id}')" class="text-blue-600 hover:underline">Download</button>` : `<span class="text-slate-400">Padrão</span>`}
                <button onclick="removerLegislacaoUI('${leg.id}')" class="text-red-600 hover:underline">Excluir</button>
            </td>
        </tr>
        `;
    });
}

function verificarLegislacoesPadrao() {
    if (listarLegislacoes().length === 0) {
        adicionarLegislacao({ nome: "Lei Federal nº 14.133/2021", tipo: "Lei Federal", descricao: "Nova Lei de Licitações e Contratos", arquivo: null });
        adicionarLegislacao({ nome: "Decreto Estadual nº 43.333/2023", tipo: "Decreto Estadual", descricao: "Regulamenta a Lei 14.133 no âmbito da Paraíba", arquivo: null });
        renderLegislacoes();
    }
}

// ============================================================================
// FUNÇÕES EXPOSTAS AO WINDOW (Para escopo global dos onclicks do HTML)
// ============================================================================
window.excluirProcessoUI = function(id) {
    if (confirm("Deseja excluir este processo?")) {
        excluirProcesso(id);
        if (RobsonProcessoId === id) {
            RobsonProcessoId = null;
            sessionStorage.removeItem("govprice_processo_ativo");
        }
        renderTabelaProcessos();
        atualizarDashboard();
    }
};

window.selecionarProcessoUI = function(id) {
    RobsonProcessoId = id;
    sessionStorage.setItem("govprice_processo_ativo", id); // Persiste o ID com segurança
    alert("Processo selecionado com sucesso! Redirecionando para a Pesquisa...");
    renderTabelaProcessos();
    document.querySelector('[data-page="pesquisa"]').click(); // Força a troca automática de aba
};

window.vincularCatmatUI = function(index) {
    if (!processoAtivoId) { // Certifique-se de usar o nome da sua variável de controle de ID ativo aqui
        alert("Por favor, selecione um Processo na aba 'Processos' primeiro.");
        return;
    }

    const itemSelecionado = itensAtuaisCatmat[index];
    if (!itemSelecionado) return;

    const codigo = itemSelecionado.codigoItemCatalogo || itemSelecionado.codigoItem;
    const descricao = itemSelecionado.descricaoItem || itemSelecionado.descricaoMaterial || 'Item';
    const preco = itemSelecionado.precoUnitario || itemSelecionado.valorUnitario || 0;
    const fornecedor = itemSelecionado.nomeFornecedor || itemSelecionado.razaoSocialFornecedor || 'Fornecedor Gov';

    // 1. Define o CATMAT principal do Processo
    definirCatmat(processoAtivoId, codigo, descricao);

    // 2. Alimenta a lista de Fontes do Processo automaticamente
    const resultadoVinculo = adicionarFonte(processoAtivoId, {
        tipo: "Compras Gov",
        descricao: descricao,
        fornecedor: fornecedor,
        valor: preco,
        url: ""
    });

    if (!resultadoVinculo.sucesso) {
        alert(resultadoVinculo.mensagem);
        return;
    }

    alert(`Sucesso! Item adicionado às Fontes da Pesquisa do seu processo.`);

    // NOVO: Limpa o campo de texto da pesquisa após o sucesso
    document.getElementById("codigoCatmat").value = "";

    // NOVO: Restaura o banner original do processo, "fechando" e limpando os resultados da tela
    mostrarProcessoAtivoNaPesquisa();
    renderTabelaFontes(); // Recarrega a tabela inferior de fontes instantaneamente
};

window.removerLegislacaoUI = function(id) {
    if (confirm("Excluir esta legislação?")) {
        removerLegislacao(id);
        renderLegislacoes();
    }
};

window.downloadLegislacaoUI = function(id) {
    const leg = buscarLegislacao(id);
    if (!leg || !leg.arquivo) return;
    const a = document.createElement("a");
    a.href = leg.arquivo;
    a.download = `${leg.nome.replace(/\s+/g, '_')}.pdf`;
    a.click();
};