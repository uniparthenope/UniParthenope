const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const platform = require("tns-core-modules/platform");
const httpModule = require("tns-core-modules/http");
const dialogs = require("tns-core-modules/ui/dialogs");

let sideDrawer;
let page;
let viewModel;
let loading;

function onNavigatingTo(args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    loading = page.getViewById("activityIndicator");

    httpModule.request({
        url: global.url + "general/privacy",
        method: "GET"
    }).then((response) => {
        loading.visibility = "visible";

        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore: Privacy-Page",
                message: result.errMsg,
                okButtonText: "OK"
            }).then(
                loading.visibility = "collapsed"
            );
        }
        else {
            console.log(result["privacy"]);
            loading.visibility = "collapsed";
            page.getViewById("privacy").html = result["privacy"];

            if(platform.isIOS)
                page.getViewById("privacy").requestLayout();
        }

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Privacy-Page",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

    page.bindingContext = viewModel;
}

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
