// ============================================================================
// MÓDULO DE CONFORMIDADE JURÍDICA (REGRAMENTO IN65)
// ============================================================================

/**
 * Valida se a pesquisa de preços atende aos critérios jurídicos mínimos aceitáveis
 * @param {Object} processo - O processo a ser auditado
 * @returns {string[]} Array contendo as mensagens de inconformidade encontradas
 */
export function validarPesquisaConformidade(processo) {
    if (!processo || !processo.pesquisa) return [];

    const erros = [];
    const fontes = processo.pesquisa.fontes || [];

    // Regra IN65: Exigência analítica de no mínimo 3 fontes válidas para cesta de preços
    if (fontes.length < 3) {
        erros.push("Menos de 3 fontes de consulta cadastradas (Mínimo exigido para ampla competitividade).");
    }

    // Regra do Catálogo: Vinculação obrigatória ao item catalogado oficial
    if (!processo.pesquisa.catmat) {
        erros.push("Código identificador CATMAT não informado.");
    }

    return erros;
}