// ============================================================================
// MÓDULO DE PROCESSAMENTO DE INDICADORES DE PROCESSO
// ============================================================================
import { media, mediana, desvioPadrao } from './calculos.js';

/**
 * Calcula e atualiza as estatísticas de mercado com base nas fontes do processo
 * @param {Object} processo - Objeto do processo que receberá os cálculos
 * @returns {Object} Objeto com os indicadores calculados
 */
export function calcularEstatisticasProcesso(processo) {
    if (!processo || !processo.pesquisa) return {};

    const valores = (processo.pesquisa.fontes || []).map(f => Number(f.valor || 0));

    if (valores.length === 0) {
        processo.pesquisa.estatisticas = {};
        return {};
    }

    const estatisticas = {
        media: media(valores),
        mediana: mediana(valores),
        menor: Math.min(...valores),
        maior: Math.max(...valores),
        desvioPadrao: desvioPadrao(valores)
    };

    // Atualiza a referência interna do objeto
    processo.pesquisa.estatisticas = estatisticas;
    return estatisticas;
}
