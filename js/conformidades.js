function validarPesquisa(){

    const erros=[];

    if(fontes.length < 3){

        erros.push(
            "Menos de 3 fontes"
        );

    }

    return erros;

}