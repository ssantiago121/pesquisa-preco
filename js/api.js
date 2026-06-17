// =====================================
// CONFIGURAÇÃO DAS APIS
// =====================================

export const API_CONFIG = {
    COMPRAS_GOV: "https://dadosabertos.compras.gov.br",
    MATERIAL: "/modulo-pesquisa-preco/1_consultarMaterial"
};

export async function consultarMaterialCatmat(termo, pagina = 1) {
    const termoLimpo = termo?.toString().trim();
    if (!termoLimpo || !/^\d+$/.test(termoLimpo)) {
        alert("Informe um código numérico válido.");
        return null;
    }

    // URL Direta (Sem proxy)
    const url = new URL("https://dadosabertos.compras.gov.br/modulo-pesquisa-preco/1_consultarMaterial");
    url.searchParams.append('pagina', pagina.toString());
    url.searchParams.append('tamanhoPagina', '10');
    url.searchParams.append('codigoItemCatalogo', termoLimpo);
    url.searchParams.append('dataResultado', 'false');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'accept': '*/*' }
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        const dados = await response.json();
        return dados;
    } catch (error) {
        console.error("Falha ao buscar direto da API:", error);
        return null;
    }
}

// export async function consultarMaterialCatmat(termo, pagina = 1) {
//     const termoLimpo = termo?.toString().trim();
//     if (!termoLimpo) return null;

//     if (!/^\d+$/.test(termoLimpo)) {
//         alert("Por favor, insira um código numérico válido.");
//         return null;
//     }

//     // 1. Monta a URL Oficial do Compras Gov
//     const targetUrl = new URL(`${API_CONFIG.COMPRAS_GOV}${API_CONFIG.MATERIAL}`);
//     targetUrl.searchParams.append('pagina', pagina.toString());
//     targetUrl.searchParams.append('tamanhoPagina', '10');
//     targetUrl.searchParams.append('codigoItemCatalogo', termoLimpo);
//     targetUrl.searchParams.append('dataResultado', 'false');

//     // 2. Proxy Seguro (AllOrigins /get)
//     const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl.toString())}`;

//     try {
//         const response = await fetch(proxyUrl);

//         if (!response.ok) {
//             console.error(`Erro no Proxy: Status ${response.status}`);
//             return null;
//         }

//         // O AllOrigins retorna um JSON com a propriedade "contents" contendo os dados reais
//         const wrapper = await response.json();
        
//         if (wrapper.contents) {
//             // Converte a string do governo de volta para JSON
//             const dados = JSON.parse(wrapper.contents);
//             console.log(`Sucesso! Dados oficiais do código ${termoLimpo}:`, dados);
//             return dados;
//         } else {
//             console.error("A API retornou vazio.");
//             return null;
//         }
//     } catch (error) {
//         console.error("Falha de conexão estrutural:", error);
//         return null;
//     }
// }