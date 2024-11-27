let carouselControls = postaviCarousel(document.getElementById("upiti"),document.getElementsByClassName("upit"));
document.getElementById("prethodni").addEventListener("click", carouselControls.fnLijevo);
document.getElementById("sljedeci").addEventListener("click", carouselControls.fnDesno);