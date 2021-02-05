const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");

let page;
let viewModel;
let sideDrawer;
let loading;
let calendar;


exports.onNavigatingTo = function (args) {
    page = args.object;
    viewModel = observableModule.fromObject({

    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");
    loading.visibility = "visible";
    getHistory();

    page.bindingContext = viewModel;
}

function getHistory(){
    let url = global.url_general + "Badges/v1/ScanHistory";
    console.log(url);
    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        console.log(result);


        loading.visibility = "collapsed";
    });
}