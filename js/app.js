let fontes =
    carregarDados();

document
.querySelectorAll(".menu-btn")
.forEach(btn=>{

    btn.addEventListener(
        "click",
        ()=>{

            document
            .querySelectorAll(".page")
            .forEach(
                p=>p.classList.add(
                    "hidden"
                )
            );

            document
            .getElementById(
                btn.dataset.target
            )
            .classList.remove(
                "hidden"
            );

        }
    );

});

document
.getElementById(
    "btnAdicionarFonte"
)
.addEventListener(
    "click",
    adicionarFonte
);

function adicionarFonte(){

    const fonte={

        tipo:
        document.getElementById(
            "tipoFonte"
        ).value,

        descricao:
        document.getElementById(
            "descricaoFonte"
        ).value,

        valor:
        document.getElementById(
            "valorFonte"
        ).value,

        url:
        document.getElementById(
            "urlFonte"
        ).value

    };

    fontes.push(fonte);

    salvarDados();

    renderTabela();

    renderEstatisticas();

}

function renderTabela(){

    const tbody=
    document.getElementById(
        "tabelaFontes"
    );

    tbody.innerHTML="";

    fontes.forEach(
        (fonte,index)=>{

        tbody.innerHTML+=`
        <tr>
            <td>${fonte.tipo}</td>
            <td>${fonte.descricao}</td>
            <td>${fonte.valor}</td>
            <td>

                <button
                    onclick="removerFonte(${index})">

                    Excluir

                </button>

            </td>
        </tr>
        `;
    });

}

function removerFonte(i){

    fontes.splice(i,1);

    salvarDados();

    renderTabela();

    renderEstatisticas();

}

function renderEstatisticas(){

    if(fontes.length===0)
        return;

    const valores=
        fontes.map(
            f=>Number(f.valor)
        );

    document.getElementById(
        "cardsEstatisticas"
    ).innerHTML=
    `
    <div class="bg-white p-4">
        Média
        ${media(valores).toFixed(2)}
    </div>

    <div class="bg-white p-4">
        Mediana
        ${mediana(valores).toFixed(2)}
    </div>

    <div class="bg-white p-4">
        Desvio
        ${desvioPadrao(valores).toFixed(2)}
    </div>
    `;

}

document
.getElementById(
    "btnPesquisar"
)
.addEventListener(
    "click",
    async ()=>{

        const codigo=
        document.getElementById(
            "codigoCatmat"
        ).value;

        const resultado=
            await pesquisarCATMAT(
                codigo
            );

        document
        .getElementById(
            "resultadoCatmat"
        )
        .innerHTML=
        JSON.stringify(
            resultado,
            null,
            2
        );

    }
);

document
.getElementById(
    "btnGerarRelatorio"
)
.addEventListener(
    "click",
    ()=>{

        document
        .getElementById(
            "saidaRelatorio"
        )
        .innerHTML=
            gerarRelatorio();

    }
);

renderTabela();
renderEstatisticas();