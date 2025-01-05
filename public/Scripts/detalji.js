let sviElementi = [...document.getElementsByClassName("upit")];

let carouselControls = postaviCarousel(document.getElementById("upiti"), document.getElementsByClassName("upit"));
document.getElementById("prethodni").addEventListener("click", carouselControls.fnLijevo);
document.getElementById("sljedeci").addEventListener("click", carouselControls.fnDesno);

window.addEventListener("resize", function(){
    if(this.window.outerWidth > 600) {
        let doc = this.document.getElementById("upiti");
        doc.innerHTML = "";
        for(let i = 0; i < sviElementi.length; i++){
            doc.innerHTML += sviElementi[i].outerHTML;
        }
    }else{
        this.carouselControls = postaviCarousel(this.document.getElementById("upiti"), this.document.getElementsByClassName("upit"));
        this.document.getElementById("prethodni").addEventListener("click", this.carouselControls.fnLijevo);
        this.document.getElementById("sljedeci").addEventListener("click", this.carouselControls.fnDesno);
    }
})