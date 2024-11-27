function StatistikaNektretnina(){
    let spisakNekretnina;
    let listaKorisnika = [];
    let listaNekretnina = [];

    let init = function(lista_nekretnina, lista_korisnika){
        this.listaNekretnina = lista_nekretnina;
        this.listaKorisnika = lista_korisnika;
        this.spisakNekretnina = SpisakNekretnina();
        this.spisakNekretnina.init(lista_nekretnina,lista_korisnika);
        
    }

    let prosjecnaKvadratura = function(kriterij){
        let filtriraneNekretnine = this.spisakNekretnina.filtriraneNekretnine(kriterij);
        let suma = 0;
        for(let i = 0; i < filtriraneNekretnine.length; i++){
            suma += filtriraneNekretnine[i].kvadratura;
        }
        return suma / filtriraneNekretnine.length;
    }

    let outlier = function(kriterij, nazivSvojstva){
        let suma = 0;
        for(let i = 0; i < this.listaNekretnina.length; i++){
            suma += this.listaNekretnina[i][nazivSvojstva];
        }

        let prosjek = suma / filtriraneNekretnine.length;
        let max_odstupanje = 0;
        let index_max_odstupanja;

        let filtriraneNekretnine = this.spisakNekretnina.filtriraneNekretnine(kriterij);
        for(let i = 0; i < filtriraneNekretnine.length; i++){
            let odstupanje = abs(prosjek - filtriraneNekretnine[i][nazivSvojstva]);
            if(odstupanje > max_odstupanje){
                max_odstupanje = odstupanje;
                index_max_odstupanja = i;
            }
        }
        return filtriraneNekretnine[index_max_odstupanja];
    }
    
    let mojeNekretnine = function(korisnik){
        let lista = [];
        for(let i = 0; i < this.listaNekretnina.length; i++){
            for(let j = 0; j < this.listaNekretnina[i].upiti.length; j++){
                if(this.listaNekretnina[i].upiti[j].korisnik_id == korisnik.id)
                    lista.push(this.listaNekretnina[i]);
            }
        }
        return lista.sort(function(a,b){
            let num_a = 0;
            for(let i = 0; i < a.upiti.length; i++){
                if(a.upiti[i].korisnik_id == korisnik.id)
                    num_a++
            }
            let num_b = 0;
            for(let i = 0; i < b.upiti.length; i++){
                if(b.upiti[i].korisnik_id == korisnik.id)
                    num_b++
            }
            return num_a - num_b;
            //return a.upiti.length - b.upiti.length;
        });
    }

    let histogramCijena = function(periodi,rasponiCijena){
        let histogram = [];
        //console.log("sta je belaj");
        for(let i = 0; i < periodi.length; i++){
            for(let j = 0; j < rasponiCijena.length; j++){
                let tmp = 0;
                for(let k = 0; k < this.listaNekretnina.length; k++){
                    /*console.log("cijene");
                    console.log(this.listaNekretnina[k].cijena);
                    console.log(rasponiCijena[j].od);
                    console.log(rasponiCijena[j].do);*/
                    if(this.listaNekretnina[k].cijena >= rasponiCijena[j].od && this.listaNekretnina[k].cijena <= rasponiCijena[j].do){
                        let godina = parseInt(this.listaNekretnina[k].datum_objave.substring(6,10));
                        /*console.log("godine: " + this.listaNekretnina[k].datum_objave.substring(6,10));
                        console.log(godina);
                        console.log(periodi[i].od);
                        console.log(periodi[i].do);*/
                        if(godina >= periodi[i].od && godina <= periodi[i].do) tmp++;
                    }
                }
                histogram.push({
                    indeksPerioda: i,
                    indeksRasponaCijena: j,
                    brojNekretnina: tmp
                });
            }
        }
        return histogram;
    }
    return {init, prosjecnaKvadratura, outlier, mojeNekretnine, histogramCijena};
}
/*let stats = StatistikaNektretnina();
stats.init(listaNekretnina,listaKorisnika);
console.log(stats.histogramCijena([{od:2000,do:2010},{od:2010,do:2024}],[{od:10000,
    do:150000},{od:150000,do:1000000}]));*/