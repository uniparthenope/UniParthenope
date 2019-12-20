const observableModule = require("tns-core-modules/data/observable");
let appversion = require("nativescript-appversion");
var frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");

let sideDrawer;
let page;
let viewModel;
let info;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    appversion.getVersionName().then(function(v) {
        page.getViewById("version").text = "Versione "+v;
    });

    page.bindingContext = viewModel;
}

const Button = require("tns-core-modules/ui/button").Button;
const Page = require("tns-core-modules/ui/page").Page;

function onTapCopy(args) {
    var button = args.object;
    const page = button.page;

    //page.frame.navigate("copyrights/copyrights-page");
}

exports.onTapCopy = onTapCopy;

function onTapDisclaimer(args) {
    var button = args.object;
    const page = button.page;

    //page.frame.navigate("disclaimer/disclaimer-page");
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu() {
    page.frame.goBack();
}

exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onGeneralMenu = onGeneralMenu;
exports.onTapDisclaimer = onTapDisclaimer;
exports.onNavigatingTo = onNavigatingTo;
