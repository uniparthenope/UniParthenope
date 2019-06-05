const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const frame = require("tns-core-modules/ui/frame");
require("nativescript-accordion");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
const appSettings = require("application-settings");

let page;
let viewModel;
let sideDrawer;
let items;

function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    global.getAllBadge(page);
    page.getViewById("selected_col").col = "3";

    items = new ObservableArray();
    viewModel = Observable.fromObject({
        items:items
    });
    let curr = new Date();
    let data = ""+ ("0" + curr.getDate()).slice(-2)+ ("0" + (curr.getMonth() + 1)).slice(-2) + curr.getFullYear();
    console.log("CURR DATA = " + data);

    httpModule.request({
        url: global.url + "foods/menuSearchData/" + data,
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);

        if (result.statusCode === 401 || result.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result.retErrMsg,
                okButtonText: "OK"
            }).then(
            );
        }
        else {
            let count =0;
            for (let i=0; i<result.length; i++)
            {
                count++;
                items.push({
                    nome_bar: result[i].nome,
                    apertura: "Orario Apertura Mensa: " + result[i].apertura,

                    items: [
                        {
                            primo_1: result[i].primo[0].piatto_1,
                            primo_2: result[i].primo[1].piatto_2,
                            primo_3: result[i].primo[2].piatto_3,
                            secondi_1: result[i].secondo[0].piatto_1,
                            secondi_2: result[i].secondo[1].piatto_2,
                            secondi_3: result[i].secondo[2].piatto_3,
                            contorni_1: result[i].contorno[0].piatto_1,
                            contorni_2: result[i].contorno[1].piatto_2,
                            contorni_3: result[i].contorno[2].piatto_3,
                            altro_1: result[i].altro[0].piatto_1,
                            altro_2: result[i].altro[1].piatto_2,
                            altro_3: result[i].altro[2].piatto_3
                        }
                    ]
                });

            }
            appSettings.setNumber("foodBadge",count);
        }
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Sincronizzazione Esami!",
            message: e,
            okButtonText: "OK"
        });
    });

    page.bindingContext = viewModel;
}

function getCurrentData() {
    let data = new Date();

    return "" + ("0" + data.getUTCDate()).slice(-2) + ("0" + (data.getUTCMonth() + 1)).slice(-2) + data.getUTCFullYear()
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}
exports.tapCourses = function(){
    const nav =
        {
            moduleName: "corsi/corsi",
            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.tapAppello = function(){
    const nav =
        {
            moduleName: "userAppelli/appelli",
            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
