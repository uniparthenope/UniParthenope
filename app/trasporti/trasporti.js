let geolocation = require("nativescript-geolocation");
const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
var nativescript_webview_interface_1 = require("nativescript-webview-interface");

let page;
let viewModel;
let sideDrawer;
let oLangWebViewInterface;
let array_locations = [{name: 'Centro Direzionale', lat: 40.856831, long: 14.284553, sede_1:"Via Acton", sede_2:"Via Medina", sede_3:"Via Parisi", sede_4:"Villa Doria"},
                        {name: 'Via Acton', lat: 40.837372, long: 14.253502, sede_1:"Centro Direzionale", sede_2:"Via Medina", sede_3:"Via Parisi", sede_4:"Villa Doria"},
                        {name: 'Via Medina', lat: 40.840447, long: 14.251863, sede_1:"Via Acton", sede_2:"Centro Direzionale", sede_3:"Via Parisi", sede_4:"Villa Doria"},
                        {name: 'Via Parisi', lat: 40.832308, long: 14.245027, sede_1:"Via Acton", sede_2:"Via Medina", sede_3:"Centro Direzionale", sede_4:"Villa Doria"},
                        {name: 'Villa Doria', lat: 40.823872, long: 14.216225, sede_1:"Via Acton", sede_2:"Via Medina", sede_3:"Via Parisi", sede_4:"Centro Direzionale"}];

function setupWebViewInterface(page){
    var webView = page.getViewById('webView');
    oLangWebViewInterface = new nativescript_webview_interface_1.WebViewInterface(webView, '~/www/index.html');
}

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({ });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    setupWebViewInterface(page);

    geolocation.enableLocationRequest().then(function () {
        geolocation.isEnabled().then(function (isEnabled) {
            geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
            then(function(loc) {
                if (loc) {
                    let name_pos = calculateDistance(loc);
                    if (name_pos === "")
                        page.getViewById("sede").text = "Sede: Nessuna a meno di 200m";
                    else
                        page.getViewById("sede").text = "Sede: "+ name_pos;
                    //load_route(name_pos); //Carico i percorsi da NAME_POS verso le altre sedi
                }
            }, function(e){
                console.log("Error: " + e.message);
            });
            geolocation.watchLocation(
                function (loc) {
                    if (loc) {
                        let latitudine = (loc.latitude).toString();
                        let longitudine = (loc.longitude).toString();
                        console.log(latitudine);
                        console.log(longitudine);
                        setTimeout(function () {
                            oLangWebViewInterface.emit('location', {lat: latitudine, lang: longitudine});
                        }, 800);
                    }
                },
                function (e) {
                    console.log("Error: " + e.message);
                },
                {desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime: 1000 * 2});
        })
    });

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu() {
    page.frame.goBack();
}
function calculateDistance(position){
    let closer = "";
    page.getViewById("sede_1").visibility = "collapsed";
    page.getViewById("sede_2").visibility = "collapsed";
    page.getViewById("sede_3").visibility = "collapsed";
    page.getViewById("sede_4").visibility = "collapsed";

    for (let i=0; i< array_locations.length; i++)
    {
        let loc = new geolocation.Location();
        loc.latitude = array_locations[i].lat;
        loc.longitude = array_locations[i].long;

        if (geolocation.distance(position, loc) < 200){
            closer = array_locations[i].name;
            loadGraphic(array_locations[i]);
        }

        console.log("Distance between loc1 and loc2 is: " + geolocation.distance(position, loc));
    }
    return closer;
}
function loadGraphic(array_location){
    page.getViewById("sede").text = array_location.name;
    page.getViewById("sede_1").text = array_location.sede_1;
    page.getViewById("sede_2").text = array_location.sede_2;
    page.getViewById("sede_3").text = array_location.sede_3;
    page.getViewById("sede_4").text = array_location.sede_4;
    page.getViewById("sede_1").visibility = "visible";
    page.getViewById("sede_2").visibility = "visible";
    page.getViewById("sede_3").visibility = "visible";
    page.getViewById("sede_4").visibility = "visible";
}
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
