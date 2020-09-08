const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");

let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appello;
let loading;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "2";
    //appSettings.setBoolean("esami_futuri",false);
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    items_appello = new ObservableArray();
    appelli_listview = page.getViewById("accordion");
    loading = page.getViewById("activityIndicator");

    viewModel = observableModule.fromObject({
        items_appello: items_appello
    });

    //loading.visibility = "visible";

    getAppelli();

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


function getAppelli() {
    items_appello.slice(0);

    for (let i=0; i<global.myAppelli.length; i++){
        items_appello.push(global.myAppelli.getItem(i));
    }
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
            moduleName: "docenti/docenti-home/docenti-home",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};
exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "docenti/docenti-corsi/docenti-corsi",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};
/*
function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;
    const adLogId = { adId: items_appelli.getItem(index).adId, appId: items_appelli.getItem(index).appId, docente: items_appelli.getItem(index).docente,
        esame: items_appelli.getItem(index).esame};

    mainView.showModal(modalViewModule, adLogId, false);

}

exports.onItemTap = onItemTap;
 */
function convertData(data){
    let day = data[0]+data[1];
    let month = data[3]+data[4];
    let year = data[6]+data[7]+data[8]+data[9];
    let hour = data[11]+data[12];
    let min = data[14]+data[15];

    let d = new Date(year,month-1,day,hour,min);

    return d;
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
