function validarPesquisa(){

    if(!processoSelecionado)
        return [];

    const erros = [];

    const fontes =
    processoSelecionado
    .pesquisa
    .fontes;

    if(fontes.length < 3){

        erros.push(
            "Menos de 3 fontes."
        );

    }

    if(
        !processoSelecionado
        .pesquisa
        .catmat
    ){

        erros.push(
            "CATMAT não informado."
        );

    }

    return erros;

}