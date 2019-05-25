const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");


let page;
let viewModel;
let sideDrawer;
let prenotazioni_listview;
let items_prenotazioni;
let items_appelli;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "1";
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    items_prenotazioni = new ObservableArray();
    prenotazioni_listview = page.getViewById("prenotazioni_listview");

    viewModel = Observable.fromObject({
        items_prenotazioni: items_prenotazioni,
        items_appelli: items_appelli
    });
    let matId = appSettings.getNumber("matId");
    getPrenotazioni(matId);

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

exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: true
        };
    frame.topmost().navigate(nav);
};

function getPrenotazioni(matId)
{
    let url = "https://uniparthenope.esse3.cineca.it/e3rest/api/calesa-service-v1/appelli?matId="+ matId;

    httpModule.request({
        url: url,
        method: "GET",
        headers: {"Content-Type": "application/json",
            "Authorization":"Basic "+ global.encodedStr}
    }).then((response) => {
        const result = response.content.toJSON();
        console.log(result);

        if (result.statusCode === 401 || result.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result.retErrMsg,
                okButtonText: "OK"
            }).then(
            );
        }
        else
        {
            let dim = result.length;
            for (let i = 0; i<dim; i++)
            {
                items_prenotazioni.push({ "title_app": result[i].adDes
                    });
                prenotazioni_listview.refresh();
            }
        }

    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore Server!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
