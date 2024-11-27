function postaviCarousel(glavniElement, sviElementi, indeks=0){
    //console.log("Hellloooo");
    if(glavniElement === null || sviElementi === null || sviElementi.length == 0)
        return null;
    let Elementi = [...sviElementi]
    const fnLijevo = function(){
        //console.log("Pozvan lijevo");
        indeks = indeks - 1;
        if(indeks < 0) indeks = Elementi.length - 1;
        glavniElement.innerHTML = Elementi[indeks].outerHTML;
    }
    const fnDesno = function(){
        //console.log("Pozvan desno");
        indeks = (indeks + 1) % Elementi.length;
        glavniElement.innerHTML = Elementi[indeks].outerHTML;
    }
    return {fnLijevo, fnDesno};
}