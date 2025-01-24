function spojiNekretnine(divReferenca, nekretnine) {
    divReferenca.innerHTML = '';

    if (nekretnine.length === 0) {
        divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
    } else {
        nekretnine.forEach(nekretnina => {
            
            const nekretninaElement = document.createElement('div');
            nekretninaElement.classList.add('nekretnina');

            const slikaElement = document.createElement('img');
            slikaElement.classList.add('slika-nekretnine');
            slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
            slikaElement.alt = nekretnina.naziv;
            nekretninaElement.appendChild(slikaElement);

            const detaljiElement = document.createElement('div');
            detaljiElement.classList.add('detalji-nekretnine');
            detaljiElement.innerHTML = `
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
            `;
            nekretninaElement.appendChild(detaljiElement);

            const cijenaElement = document.createElement('div');
            cijenaElement.classList.add('cijena-nekretnine');
            cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
            nekretninaElement.appendChild(cijenaElement);

            const detaljiDugme = document.createElement('a');
            detaljiDugme.href = '../detalji.html?id=' + nekretnina.id;
            detaljiDugme.classList.add('detalji-dugme');
            detaljiDugme.textContent = 'Detalji';
            nekretninaElement.appendChild(detaljiDugme);

            divReferenca.appendChild(nekretninaElement);
        });
    }
}

function prikaziTop5Nekretnina(lokacija){
    const divTop5 = document.getElementById('top5');
    const naslovTop5 = document.getElementById('naslovTop5');
    PoziviAjax.getTop5Nekretnina(lokacija, (err, nek) => {
        if(err){
            console.error("Greška prilikom dohvatanja nekretnina sa servera:", err);
        }else{
            naslovTop5.innerHTML = "TOP 5 NEKRETNINA ZA: " + lokacija;
            naslovTop5.style.display = "block";

            spojiNekretnine(divTop5, nek);
            divTop5.style.display = "flex";
        }
    })
}

function spojiDetaljiOsnovno(divOsnovno, nekretnina){
    const slikaElement = document.createElement('img');
    slikaElement.classList.add('slika-nekretnine');
    slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
    slikaElement.alt = nekretnina.naziv;
    divOsnovno.appendChild(slikaElement);

    const pNazivElement = document.createElement('p');
    pNazivElement.innerHTML = '<strong>Naziv:</strong> ' + nekretnina.naziv;
    divOsnovno.appendChild(pNazivElement);

    const pKvadraturaElement = document.createElement('p');
    pKvadraturaElement.innerHTML = '<strong>Kvadratura:</strong> ' + nekretnina.kvadratura;
    divOsnovno.appendChild(pKvadraturaElement);

    const pCijenaElement = document.createElement('p');
    pCijenaElement.innerHTML = '<strong>Cijena:</strong> ' + nekretnina.cijena;
    divOsnovno.appendChild(pCijenaElement);
}

function spojiDetaljiDetalje(divDetalji, nekretnina){
    const divKolona1 = document.createElement('div');
    divKolona1.id = 'kolona1';

    const pTipGrijanjaElement = document.createElement('p');
    pTipGrijanjaElement.innerHTML = '<strong>Tip grijanja:</strong> ' + nekretnina.tip_grijanja;
    divKolona1.appendChild(pTipGrijanjaElement);

    const aLokacija = document.createElement('a');
    aLokacija.href = '#';
    aLokacija.addEventListener("click", (e) => {
        e.preventDefault();
        prikaziTop5Nekretnina(nekretnina.lokacija);
    });
    aLokacija.innerHTML = nekretnina.lokacija;


    const pLokacijaElement = document.createElement('p');
    pLokacijaElement.innerHTML = '<strong>Lokacija:</strong> ';
    pLokacijaElement.appendChild(aLokacija);
    
    divKolona1.appendChild(pLokacijaElement);

    divDetalji.appendChild(divKolona1);


    const divKolona2 = document.createElement('div');
    divKolona2.id = 'kolona2';

    const pGodinaIzgradnjeElement = document.createElement('p');
    pGodinaIzgradnjeElement.innerHTML = '<strong>Godina izgradnje:</strong> ' + nekretnina.godina_izgradnje;
    divKolona2.appendChild(pGodinaIzgradnjeElement);

    const pDatumObjaveElement = document.createElement('p');
    pDatumObjaveElement.innerHTML = '<strong>Datum objave oglasa:</strong> ' + nekretnina.datum_objave;
    divKolona2.appendChild(pDatumObjaveElement);

    divDetalji.appendChild(divKolona2);

    const divOpis = document.createElement('div');
    divOpis.id = 'opis';

    const pOpisElement = document.createElement('p');
    pOpisElement.innerHTML = '<strong>Opis:</strong> ' + nekretnina.opis;
    divOpis.appendChild(pOpisElement);

    divDetalji.appendChild(divOpis);
}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const divOsnovno = document.getElementById('osnovno');
const divDetalji = document.getElementById('detalji');
const divUpiti = document.getElementById('upiti');

PoziviAjax.getNekretnina(id, (err, nekretnina) => {
    if(err){
        console.error("Greška prilikom dohvatanja nekretnine sa servera:", err);
    }else{
        spojiDetaljiOsnovno(divOsnovno, nekretnina);
        spojiDetaljiDetalje(divDetalji, nekretnina);

        carouselControls = postaviCarousel(document.getElementById("upiti"), nekretnina.upiti, id);
        document.getElementById("prethodni").addEventListener("click", carouselControls.fnLijevo);
        document.getElementById("sljedeci").addEventListener("click", carouselControls.fnDesno);
    }
    
});

let carouselControls;

