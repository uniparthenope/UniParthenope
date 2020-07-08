let geolocation = require("nativescript-geolocation");
const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const nativescript_webview_interface_1 = require("nativescript-webview-interface");
const httpModule = require("tns-core-modules/http");
let timer = require("tns-core-modules/timer");
let timer_id;
let myposition_id;
let bus_timer;

let page;
let grpDes = appSettings.getString("grpDes");
let viewModel;
let sideDrawer;
let oLangWebViewInterface;
let array_locations = [{id:'CDN', name: 'Centro Direzionale', lat: 40.856831, long: 14.284553, sede_1:"Via Acton", sede_2:"Via Medina", sede_3:"Via Parisi", sede_4:"Villa Doria"},
                        {id:'Acton',name: 'Via Acton', lat: 40.837372, long: 14.253502, sede_1:"Centro Direzionale", sede_2:"Via Medina", sede_3:"Via Parisi", sede_4:"Villa Doria"},
                        {id:'Medina',name: 'Via Medina', lat: 40.840447, long: 14.251863, sede_1:"Via Acton", sede_2:"Centro Direzionale", sede_3:"Via Parisi", sede_4:"Villa Doria"},
                        {id:'Parisi',name: 'Via Parisi', lat: 40.832308, long: 14.245027, sede_1:"Via Acton", sede_2:"Via Medina", sede_3:"Centro Direzionale", sede_4:"Villa Doria"},
                        {id:'Villa',name: 'Villa Doria', lat: 40.823872, long: 14.216225, sede_1:"Via Acton", sede_2:"Via Medina", sede_3:"Via Parisi", sede_4:"Centro Direzionale"}];

function setupWebViewInterface(page){
    let webView = page.getViewById('webView');
    oLangWebViewInterface = new nativescript_webview_interface_1.WebViewInterface(webView, '~/www/index.html');
}

function pageLoaded(args) {
    page = args.object;
    viewModel = observableModule.fromObject({ });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    let bottom_bar = page.getViewById("bottom_bar");

    if (global.isConnected === false){
        bottom_bar.visibility = "collapsed";
    }
    else {
        global.getAllBadge(page);
        page.getViewById("selected_col").col = "4";
        bottom_bar.visibility = "visible";
    }
    setupWebViewInterface(page);

    //Imposto la posizione attuale e la legenda in basso
    let name_pos = appSettings.getString("position");
    loadGraphic(name_pos);

    geolocation.enableLocationRequest().then(function () {
        geolocation.isEnabled().then(function (isEnabled) {
            myposition_id = geolocation.watchLocation(
                function (loc) {
                    if (loc) {
                        let latitudine = (loc.latitude).toString();
                        let longitudine = (loc.longitude).toString();
                        console.log("Live POSITION =" + latitudine.toString() + " " + longitudine.toString());
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
    getBusPosition();
    timer_id = timer.setInterval(() => {
        console.log("Timer....");
        getBusPosition();
    }, 10000);


    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu() {
    console.log("Interrompo servizi GPS...");
    timer.clearInterval(timer_id);
    oLangWebViewInterface.destroy();
    geolocation.clearWatch(myposition_id);
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

function loadGraphic(id){
    page.getViewById("sede").text = "Nessuna sede Parthenope a meno di 200m";

    for (let i = 0; i < array_locations.length; i++) {
        if (array_locations[i].id === id){
            page.getViewById("sede").text = "Sede Attuale: " + array_locations[i].name;
            page.getViewById("sede_1").text = array_locations[i].sede_1;
            page.getViewById("sede_2").text = array_locations[i].sede_2;
            page.getViewById("sede_3").text = array_locations[i].sede_3;
            page.getViewById("sede_4").text = array_locations[i].sede_4;
            page.getViewById("sede_1").visibility = "visible";
            page.getViewById("sede_2").visibility = "visible";
            page.getViewById("sede_3").visibility = "visible";
            page.getViewById("sede_4").visibility = "visible";

        }

    }
}

function getBusPosition() {

        httpModule.request({
            url: global.url_general + "Bus/v1/bus/CDN",
            method: "GET",
            headers: {
                "Content-Type" : "application/json"}
        }).then((response) => {
            const result = response.content.toJSON();

            if (response.statusCode === 500) {
                dialogs.alert({
                    title: "Errore Server!",
                    message: result.retErrMsg,
                    okButtonText: "OK"

                });
            } else {
                bus_timer = setTimeout(function () {
                    oLangWebViewInterface.emit('bus', {bus: result});
                }, 800);
            }

        }, (e) => {
            console.log("Error", e.retErrMsg);
            dialogs.alert({
                title: "Errore Server!",
                message: e.retErrMsg,
                okButtonText: "OK"
            });
        });
}

function onNavigatingFrom(args) {
    console.log("Interrompo servizi GPS...");
    timer.clearInterval(timer_id);
    clearTimeout(bus_timer);

    oLangWebViewInterface.destroy();
    geolocation.clearWatch(myposition_id);
}

exports.tapCourses = function(){
    if (grpDes === "Studenti"){
        const nav =
            {
                moduleName: "corsi/corsi",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
    else if (grpDes === "Docenti")
    {
        const nav =
            {
                moduleName: "docenti/docenti-home/docenti-home",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
};

exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: false,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapCalendar = function(){
    if (grpDes === "Studenti"){
        const nav =
            {
                moduleName: "userCalendar/userCalendar",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
    else if (grpDes === "Docenti")
    {
        const nav =
            {
                moduleName: "docenti/docenti-home/docenti-home",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
};

exports.tapAppello = function(){
    if (grpDes === "Studenti"){

        const nav =
            {
                moduleName: "prenotazioni/prenotazioni",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
    else if (grpDes === "Docenti")
    {
        const nav =
            {
                moduleName: "docenti/docenti-home/docenti-home",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
};

exports.onNavigatingFrom = onNavigatingFrom;
exports.onGeneralMenu = onGeneralMenu;
exports.pageLoaded = pageLoaded;
exports.onDrawerButtonTap = onDrawerButtonTap;
