const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const modalViewModule = "docenti/modal-studentiAppello/modal-studentiAppello";

let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appello;
let loading;

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

exports.onNavigatingTo = function (args) {
    page = args.object;
    page.getViewById("selected_col").col = "3";
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

exports.childTapped = function (args){
    const mainView = args.object;
    const index = args.index;
    const child_index = args.childIndex;

    let appello = items_appello.getItem(index).items[child_index]

    const option = {
        context: {data: appello.esame, cdsId: appello.cdsId, appId: appello.appId, adId: appello.adId },

        fullscreen: false
    };

    mainView.showModal(modalViewModule, option);
}

exports.onDrawerButtonTap = function () {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
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

exports.tapLezioni = function(){
    const nav =
        {
            moduleName: "docenti/docenti-lezioni/docenti-lezioni",

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

exports.onGeneralMenu = function () {
    const nav = {
        moduleName: "general/home/home-page",
        clearHistory: true
    };
    page.frame.navigate(nav);
}