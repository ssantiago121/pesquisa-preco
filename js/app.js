document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarMenu();

        carregarDashboard();

        renderTabelaProcessos();

        renderLegislacoes();

    }
);


let chart = null;

// =================================
// NAVEGAÇÃO SPA
// =================================

const menuButtons =
document.querySelectorAll(".menu-btn");

const pages =
document.querySelectorAll(".page");

menuButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        const page =
        btn.dataset.page;

        pages.forEach(p=>
            p.classList.add("hidden")
        );

        document
            .getElementById(page)
            .classList.remove("hidden");

        menuButtons.forEach(b=>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        document
            .getElementById("pageTitle")
            .innerText =
            btn.innerText;

    });

});

// =================================
// MODAL
// =================================

const modal =
document.getElementById(
    "modalProcesso"
);

document
.getElementById(
    "btnNovoProcesso"
)
.addEventListener(
    "click",
    ()=>{

        modal.classList.remove(
            "hidden"
        );

        modal.classList.add(
            "modal-open"
        );

    }
);

document
.getElementById(
    "fecharModal"
)
.addEventListener(
    "click",
    ()=>{

        modal.classList.add(
            "hidden"
        );

        modal.classList.remove(
            "modal-open"
        );

    }
);

// =================================
// CAMPOS MODAL
// =================================

const inputs =
modal.querySelectorAll("input, select");

function salvarProcesso(){

    criarProcesso({

        numero: inputs[0].value,
        objeto: inputs[1].value,
        secretaria: inputs[2].value,
        responsavel: inputs[3].value,
        status: inputs[4].value,
        valorEstimado: inputs[5].value

    });

    renderTabelaProcessos();

    atualizarDashboard();

    limparFormulario();

    fecharModal();

}

function limparFormulario(){

    inputs.forEach(
        input=>input.value=""
    );

}

function fecharModal(){

    modal.classList.add("hidden");

    modal.classList.remove(
        "modal-open"
    );

}

// =================================
// BOTÃO SALVAR
// =================================

document
.querySelector(
    "#modalProcesso .btn-primary"
)
.addEventListener(
    "click",
    salvarProcesso
);

// =================================
// LOCAL STORAGE
// =================================

function persistir(){

    localStorage.setItem(
        "govprice_processos",
        JSON.stringify(processos)
    );

}

// =================================
// TABELA PROCESSOS
// =================================

function renderTabela(){

    const tabela =
    document.getElementById(
        "processosTable"
    );

    tabela.innerHTML="";

    processos.forEach(processo=>{

        tabela.innerHTML += `
        <tr>

            <td>
                ${processo.numero}
            </td>

            <td>
                ${processo.objeto}
            </td>

            <td>
                <span class="
                badge
                badge-${processo.status.toLowerCase()}
                ">
                ${processo.status}
                </span>
            </td>

            <td>
                ${formatarMoeda(
                    processo.valorEstimado
                )}
            </td>

            <td>

                <button
                onclick="excluirProcesso('${processo.id}')"
                class="text-red-600">

                Excluir

                </button>

            </td>

        </tr>
        `;

    });

}

// =================================
// EXCLUIR
// =================================

function excluirProcesso(id){

    if(
        !confirm(
            "Deseja excluir?"
        )
    ) return;

    processos =
    processos.filter(
        p=>p.id !== id
    );

    persistir();

    renderTabela();

    atualizarDashboard();

}

// =================================
// DASHBOARD
// =================================

function atualizarDashboard(){

    const total =
    processos.length;

    const pesquisa =
    processos.filter(
        p=>p.status==="Pesquisa"
    ).length;

    const concluidos =
    processos.filter(
        p=>p.status==="Concluído"
    ).length;

    const valor =
    processos.reduce(
        (acc,p)=>
            acc +
            p.valorEstimado,
        0
    );

    document
        .getElementById(
            "totalProcessos"
        )
        .innerText = total;

    document
        .getElementById(
            "totalPesquisa"
        )
        .innerText = pesquisa;

    document
        .getElementById(
            "totalConcluidos"
        )
        .innerText = concluidos;

    document
        .getElementById(
            "valorEstimado"
        )
        .innerText =
        formatarMoeda(valor);

    document
        .getElementById(
            "dashTotal"
        )
        .innerText = total;

    document
        .getElementById(
            "dashAndamento"
        )
        .innerText = pesquisa;

    document
        .getElementById(
            "dashConcluidos"
        )
        .innerText = concluidos;

    atualizarGrafico();

}

// =================================
// CHART
// =================================

function atualizarGrafico(){

    const ctx =
    document
        .getElementById(
            "statusChart"
        );

    const planejamento =
    processos.filter(
        p=>p.status==="Planejamento"
    ).length;

    const pesquisa =
    processos.filter(
        p=>p.status==="Pesquisa"
    ).length;

    const tr =
    processos.filter(
        p=>p.status==="TR"
    ).length;

    const licitacao =
    processos.filter(
        p=>p.status==="Licitação"
    ).length;

    if(chart){
        chart.destroy();
    }

    chart =
    new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:[
                "Planejamento",
                "Pesquisa",
                "TR",
                "Licitação"
            ],

            datasets:[{

                data:[
                    planejamento,
                    pesquisa,
                    tr,
                    licitacao
                ]

            }]

        }

    });

}

// =================================
// FORMATADORES
// =================================

function formatarMoeda(valor){

    return valor.toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );

}

// ======================================
// LEGISLAÇÕES
// ======================================

const modalLeg =
document.getElementById(
    "modalLegislacao"
);

document
.getElementById(
    "btnNovaLegislacao"
)
.addEventListener(
    "click",
    ()=>{
        modalLeg.classList.remove(
            "hidden"
        );
    }
);

document
.getElementById(
    "fecharLegislacao"
)
.addEventListener(
    "click",
    ()=>{
        modalLeg.classList.add(
            "hidden"
        );
    }
);

// Salvar
document
.getElementById(
    "salvarLegislacao"
)
.addEventListener(
"click",

()=>{

const arquivo =
document.getElementById(
    "legArquivo"
).files[0];

if(!arquivo)
return;

const reader =
new FileReader();

reader.onload =
function(event){

    adicionarLegislacao({

        nome:
        document.getElementById(
            "legNome"
        ).value,

        tipo:
        document.getElementById(
            "legTipo"
        ).value,

        descricao:
        document.getElementById(
            "legDescricao"
        ).value,

        arquivo:
        event.target.result

    });

    renderLegislacoes();

    modalLeg.classList.add(
        "hidden"
    );

};

reader.readAsDataURL(
    arquivo
);

});

// Renderizar
function renderLegislacoes(){

const tbody =
document.getElementById(
    "legislacoesTable"
);

tbody.innerHTML = "";

legislacoes.forEach(leg=>{

tbody.innerHTML += `

<tr>

<td>
${leg.nome}
</td>

<td>
${leg.tipo}
</td>

<td>
${leg.dataUpload}
</td>

<td>

<button
onclick="downloadLegislacao('${leg.id}')"
class="text-blue-600">

Download

</button>

<button
onclick="removerLegislacao('${leg.id}')"
class="text-red-600 ml-4">

Excluir

</button>

</td>

</tr>

`;

});

}

// Download
function downloadLegislacao(id){

const leg =
buscarLegislacao(id);

const a =
document.createElement("a");

a.href =
leg.arquivo;

a.download =
`${leg.nome}.pdf`;

a.click();

}

// Padrão primeiro carregamento
if(legislacoes.length === 0){

adicionarLegislacao({

nome:
"Lei 14.133/2021",

tipo:
"Lei",

descricao:
"Nova Lei de Licitações",

arquivo:null

});

adicionarLegislacao({

nome:
"IN 65/2021",

tipo:
"Instrução Normativa",

descricao:
"Pesquisa de Preços",

arquivo:null

});

}

// Integração
document
.getElementById(
    "btnPesquisarCatmat"
)
.addEventListener(
    "click",
    pesquisarCatmat
);

async function pesquisarCatmat(){

    const termo =
    document
    .getElementById(
        "codigoCatmat"
    )
    .value
    .trim();

    if(!termo){

        alert(
            "Informe um termo para pesquisa."
        );

        return;

    }

    const resultado =
    await consultarMaterial(
        termo
    );

    renderResultadoCatmat(
        resultado
    );

}

function renderResultadoCatmat(
    dados
){

    const container =
    document.getElementById(
        "resultadoCatmat"
    );

    if(!dados){

        container.innerHTML = `
            <div class="text-red-500">
                Nenhum resultado encontrado.
            </div>
        `;

        return;

    }

    let html = "";

    dados.forEach(item => {

        html += `

        <div class="card mb-3">

            <h4 class="font-bold">

                ${item.descricao}

            </h4>

            <p>

                Código:
                ${item.codigoMaterial}

            </p>

            <button
                onclick="
                selecionarCatmat(
                    '${item.codigoMaterial}',
                    '${item.descricao}'
                )"
                class="btn-primary mt-2">

                Selecionar

            </button>

        </div>

        `;

    });

    container.innerHTML =
    html;

}

function selecionarCatmat(
    codigo,
    descricao
){

    if(!processoSelecionado){

        alert(
            "Selecione um processo."
        );

        return;

    }

    definirCatmatProcesso(
        codigo,
        descricao
    );

    alert(
        "CATMAT vinculado ao processo."
    );

}

// =================================
// CATMAT (TEMPORÁRIO)
// =================================

// document
// .getElementById(
//     "btnPesquisarCatmat"
// )
// .addEventListener(
//     "click",
//     ()=>{

//         const codigo =
//         document
//         .getElementById(
//             "codigoCatmat"
//         )
//         .value;

//         document
//         .getElementById(
//             "resultadoCatmat"
//         )
//         .innerHTML = `
//         <div class="bg-slate-50 p-4 rounded">

//             <strong>CATMAT:</strong>
//             ${codigo}

//             <br><br>

//             Integração real será feita
//             no módulo catmatService.js

//         </div>
//         `;

//     }
// );


// =================================
// START
// =================================

renderTabela();
atualizarDashboard();