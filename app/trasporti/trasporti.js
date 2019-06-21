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

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
