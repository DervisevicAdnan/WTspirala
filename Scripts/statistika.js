let rasponCijena = [];
let rasponPerioda = [];


const listaNekretnina = [{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2023.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 32000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2009.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2003.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},
{
    id: 2,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 3,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 4,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
}]

const listaKorisnika = [{
    id: 1,
    ime: "Neko",
    prezime: "Nekic",
    username: "username1",
},
{
    id: 2,
    ime: "Neko2",
    prezime: "Nekic2",
    username: "username2",
}]

let stat = StatistikaNekretnina();
stat.init(listaNekretnina, listaKorisnika);

let chart;

function dodajCijenu(){
    let cijenaOd = parseInt(document.getElementById("cijenaOd").value);
    let cijenaDo = parseInt(document.getElementById("cijenaDo").value);
    document.getElementById("cijenaOd").value = "";
    document.getElementById("cijenaDo").value = "";
    console.log(cijenaDo);
    console.log(rasponCijena);

    if(cijenaOd !== undefined && cijenaOd !== null && cijenaDo !== undefined && cijenaDo !== null &&  cijenaOd <= cijenaDo){
        document.getElementById("rasponiCijena").innerHTML += "<br>" + "id: " + rasponCijena.length + 
            ", od: " + cijenaOd + ", do: " + cijenaDo;
        rasponCijena.push({od: cijenaOd, do: cijenaDo});
    }
}

function resetujCijene(){
    rasponCijena = [];
    document.getElementById("rasponiCijena").innerHTML = "";
}

function dodajPeriod(){
    let periodOd = parseInt(document.getElementById("periodOd").value);
    let periodDo = parseInt(document.getElementById("periodDo").value);
    document.getElementById("periodOd").value = "";
    document.getElementById("periodDo").value = "";
    console.log(periodOd);
    console.log(periodDo);
    console.log(rasponPerioda);

    if(periodOd !== undefined && periodOd !== null && periodDo !== undefined && periodDo !== null && periodOd <= periodDo){
        console.log("Belaj?")
        document.getElementById("rasponiPerioda").innerHTML += "<br>" + "id: " + rasponPerioda.length + 
            ", od: " + periodOd + ", do: " + periodDo;
        rasponPerioda.push({od: periodOd, do: periodDo});
    }
}

function resetujPeriod(){
    rasponPerioda = [];
    document.getElementById("rasponiPerioda").innerHTML = "";
}

function iscrtajHistogram(){
    let ctx = document.getElementById('myChart');
    let histogram = stat.histogramCijena(rasponPerioda, rasponCijena);
    let datasets = [];
    for(let i = 0; i < rasponPerioda.length; i++){
        datasets.push({
            label: 'Period: ' + rasponPerioda[i].od + " - " + rasponPerioda[i].do,
            data: [],
            borderWidth: 1
        })
    }
    for(let i = 0; i < histogram.length; i++){
        datasets[histogram[i]["indeksPerioda"]].data.push(histogram[i]["brojNekretnina"]);
    }
    const labels = rasponCijena.map(item => "" + item.od + " - " + item.do);
    const data = {
        labels: labels,
        datasets: datasets
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    };
    
    if(chart) chart.destroy();
    chart = new Chart(ctx, config);
}
