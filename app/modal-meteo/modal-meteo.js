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
        getWeather(40.7, 14.17);
}

exports.ontap_download = function(){
    if (platformModule.isAndroid){
        utilsModule.openUrl("market://details?id=it.meteo.uniparthenope");
    }else{
        utilsModule.openUrl("https://apps.apple.com/us/app/id1518001997");
    }
};
exports.onShownModally = onShownModally;

function getWeather(lat, long) {
    httpModule.request({
        url: "https://api.meteo.uniparthenope.it/places/search/bycoords/" + lat + "/" + long,
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
