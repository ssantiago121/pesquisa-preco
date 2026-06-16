function media(lista){

    return lista.reduce(
        (a,b)=>a+b,0
    ) / lista.length;

}

function mediana(lista){

    const l=[...lista]
        .sort((a,b)=>a-b);

    const meio =
        Math.floor(l.length/2);

    return l.length % 2
        ? l[meio]
        : (l[meio-1]+l[meio])/2;

}

function desvioPadrao(lista){

    const m=media(lista);

    const variancia=
        lista.reduce(
            (s,v)=>
                s+Math.pow(v-m,2),
            0
        ) / lista.length;

    return Math.sqrt(
        variancia
    );

}