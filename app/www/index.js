(function () {
    var oWebViewInterface1 = window.nsWebViewInterface;
    var DynaMarker;

    var mymap = L.map('mapid').setView([40.8553396,14.2830908], 12);
    var sedeIcon = L.icon({
        iconUrl: 'school.png',
        iconSize:     [45, 45], // size of the icon
    });
    var busIcon = L.icon({
        iconUrl: 'bus.png',
        iconSize:     [45, 45], // size of the icon
    });
    var my_location = L.icon({
        iconUrl: 'my_location.png',
        iconSize:     [45, 45], // size of the icon
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
    }).addTo(mymap);

    /**SEDI UNIVERSITARIE */

    //Centro Direzionale
    L.marker([40.856831, 14.284553], {icon: sedeIcon}).addTo(mymap)
        .bindPopup('<strong>Sede Centro Direzionale</strong><br><i>Centro Direzionale, Isola C4</i><br>Dipartimento di Ingegneria<br>Dipartimento di Scienze e Tecnologie');
    //Via Acton
    L.marker([40.837372, 14.253502],{icon: sedeIcon}).addTo(mymap)
        .bindPopup('<strong>Sede Centrale</strong><br><i>Via Amm. Acton, 38</i><br>La sede principale dell\'Università degli Studi di Napoli "Parthenope" è collocata in Napoli alla Via Ammiraglio Ferdinando Acton n. 38 e consiste in un nucleo storico, la c.d. "Palazzina Spagnola", risalente al XVI secolo ed in un fabbricato più moderno realizzato alla fine degli anni \'60.');
    //Via Parisi
    L.marker([40.832308, 14.245027], {icon: sedeIcon}).addTo(mymap)
        .bindPopup('<strong>Sede Palazzo Pacanowski</strong><br><i>Via Generale Parisi n. 13</i><br>Dipartimento di Giurisprudenza<br>Dipartimento di Studi Aziendali ed Economici<br>Dipartimento di Studi Aziendali e Quantitativi<br>Dipartimento di Economici e Giuridici');
    //Via Medina
    L.marker([40.840447, 14.251863],{icon: sedeIcon}).addTo(mymap)
        .bindPopup('<strong>Sede Via Medina</strong><br><i>Via Medina</i><br>Dipartimento di Scienze Motorie e del Benessere');
    //Villa Doria
    L.marker([40.823872, 14.216225], {icon: sedeIcon}).addTo(mymap)
        .bindPopup('<strong>Villa Doria D\'Angri</strong><br><i>Via Francesco Petrarca</i><br>Apple iOS Foundation<br>Museo Navale');

    let layerGroup = L.layerGroup();

    oWebViewInterface1.on('location', function (cor) {
        latitudine = cor.lat;
        longitudine = cor.lang;
        DynaMarker = L.marker([cor.lat,cor.lang], {icon: my_location});
        DynaMarker.setLatLng([cor.lat, cor.lang]).addTo(mymap);
    });

    oWebViewInterface1.on('bus', function (cor) {
        //console.log(cor.bus);
        result = cor.bus;

        layerGroup.clearLayers();

        for(let i=0; i<result.length; i++){
            for(let j=0; j<result[i]["linea"].length; j++){
                for(let k=0; k<result[i]["linea"][j]["bus"].length; k++){
                    //console.log(result[i]["linea"][j]["bus"][k]["lat"]);
                    //console.log(result[i]["linea"][j]["bus"][k]["lat"]);
                    let x = L.marker([result[i]["linea"][j]["bus"][k]["lat"], result[i]["linea"][j]["bus"][k]["long"]], {icon: busIcon}).bindPopup(result[i]["linea"][j]["linea"]);
                    layerGroup.addLayer(x);
                }
            }
        }

        layerGroup.addTo(mymap);
    });
})();
