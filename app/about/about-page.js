const observableModule = require("tns-core-modules/data/observable");
let appversion = require("nativescript-appversion");
var frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");

let sideDrawer;
let page;
let viewModel;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    appversion.getVersionName().then(function(v) {
        page.getViewById("version").text = "Versione " + v;
    });

    page.bindingContext = viewModel;
}

function onTapPrivacy(args) {
    var button = args.object;
    const page = button.page;

    page.frame.navigate("privacy/privacy-page");
}
exports.onTapPrivacy = onTapPrivacy;

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu() {
    page.frame.navigate("home/home-page");
}

exports.onDrawerButtonTap = onDrawerButtonTap;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
