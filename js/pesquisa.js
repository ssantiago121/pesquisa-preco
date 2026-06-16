let processoSelecionado = null;

function selecionarProcesso(id){

    processoSelecionado =
    buscarProcesso(id);

    renderPesquisa();

}

function definirCatmatProcesso(
    codigo,
    descricao
){

    if(!processoSelecionado)
        return;

    processoSelecionado
        .pesquisa
        .catmat = codigo;

    processoSelecionado
        .pesquisa
        .descricao = descricao;

    salvarProcessos();

}

function adicionarFontePesquisa(
    fonte
){

    if(!processoSelecionado)
        return;

    processoSelecionado
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
        Number(fonte.valor),

        data:
        fonte.data,

        url:
        fonte.url

    });

    salvarProcessos();

    calcularEstatisticas();

}

function removerFontePesquisa(
    fonteId
){

    processoSelecionado
    .pesquisa
    .fontes =

    processoSelecionado
    .pesquisa
    .fontes
    .filter(
        f => f.id !== fonteId
    );

    salvarProcessos();

    calcularEstatisticas();

}