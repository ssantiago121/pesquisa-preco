// =====================================
// PROCESSOS
// =====================================

let processos =
JSON.parse(
    localStorage.getItem("govprice_processos")
) || [];

// =====================================
// SALVAR
// =====================================

function salvarProcessos() {

    localStorage.setItem(
        "govprice_processos",
        JSON.stringify(processos)
    );

}

// =====================================
// NOVO PROCESSO
// =====================================

function criarProcesso(dados) {

    const processo = {

        id:
        crypto.randomUUID(),

        numero:
        dados.numero,

        objeto:
        dados.objeto,

        secretaria:
        dados.secretaria,

        responsavel:
        dados.responsavel,

        status:
        dados.status,

        valorEstimado:
        Number(
            dados.valorEstimado || 0
        ),

        legislacoes: [],

        pesquisa: {

            catmat: "",

            descricao: "",

            fontes: [],

            estatisticas: {}

        },

        historico: [

            {
                data:
                new Date()
                .toLocaleString("pt-BR"),

                evento:
                "Processo criado"
            }

        ],

        dataCriacao:
        new Date()
        .toLocaleDateString(
            "pt-BR"
        )

    };

    processos.push(processo);

    salvarProcessos();

    return processo;

}

// =====================================
// BUSCAR
// =====================================

function buscarProcesso(id) {

    return processos.find(
        p => p.id === id
    );

}

// =====================================
// ATUALIZAR
// =====================================

function atualizarProcesso(
    id,
    novosDados
) {

    const processo =
    buscarProcesso(id);

    if(!processo)
        return false;

    Object.assign(
        processo,
        novosDados
    );

    processo.historico.push({

        data:
        new Date()
        .toLocaleString("pt-BR"),

        evento:
        "Processo atualizado"

    });

    salvarProcessos();

    return true;

}

// =====================================
// EXCLUIR
// =====================================

function excluirProcesso(id) {

    processos =
    processos.filter(
        p => p.id !== id
    );

    salvarProcessos();

}

// =====================================
// STATUS
// =====================================

function alterarStatus(
    id,
    status
) {

    const processo =
    buscarProcesso(id);

    if(!processo)
        return;

    processo.status =
    status;

    processo.historico.push({

        data:
        new Date()
        .toLocaleString("pt-BR"),

        evento:
        `Status alterado para ${status}`

    });

    salvarProcessos();

}

// =====================================
// LEGISLAÇÕES
// =====================================

function vincularLegislacao(
    processoId,
    legislacaoId
) {

    const processo =
    buscarProcesso(
        processoId
    );

    if(!processo)
        return;

    if(
        !processo.legislacoes.includes(
            legislacaoId
        )
    ) {

        processo.legislacoes.push(
            legislacaoId
        );

        salvarProcessos();

    }

}

// =====================================
// CATMAT
// =====================================

function definirCatmat(
    processoId,
    codigo,
    descricao
) {

    const processo =
    buscarProcesso(
        processoId
    );

    if(!processo)
        return;

    processo.pesquisa.catmat =
    codigo;

    processo.pesquisa.descricao =
    descricao;

    salvarProcessos();

}

// =====================================
// FONTES
// =====================================

function adicionarFonte(
    processoId,
    fonte
) {

    const processo =
    buscarProcesso(
        processoId
    );

    if(!processo)
        return;

    processo
    .pesquisa
    .fontes
    .push({

        id:
        crypto.randomUUID(),

        tipo:
        fonte.tipo,

        descricao:
        fonte.descricao,

        fornecedor:
        fonte.fornecedor,

        valor:
        Number(
            fonte.valor
        ),

        url:
        fonte.url,

        data:
        fonte.data ||

        new Date()
        .toLocaleDateString(
            "pt-BR"
        )

    });

    salvarProcessos();

}

// =====================================
// REMOVER FONTE
// =====================================

function removerFonte(
    processoId,
    fonteId
) {

    const processo =
    buscarProcesso(
        processoId
    );

    if(!processo)
        return;

    processo.pesquisa.fontes =
    processo.pesquisa.fontes.filter(
        f => f.id !== fonteId
    );

    salvarProcessos();

}

// =====================================
// TOTAL PROCESSOS
// =====================================

function totalProcessos() {

    return processos.length;

}

// =====================================
// TOTAL PESQUISA
// =====================================

function totalPesquisa() {

    return processos.filter(
        p =>
        p.status === "Pesquisa"
    ).length;

}

// =====================================
// TOTAL CONCLUÍDOS
// =====================================

function totalConcluidos() {

    return processos.filter(
        p =>
        p.status === "Concluído"
    ).length;

}

// =====================================
// VALOR TOTAL
// =====================================

function valorTotalEstimado() {

    return processos.reduce(

        (acc, processo) =>

        acc +
        processo.valorEstimado,

        0

    );

}

// =====================================
// PROCESSOS POR STATUS
// =====================================

function obterStatusChart() {

    return {

        planejamento:

        processos.filter(
            p =>
            p.status ===
            "Planejamento"
        ).length,

        pesquisa:

        processos.filter(
            p =>
            p.status ===
            "Pesquisa"
        ).length,

        tr:

        processos.filter(
            p =>
            p.status ===
            "TR"
        ).length,

        licitacao:

        processos.filter(
            p =>
            p.status ===
            "Licitação"
        ).length,

        concluido:

        processos.filter(
            p =>
            p.status ===
            "Concluído"
        ).length

    };

}