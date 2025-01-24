function postaviCarousel(glavniElement, sviElementi, nekretnina_id, indeks=0){
    if(glavniElement === null || sviElementi === null || sviElementi.length == 0)
        return null;

    let ucitaniSvi = sviElementi.length < 3;

    let Elementi = [...sviElementi]

    const napraviHTMLUpita = function(upit){
        const divUpit = document.createElement('div');
        divUpit.classList.add('upit');

        const pUsername = document.createElement('p');
        const pStrongUsername = document.createElement('strong');
        pStrongUsername.innerHTML = upit.korisnik_id;

        pUsername.appendChild(pStrongUsername);
        divUpit.appendChild(pUsername);

        const pTekstUpita = document.createElement('p');
        pTekstUpita.innerHTML = upit.tekst_upita;

        divUpit.appendChild(pTekstUpita);
        
        return divUpit;
    }

    glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;


    const fnLijevo = function(){
        //console.log("Pozvan lijevo");
        indeks = indeks - 1;
        if(indeks < 0) indeks = Elementi.length - 1;
        //glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]);
        glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
    }


    const fnDesno = function(){
        // indeks = (indeks + 1) % Elementi.length;
        indeks += 1;
        if(indeks === Elementi.length){
            if(ucitaniSvi){
                indeks = 0;
                glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
            }else{
                PoziviAjax.getNextUpiti(nekretnina_id,parseInt(Elementi.length / 3), (err, upiti) => {
                    if(err){
                        console.log("Greska pri dobavljanju stranice", err);
                        indeks = 0;
                        ucitaniSvi = true;
                        glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
                    }else{
                        ucitaniSvi = upiti.length < 3;

                        if(upiti.length != 0){
                            Elementi = Elementi.concat(upiti);
                            //console.log(Elementi);
                        }else{
                            ucitaniSvi = true;
                            indeks = 0;
                        }
                        glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
                    }
                });
            }
        }else{
            glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
        }
    }

    return {fnLijevo, fnDesno};
}