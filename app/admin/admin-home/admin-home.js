const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    getStatus();
    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}
function getStatus(){
    fetch(global.url + "status")
        .then((response) => response.json())
        .then((r) => {
            //console.log(r);
            page.getViewById("esse3").text = r.esse3;
            page.getViewById("ga").text = r.ga;
            page.getViewById("rss").text = r.rss;
            page.getViewById("esse3").color = r.esse3_color;
            page.getViewById("ga").color = r.ga_color;
            page.getViewById("rss").color = r.rss_color;
        }).catch((err) => {
    });
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
