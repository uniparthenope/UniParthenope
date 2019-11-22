const base64 = require("tns-core-modules/image-source");
const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const frame = require("tns-core-modules/ui/frame");
require("nativescript-accordion");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const appSettings = require("tns-core-modules/application-settings");

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
    //console.log("CURR DATA = " + data);

    httpModule.request({
        url: global.url + "foods/getAllNames",
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
                let temp_items =[];
                count++;

                httpModule.request({
                    url: global.url + "foods/getAllToday",
                    method: "GET",
                    headers: {"Content-Type": "application/json"}
                }).then((response) => {
                    const result_2 = response.content.toJSON();
                    if (result_2.statusCode === 401 || result_2.statusCode === 500)
                    {
                        dialogs.alert({
                            title: "Errore Server!",
                            message: result_2.retErrMsg,
                            okButtonText: "OK"
                        }).then(
                        );
                    }
                    else {
                        console.log("Size: "+ result_2.length);
                        for (let x=0; x<result_2.length; x++)
                        {
                            if(result[i] === result_2[x].nome_bar)
                            {

                                let prezzo = result_2[x].prezzo.toString();
                                if(prezzo.includes(","))
                                {
                                    let pr = prezzo.split("."||",");
                                    if (pr[1].length < 2)
                                        prezzo = prezzo + "0";
                                }

                                let img;
                                if (result_2[x].image === "")
                                    img = "~/images/no_food.png";
                                else
                                    img = base64.fromBase64(result_2[x].image);

                                temp_items.push({
                                    nome: result_2[x].nome,
                                    descrizione: result_2[x].descrizione,
                                    prezzo: prezzo + " €",
                                    tipologia: result_2[x].tipologia,
                                    image: img
                                })

                            }
                        }
                    }
                },(e) => {
                    console.log("Error", e);
                    dialogs.alert({
                        title: "Errore Sincronizzazione Esami!",
                        message: e,
                        okButtonText: "OK"
                    });
                });

                items.push({
                    nome_bar: result[i],

                    items: temp_items
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
exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
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
