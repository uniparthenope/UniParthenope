const observableModule = require("tns-core-modules/data/observable");
const utilsModule = require("tns-core-modules/utils/utils");
const platformModule = require("tns-core-modules/platform");
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");

require("nativescript-accordion");


let closeCallback;
let today = new Date();
let page;

function onShownModally(args) {
    const context = args.context;
    //today.setDate(today.getDate()+1);
    console.log(today);
    console.log(dateToString(today));

    closeCallback = args.closeCallback;
    page = args.object;

    page.bindingContext = observableModule.fromObject(context);

    if (context.lat !== undefined || context.long !== undefined){
        getWeather(context.lat, context.long);
    }
    else
        getWeather(40.8379399, 14.2520741);
}

exports.ontap_download = function(){
    if (platformModule.isAndroid){
        utilsModule.openUrl("market://details?id=it.meteo.uniparthenope");
    }
};
exports.onShownModally = onShownModally;

function getWeather(lat, long) {
    httpModule.request({
        url: "https://api.meteo.uniparthenope.it/places/search/bycoords/" + lat + "/" + long + "?filter=com",
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const data = response.content.toJSON();
        let place = data[0].long_name.it;
        if (place.includes("Municipalit")) {
            let tmp = place.split("-");
            let tmp1 = tmp.pop();
            page.getViewById("position").text = tmp1;
        } else {
            page.getViewById("position").text = place;

        }

        let id = data[0].id;
        console.log(id);
            httpModule.request({
                url: "https://api.meteo.uniparthenope.it/products/wrf5/timeseries/" + id,
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then((response) => {
                const _response = response.content.toJSON();
                let timeseries = _response.timeseries;
               for(let day = 0; day<4; day ++) {

                   let nextDay = new Date();
                   nextDay.setDate(today.getDate()+day);
                   //console.log(nextDay);
                   for (let x = 0; x < timeseries.length; x++) {
                       if(dateToString(nextDay) === timeseries[x].dateTime){
                           console.log(timeseries[x].dateTime);
                           page.getViewById("date_" + day).text = dateToDDMM(nextDay);
                           page.getViewById("image_" + day).backgroundImage = "https://meteo.uniparthenope.it/sites/all/themes/zircon_custom/js/images/" + timeseries[x].icon;
                           page.getViewById("temperature_" + day).text = timeseries[x].t2c + " °C";
                           page.getViewById("wind_speed_" + day).text = (timeseries[x].ws10n * 0.514444).toFixed(2) + " m/s";
                           page.getViewById("wind_" + day).text = timeseries[x].winds;
                           page.getViewById("weather_" + day).text = timeseries[x].text.it;
                       }

                   }
               }
            },(e) => {
                console.log("Error", e);
                dialogs.alert({
                    title: "Errore Meteo!",
                    message: e,
                    okButtonText: "OK"
                });
            });

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Meteo!",
            message: e,
            okButtonText: "OK"
        });
    });
    /*
    fetch( "https://api.meteo.uniparthenope.it/places/search/bycoords/" + lat + "/" + long + "?filter=com").then((response) => response.json()).then((data) => {
        let place = data[0].long_name.it;
        if (place.includes("Municipalit")) {
            let tmp = place.split("-");
            let tmp1 = tmp.pop();
            page.getViewById("position").text = tmp1;
            //console.log("POSTO : " + place_selected);
        } else {
            page.getViewById("position").text = place;

           // console.log("POSTO : " + place_selected);
        }

        let id = data[0].id;
        for (let x = 0; x<4; x++){
            httpModule.request({
                url: "https://api.meteo.uniparthenope.it/products/wrf5/forecast/" + id + "?date=" + dateToString(today),
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then((response) => {
                const result = response.content.toJSON();
                //console.log(result);

            },(e) => {
                console.log("Error", e);
                dialogs.alert({
                    title: "Errore Meteo!",
                    message: e,
                    okButtonText: "OK"
                });
            });
            fetch(  "https://api.meteo.uniparthenope.it/products/wrf5/forecast/" + id + "?date=" + dateToString(today)).then((response) => response.json()).then((data1) => {
                today.setDate(today.getDate()+x);
                console.log("ZZZ "+today);
                if (data1.result === "ok") {
                    page.getViewById("date_" + x).text = dateToDDMM(today);
                    page.getViewById("image_" + x).backgroundImage = "https://meteo.uniparthenope.it/sites/all/themes/zircon_custom/js/images/" + data1.forecast.icon;
                    page.getViewById("temperature_" + x).text = data1.forecast.t2c + " °C";
                    page.getViewById("wind_speed_" + x).text = (data1.forecast.ws10n * 0.514444).toFixed(2) + " m/s";
                    page.getViewById("wind_" + x).text = data1.forecast.winds;
                    page.getViewById("weather_" + x).text = data1.forecast.text.it;

                } else if (data1.result === "error") {

                }
            }).catch(error => console.error("[SEARCH] ERROR DATA ", error));

        }

    });

     */
}
function dateToString(today){
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
        if (month < 10)
            month = "0" + month.toString();
    let day = today.getDate();
        if (day < 10)
            day = "0"+day.toString();

    let hour = today.getHours();
        if (hour < 10)
            hour = "0"+hour.toString();

    let output = year.toString() + month + day +"Z" + hour + "00";


    return output;

}

function dateToDDMM(today){
    const giorno = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
    let month = today.getMonth() + 1;
    if (month < 10)
        month = "0" + month.toString();
    let day = today.getDate();
    if (day < 10)
        day = "0"+day.toString();

    let output = giorno[today.getDay()] + " "+day + "/" + month;


    return output;

}
