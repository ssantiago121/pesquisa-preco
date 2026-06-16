function gerarRelatorio(){

    const valores =
        fontes.map(
            f=>Number(f.valor)
        );

    return `
    <h3>Pesquisa de Preços</h3>

    <p>
        Média:
        ${media(valores).toFixed(2)}
    </p>

    <p>
        Mediana:
        ${mediana(valores).toFixed(2)}
    </p>

    <p>
        Desvio:
        ${desvioPadrao(valores).toFixed(2)}
    </p>
    `;

}