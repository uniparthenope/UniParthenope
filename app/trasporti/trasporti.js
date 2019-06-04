const geoLocation = require("nativescript-geolocation");
const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({
        showLocation: function () {
            geoLocation.watchLocation(location => {
                this.currentGeoLocation = location;
            }, error => {
                alert(error);
            }, {
                desiredAccuracy: 3,
                updateDistance: 10,
                minimumUpdateTime: 1000 * 1
            });
        }, enableLocationServices: function () {
            geoLocation.isEnabled().then(enabled => {
                if (!enabled) {
                    geoLocation.enableLocationRequest().then(() => this.showLocation());
                } else {
                    this.showLocation();
                }
            });
        }, currentGeoLocation: null
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

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
