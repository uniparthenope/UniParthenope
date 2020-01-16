const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const modalViewModule = "modal-esame/modal-esame";

let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appelli;
let loading;
let num;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "2";
    //appSettings.setBoolean("esami_futuri",false);
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    items_appelli = new ObservableArray();
    appelli_listview = page.getViewById("appelli_listview");
    loading = page.getViewById("activityIndicator");

    viewModel = Observable.fromObject({
        items_appelli: items_appelli
    });
    let prenotazione = global.myPrenotazioni;

    for (let i=0 ; i < prenotazione.length; i++){
        items_appelli.push({
            "dataEsame": prenotazione[i].dataEsa,
            "classe": "examPass",
            "esame": prenotazione[i].desApp,
            "docente": prenotazione[i].nome_pres + " "+ prenotazione[i].cognome_pres,
            "descrizione": prenotazione[i].tipoApp,
            "edificio": prenotazione[i].edificioDes,
            "aula": prenotazione[i].aulaDes,
            "iscritti": prenotazione[i].numIscritti,
            "note": prenotazione[i].note
        })
    }


    global.getAllBadge(page);
    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function drawTitle() {
    page.getViewById("aa").text = "A.A. " + appSettings.getString("aa_accad");
    page.getViewById("sessione").text = appSettings.getString("sessione");
}

function onGeneralMenu(){
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "corsi/corsi",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapAppello = function(){
    const nav =
        {
            moduleName: "userAppelli/appelli",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;
    const adLogId = { adId: items_appelli.getItem(index).adId, appId: items_appelli.getItem(index).appId, docente: items_appelli.getItem(index).docente,
        esame: items_appelli.getItem(index).esame};

    mainView.showModal(modalViewModule, adLogId, false);
}

exports.onItemTap = onItemTap;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
