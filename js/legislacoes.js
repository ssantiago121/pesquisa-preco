// ============================================================================
// MÓDULO DE GERENCIAMENTO DE LEGISLAÇÕES
// ============================================================================
import { CONFIG } from './config.js';

export let legislacoes = JSON.parse(localStorage.getItem(CONFIG.localStorage.legislacoes)) || [];

export function salvarLegislacoes() {
    localStorage.setItem(CONFIG.localStorage.legislacoes, JSON.stringify(legislacoes));
}

export function adicionarLegislacao(dados) {
    const novaLegislacao = {
        id: crypto.randomUUID(),
        nome: dados.nome,
        tipo: dados.tipo,
        descricao: dados.descricao,
        arquivo: dados.arquivo || null,
        dataUpload: new Date().toLocaleDateString("pt-BR")
    };

    legislacoes.push(novaLegislacao);
    salvarLegislacoes();
    return novaLegislacao;
}

export function removerLegislacao(id) {
    legislacoes = legislacoes.filter(l => l.id !== id);
    salvarLegislacoes();
    // CORREÇÃO: Removido o acoplamento visual 'renderLegislacoes()'. 
    // O controle visual da interface agora pertencerá ao controlador central (app.js).
}

export function buscarLegislacao(id) {
    return legislacoes.find(l => l.id === id);
}

export function listarLegislacoes() {
    return legislacoes;
}