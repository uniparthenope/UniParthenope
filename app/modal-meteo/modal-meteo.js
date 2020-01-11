const observableModule = require("tns-core-modules/data/observable");
const utilsModule = require("tns-core-modules/utils/utils");
const platformModule = require("tns-core-modules/platform");
require("nativescript-accordion");


let closeCallback;

let page;

function onShownModally(args) {
    const context = args.context;

    console.log(context.lat);

    closeCallback = args.closeCallback;
    page = args.object;

    page.bindingContext = observableModule.fromObject(context);

    getWeather(context.lat, context.long);
}

exports.ontap_download = function(){
    if (platformModule.isAndroid){
        utilsModule.openUrl("market://details?id=it.meteo.uniparthenope");
    }
};
exports.onShownModally = onShownModally;

function getWeather(lat, long) {
    fetch( "https://api.meteo.uniparthenope.it/places/search/bycoords/" + lat + "/" + long + "?filter=com").then((response) => response.json()).then((data) => {
        let place = data[0].long_name.it;
        if (place.includes("Municipalit")) {
            var tmp = place.split("-");
            var tmp1 = tmp.pop();
            page.getViewById("position").text = tmp1;
            place_selected = tmp1;
            console.log("POSTO : " + place_selected);
        } else {
            page.getViewById("position").text = place;
            place_selected = place;
            console.log("POSTO : " + place_selected);
        }

        let id = data[0].id;

        fetch(  "https://api.meteo.uniparthenope.it/products/wrf5/forecast/" + id + "?date=" + "20200110Z1100").then((response) => response.json()).then((data1) => {
            //console.log(data1);
            if (data1.result == "ok") {

                console.log(data1.forecast.t2c);
                /*if (appSetting.getNumber("Temperatura", 0) == 0)
                    home.set("temp", data1.forecast.t2c + " °C");
                else if (appSetting.getNumber("Temperatura", 0) == 1) {
                    home.set("temp", ((data1.forecast.t2c * 1.8) + 32).toFixed(2) + " °F");
                }
                if (appSetting.getNumber("Vento", 0) == 0)
                    home.set("wind", data1.forecast.ws10n + " kn");
                else if (appSetting.getNumber("Vento", 0) == 1) {
                    home.set("wind", (data1.forecast.ws10n * 1.852).toFixed(2) + " km/h");
                } else if (appSetting.getNumber("Vento", 0) == 2) {
                    home.set("wind", (data1.forecast.ws10n * 0.514444).toFixed(2) + " m/s");
                } else if (appSetting.getNumber("Vento", 0) == 3) {
                    home.set("wind", (get_beaufort(data1.forecast.ws10n)) + " beaufort");
                }

                home.set("wind_direction", data1.forecast.winds);
                home.set("icon", '~/meteo_icon/' + data1.forecast.icon);
                 */

            } else if (data1.result == "error") {

            }
        }).catch(error => console.error("[SEARCH] ERROR DATA ", error));
    });
};
