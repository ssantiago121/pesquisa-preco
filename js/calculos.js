// ============================================================================
// MÓDULO DE CÁLCULOS ESTATÍSTICOS PUROS
// ============================================================================

export function media(lista) {
    if (!lista || lista.length === 0) return 0;
    return lista.reduce((a, b) => a + b, 0) / lista.length;
}

export function mediana(lista) {
    if (!lista || lista.length === 0) return 0;
    
    // Cria uma cópia para não mutar o array original
    const l = [...lista].sort((a, b) => a - b);
    const meio = Math.floor(l.length / 2);

    return l.length % 2 
        ? l[meio] 
        : (l[meio - 1] + l[meio]) / 2;
}

export function desvioPadrao(lista) {
    if (!lista || lista.length === 0) return 0;

    const m = media(lista);
    const variancia = lista.reduce((s, v) => s + Math.pow(v - m, 2), 0) / lista.length;

    return Math.sqrt(variancia);
}