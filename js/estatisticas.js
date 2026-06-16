
function calcularEstatisticasProcesso(
    processo
){

    const valores =
    processo.pesquisa.fontes.map(
        f => Number(f.valor)
    );

    if(valores.length === 0){

        processo.pesquisa.estatisticas = {};

        return;
    }

    processo.pesquisa.estatisticas = {

        media:
        media(valores),

        mediana:
        mediana(valores),

        menor:
        Math.min(...valores),

        maior:
        Math.max(...valores),

        desvioPadrao:
        desvioPadrao(valores)

    };

}

function renderEstatisticas(){

    if(!processoSelecionado)
        return;

    const stats =
    processoSelecionado
    .pesquisa
    .estatisticas;

    document.getElementById(
        "media"
    ).innerText =
    formatarMoeda(
        stats.media || 0
    );

}