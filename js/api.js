// =====================================
// CONFIGURAÇÃO DAS APIS
// =====================================

export const API_CONFIG = {
    COMPRAS_GOV: "https://dadosabertos.compras.gov.br",
    MATERIAL: "/modulo-pesquisa-preco/1_consultarMaterial"
};

export async function consultarMaterialCatmat(termo, pagina = 1) {
    const termoLimpo = termo?.toString().trim();
    if (!termoLimpo) return null;

    const ehCodigo = /^\d+$/.test(termoLimpo);
    if (!ehCodigo) {
        console.error("A API de Pesquisa de Preços exige um Código CATMAT numérico válido.");
        alert("Por favor, insira um código numérico válido (ex: 331).");
        return null;
    }

    // 1. Declaramos exatamente a targetUrl aqui
    const targetUrl = new URL(`${API_CONFIG.COMPRAS_GOV}${API_CONFIG.MATERIAL}`);
    targetUrl.searchParams.append('pagina', pagina.toString());
    targetUrl.searchParams.append('tamanhoPagina', '10');
    targetUrl.searchParams.append('codigoItemCatalogo', termoLimpo);
    targetUrl.searchParams.append('dataResultado', 'false');

    // 2. Usamos a targetUrl aqui dentro da string do Proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl.toString())}`;

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });

        if (!response.ok) {
            console.error(`Erro na requisição: Status ${response.status}`);
            return null;
        }

        const dados = await response.json();
        console.log("Dados recebidos (via Proxy):", dados);
        
        return dados;
    } catch (error) {
        console.error("Falha de conexão:", error);
        return null;
    }
}