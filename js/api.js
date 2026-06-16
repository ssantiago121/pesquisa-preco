async function pesquisarCATMAT(codigo){

    try{

        const url =
        `https://dadosabertos.compras.gov.br/modulo-pesquisa-preco/1_consultarMaterial?codigoItemCatalogo=${codigo}`;

        const response =
            await fetch(url);

        const dados =
            await response.json();

        return dados;

    }catch(e){

        console.error(e);

        return null;

    }

}