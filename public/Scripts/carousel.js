function postaviCarousel(glavniElement, sviElementi, nekretnina_id, indeks=0){
    if(glavniElement === null || sviElementi === null || sviElementi.length == 0)
        return null;

    let ucitaniSvi = sviElementi.length < 3;

    let Elementi = [...sviElementi]

    let idUsername;

    PoziviAjax.getIdUsernames((err, mapa) => {
        if(err){
            console.log("Greska pri dobavljanju username-a", err);
        }else{
            idUsername = mapa;
        }
        glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
    });

    console.log("elementi",sviElementi);

    const napraviHTMLUpita = function(upit){
        const divUpit = document.createElement('div');
        divUpit.classList.add('upit');

        const pId = document.createElement('p');
        pId.innerHTML = `<strong>ID Upita:</strong> ${upit.id}`;
        divUpit.appendChild(pId);

        const pUsername = document.createElement('p');
        if(idUsername && idUsername[upit.korisnikId]){
            pUsername.innerHTML = "<strong>Username korisnika: </strong>" + idUsername[upit.korisnikId];
        }else{
            pUsername.innerHTML = "<strong>Username korisnika: </strong>" + upit.korisnikId;
        }
        divUpit.appendChild(pUsername);

        const pTekstUpita = document.createElement('p');
        pTekstUpita.innerHTML = upit.tekst;

        divUpit.appendChild(pTekstUpita);
        
        return divUpit;
    }

    const napraviHTMLZahtjeva = function(upit){
        const divUpit = document.createElement('div');
        divUpit.classList.add('upit');

        const pId = document.createElement('p');
        pId.innerHTML = `<strong>ID Zahtjeva:</strong> ${upit.id}`;
        divUpit.appendChild(pId);
        
        const pUsername = document.createElement('p');
        if(idUsername && idUsername[upit.korisnikId]){
            pUsername.innerHTML = "<strong>Username korisnika: </strong>" + idUsername[upit.korisnikId];
        }else{
            pUsername.innerHTML = "<strong>Username korisnika: </strong>" + upit.korisnikId;
        }
        divUpit.appendChild(pUsername);

        let pOdobren = document.createElement('p');
        let odobren = "Na čekanju";
        if(upit.odobren === true)
            odobren = "Odobren";
        else if (upit.odobren === false)
            odobren = "Odbijen";
        pOdobren.innerHTML = "<strong>Status odobrenja:</strong> " + odobren;
        divUpit.appendChild(pOdobren);


        let pDatum = document.createElement('p');
        pDatum.innerHTML = "<strong>Datum: </strong>" + upit.trazeniDatum;
        divUpit.appendChild(pDatum);

        const pTekstUpita = document.createElement('p');
        pTekstUpita.innerHTML = upit.tekst;

        divUpit.appendChild(pTekstUpita);
        
        return divUpit;
    }

    const napraviHTMLPonude = function(upit){
        const divUpit = document.createElement('div');
        divUpit.classList.add('upit');

        const pId = document.createElement('p');
        pId.innerHTML = `<strong>ID Ponude:</strong> ${upit.id}`;
        divUpit.appendChild(pId);
        
        const pUsername = document.createElement('p');
        if(idUsername && idUsername[upit.korisnikId]){
            pUsername.innerHTML = "<strong>Username korisnika: </strong>" + idUsername[upit.korisnikId];
        }else{
            pUsername.innerHTML = "<strong>Username korisnika: </strong>" + upit.korisnikId;
        }
        divUpit.appendChild(pUsername);

        let pOdobren = document.createElement('p');
        let odobren = "Na čekanju";
        if(upit.odbijenaPonuda === false)
            odobren = "Odobren";
        else if (upit.odbijenaPonuda === true)
            odobren = "Odbijen";
        pOdobren.innerHTML = "<strong>Status odobrenja:</strong> " + odobren;
        divUpit.appendChild(pOdobren);


        let pDatum = document.createElement('p');
        pDatum.innerHTML = "<strong>Datum: </strong>" + upit.datumPonude;
        divUpit.appendChild(pDatum);

        if(upit.cijenaPonude){
            let pCijena = document.createElement('p');
            pCijena.innerHTML = "<strong>Cijena: </strong>" + upit.cijenaPonude;
            divUpit.appendChild(pCijena);
        }

        const pTekstUpita = document.createElement('p');
        pTekstUpita.innerHTML = upit.tekst;

        divUpit.appendChild(pTekstUpita);
        
        return divUpit;
    }

    const napraviHTMLInteresovanja = function(interesovanje){
        if(interesovanje.datumPonude)
            return napraviHTMLPonude(interesovanje);
        if(interesovanje.trazeniDatum)
            return napraviHTMLZahtjeva(interesovanje);
        return napraviHTMLUpita(interesovanje);
    }

    const fnLijevo = function(){
        //console.log("Pozvan lijevo");
        indeks = indeks - 1;
        if(indeks < 0) indeks = Elementi.length - 1;
        //glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]);
        glavniElement.innerHTML = napraviHTMLInteresovanja(Elementi[indeks]).outerHTML;
    }


    const fnDesno = function(){
        indeks = (indeks + 1) % Elementi.length;
        glavniElement.innerHTML = napraviHTMLInteresovanja(Elementi[indeks]).outerHTML;
        // indeks += 1;
        // if(indeks === Elementi.length){
        //     if(ucitaniSvi){
        //         indeks = 0;
        //         glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
        //     }else{
        //         PoziviAjax.getNextUpiti(nekretnina_id,parseInt(Elementi.length / 3), (err, upiti) => {
        //             if(err){
        //                 console.log("Greska pri dobavljanju stranice", err);
        //                 indeks = 0;
        //                 ucitaniSvi = true;
        //                 glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
        //             }else{
        //                 ucitaniSvi = upiti.length < 3;

        //                 if(upiti.length != 0){
        //                     Elementi = Elementi.concat(upiti);
        //                     //console.log(Elementi);
        //                 }else{
        //                     ucitaniSvi = true;
        //                     indeks = 0;
        //                 }
        //                 glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
        //             }
        //         });
        //     }
        // }else{
        //     glavniElement.innerHTML = napraviHTMLUpita(Elementi[indeks]).outerHTML;
        // }
    }

    return {fnLijevo, fnDesno};
}