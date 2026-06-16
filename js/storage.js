function salvarDados() {

    localStorage.setItem(
        "govprice",
        JSON.stringify(fontes)
    );

}

function carregarDados() {

    const dados =
        localStorage.getItem("govprice");

    return dados
        ? JSON.parse(dados)
        : [];

}