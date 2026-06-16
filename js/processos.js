// ============================================================================
// MÓDULO DE GERENCIAMENTO DE PROCESSOS (ESTEIRA REGULAMENTAR DA IN65 E 14.133)
// ============================================================================
import { CONFIG } from './config.js';
import { calcularEstatisticasProcesso } from './estatisticas.js';
import { validarPesquisaConformidade } from './conformidade.js';

// Inicializa a lista de processos a partir do localStorage usando a configuração unificada
export let processos = JSON.parse(localStorage.getItem(CONFIG.localStorage.processos)) || [];

// Helper para evitar duplicação de formatação de data/hora nos históricos
const obterDataHoraAtual = () => new Date().toLocaleString("pt-BR");

export function salvarProcessos() {
    localStorage.setItem(CONFIG.localStorage.processos, JSON.stringify(processos));
}

export function criarProcesso(dados) {
    const processo = {
        id: crypto.randomUUID(),
        numero: dados.numero, // Número gerado pelo sistema do Estado (Paraíba)
        objeto: dados.objeto, // Finalidade do processo
        secretaria: dados.secretaria,
        responsavel: dados.responsavel,
        status: dados.status || "Planejamento",
        valorEstimado: Number(dados.valorEstimado || 0),
        
        // Controle de maturidade dos artefatos obrigatórios construídos na esteira
        artefatos: {
            etp: { preenchido: false, dataVinculo: null },
            justificativa: { preenchido: false, dataVinculo: null },
            tr: { preenchido: false, dataVinculo: null },
            mapaPreco: { preenchido: false, dataVinculo: null }
        },

        legislacoes: [],
        pesquisa: {
            catmat: "",
            descricao: "",
            fontes: [], // Cesta de preços oficiais capturados
            estatisticas: {} // Armazenamento dos indicadores estatísticos
        },
        historico: [
            { 
                data: obterDataHoraAtual(), 
                evento: "Processo autuado e registrado no sistema." 
            }
        ],
        dataCriacao: new Date().toLocaleDateString("pt-BR")
    };

    processos.push(processo);
    salvarProcessos();
    return processo;
}

export function buscarProcesso(id) {
    return processos.find(p => p.id === id);
}

export function atualizarProcesso(id, novosDados) {
    const processo = buscarProcesso(id);
    if (!processo) return false;

    Object.assign(processo, novosDados);
    processo.historico.push({
        data: obterDataHoraAtual(),
        evento: "Processo atualizado"
    });

    salvarProcessos();
    return true;
}

export function excluirProcesso(id) {
    processos = processos.filter(p => p.id !== id);
    salvarProcessos();
}

export function alterarStatus(id, status) {
    const processo = buscarProcesso(id);
    if (!processo) return;

    processo.status = status;
    processo.historico.push({
        data: obterDataHoraAtual(),
        evento: `Status alterado para ${status}`
    });

    salvarProcessos();
}

export function vincularLegislacao(processoId, legislacaoId) {
    const processo = buscarProcesso(processoId);
    if (!processo) return;

    if (!processo.legislacoes.includes(legislacaoId)) {
        processo.legislacoes.push(legislacaoId);
        salvarProcessos();
    }
}

export function definirCatmat(processoId, codigo, descricao) {
    const processo = buscarProcesso(processoId);
    if (!processo) return;

    processo.pesquisa.catmat = codigo;
    processo.pesquisa.descricao = descricao;
    salvarProcessos();
}

export function adicionarFonte(processoId, fonte) {
    const processo = buscarProcesso(processoId);
    if (!processo) return { sucesso: false, mensagem: "Processo não encontrado." };

    // REGRA DE NEGÓCIO: Impede que o mesmo fornecedor entre duplicado na cesta de preços do processo
    const fornecedorJaExiste = processo.pesquisa.fontes.some(
        f => f.fornecedor.toLowerCase().trim() === fonte.fornecedor.toLowerCase().trim()
    );

    if (fornecedorJaExiste) {
        return { sucesso: false, mensagem: "Este fornecedor já está cadastrado nesta cesta de preços." };
    }

    processo.pesquisa.fontes.push({
        id: crypto.randomUUID(),
        tipo: fonte.tipo,
        descricao: fonte.descricao,
        fornecedor: fonte.fornecedor,
        valor: Number(fonte.valor || 0),
        url: fonte.url || "",
        data: fonte.data || new Date().toLocaleDateString("pt-BR")
    });

    // Atualização automática do status do artefato de Mapa comparativo de Preços
    if (processo.pesquisa.fontes.length >= 1) {
        processo.artefatos.mapaPreco.preenchido = true;
        processo.artefatos.mapaPreco.dataVinculo = new Date().toLocaleDateString("pt-BR");
    }

    salvarProcessos();
    return { sucesso: true, mensagem: "Fonte vinculada com sucesso." };
}

export function removerFonte(processoId, fonteId) {
    const processo = buscarProcesso(processoId);
    if (!processo) return;

    processo.pesquisa.fontes = processo.pesquisa.fontes.filter(f => f.id !== fonteId);
    
    // Se esvaziar as fontes, desmarca o artefato de mapa de preços
    if (processo.pesquisa.fontes.length === 0) {
        processo.artefatos.mapaPreco.preenchido = false;
        processo.artefatos.mapaPreco.dataVinculo = null;
    }

    salvarProcessos();
}

// Otimização O(n) para obter todas as métricas dos painéis da dashboard de uma só vez
export function obterMetricasKPI() {
    return processos.reduce((acc, p) => {
        acc.total++;
        acc.valorTotalEstimado += p.valorEstimado;
        if (p.status === "Pesquisa") acc.totalPesquisa++;
        if (p.status === "Concluído") acc.totalConcluidos++;
        return acc;
    }, { total: 0, totalPesquisa: 0, totalConcluidos: 0, valorTotalEstimado: 0 });
}

// Mapeamento dinâmico de contagem para alimentação dos gráficos do ChartJS
export function obterDadosGraficoStatus() {
    const contagem = { planejamento: 0, pesquisa: 0, tr: 0, licitacao: 0, concluido: 0 };
    
    processos.forEach(p => {
        const statusChave = p.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (statusChave in contagem) {
            contagem[statusChave]++;
        }
    });
    
    return contagem;
}

/**
 * Compila absolutamente todos os dados estruturados de um processo para alimentar os relatórios
 * @param {string} id - ID do processo cadastrado
 * @returns {Object|null} Payload consolidado pronto para preencher templates visuais ou impressão
 */
export function gerarPayloadRelatorio(id) {
    const processo = buscarProcesso(id);
    if (!processo) return null;

    // Atualiza forçadamente os cálculos e médias estatísticas do mercado com base nas fontes correntes
    const estatisticas = calcularEstatisticasProcesso(processo);
    
    // Roda os validadores analíticos da Instrução Normativa Federal (IN65)
    const inconformidades = validarPesquisaConformidade(processo);

    return {
        numeroProcesso: processo.numero,
        objetoContratacao: processo.objeto,
        setorRequisitante: processo.secretaria,
        responsavelTrabalho: processo.responsavel,
        dataGeracao: new Date().toLocaleString("pt-BR"),
        statusAtual: processo.status,
        artefatosVerificados: processo.artefatos,
        itemCatalogo: {
            codigo: processo.pesquisa.catmat || "Não Informado",
            descricao: processo.pesquisa.descricao || "Não Vinculado"
        },
        fontesApuradas: processo.pesquisa.fontes,
        indicadores: {
            media: estatisticas.media || 0,
            mediana: estatisticas.mediana || 0,
            menorPreco: estatisticas.menor || 0,
            maiorPreco: estatisticas.maior || 0,
            desvioPadrao: estatisticas.desvioPadrao || 0
        },
        auditoria: {
            regular: inconformidades.length === 0,
            alertas: inconformidades
        }
    };
}