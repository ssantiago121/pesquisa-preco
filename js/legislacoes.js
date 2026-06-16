// ======================================
// LEGISLAÇÕES
// ======================================

let legislacoes =
JSON.parse(
    localStorage.getItem(
        "govprice_legislacoes"
    )
) || [];

// ======================================
// SALVAR
// ======================================

function salvarLegislacoes(){

    localStorage.setItem(
        "govprice_legislacoes",
        JSON.stringify(legislacoes)
    );

}

// ======================================
// ADICIONAR
// ======================================

function adicionarLegislacao(
    legislacao
){

    legislacoes.push({

        id:
        crypto.randomUUID(),

        nome:
        legislacao.nome,

        tipo:
        legislacao.tipo,

        descricao:
        legislacao.descricao,

        arquivo:
        legislacao.arquivo,

        dataUpload:
        new Date()
        .toLocaleDateString(
            "pt-BR"
        )

    });

    salvarLegislacoes();

}

// ======================================
// REMOVER
// ======================================

function removerLegislacao(id){

    legislacoes =
    legislacoes.filter(
        l => l.id !== id
    );

    salvarLegislacoes();

    renderLegislacoes();

}

// ======================================
// BUSCAR
// ======================================

function buscarLegislacao(id){

    return legislacoes.find(
        l => l.id === id
    );

}

// ======================================
// LISTAR
// ======================================

function listarLegislacoes(){

    return legislacoes;

}