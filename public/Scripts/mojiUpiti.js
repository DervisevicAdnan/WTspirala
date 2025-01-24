PoziviAjax.getMojiUpiti((err, upiti) => {
    if(err){
        console.error("Greška prilikom dohvatanja upita sa servera:", err);
    }else{
        const divUpiti = document.getElementById('upiti');
        upiti.forEach(upit => {
            const divUpit = document.createElement('div');
            divUpit.classList.add('upit');

            const pNekretnina = document.createElement('p');
            const pStrongNekretnina = document.createElement('strong');
            pStrongNekretnina.innerHTML = "ID nekretnine: ";

            pNekretnina.appendChild(pStrongNekretnina);
            pNekretnina.append(upit.id_nekretnine);

            divUpit.appendChild(pNekretnina);

            const pTekstUpita = document.createElement('p');
            pTekstUpita.innerHTML = upit.tekst_upita;
            divUpit.appendChild(pTekstUpita);
            
            divUpiti.appendChild(divUpit);
        });
    }
});