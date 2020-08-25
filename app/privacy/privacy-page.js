const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const httpModule = require("tns-core-modules/http");

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
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"
            }).then(
                loading.visibility = "collapsed"
            );
        }
        else {
            console.log(result["privacy"]);
            loading.visibility = "collapsed";
            page.getViewById("privacy").html = result["privacy"];
        }

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server!",
            message: e,
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
