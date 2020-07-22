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
const platformModule = require("tns-core-modules/platform");

let page;
let viewModel;
let sideDrawer;
let items;
let grpDes = appSettings.getString("grpDes");

function onNavigatingTo(args) {
    page = args.object;

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    let bottom_bar = page.getViewById("bottom_bar");

    if (global.isConnected === false){
        bottom_bar.visibility = "collapsed";
    }
    else{
        global.getAllBadge(page);
        page.getViewById("selected_col").col = "3";
        bottom_bar.visibility = "visible";
    }


    items = new ObservableArray();
    viewModel = Observable.fromObject({
        items:items
    });
    let curr = new Date();
    let data = ""+ ("0" + curr.getDate()).slice(-2)+ ("0" + (curr.getMonth() + 1)).slice(-2) + curr.getFullYear();
    //console.log("CURR DATA = " + data);

    httpModule.request({
        url: global.url_general + "Eating/v1/getToday",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"
            }).then(
            );
        }
        else {
            for (let i=0; i<result.length; i++){
                console.log(result[i]["bar"]);
                let menu = result[i]["menu"];

                let temp_items = [];

                for (let j=0; j<menu.length; j++){


                    let img;
                    if (menu[j].image === "")
                        img = "~/images/no_food.png";
                    else
                        img = base64.fromBase64(menu[j].image);

                    temp_items.push({
                        nome: menu[j].nome,
                        descrizione: menu[j].descrizione,
                        prezzo: menu[j]["prezzo"] + " €",
                        tipologia: menu[j].tipologia,
                        image: img
                    })
                }

                if (platformModule.isIOS){
                    temp_items.splice(0, 0, {});
                }

                items.push({
                    nome_bar: result[i]["bar"],
                    items: temp_items
                });
            }
        }
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server Mensa!",
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

function onGeneralMenu() {
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};


exports.tapCourses = function(){
    if (grpDes === "Studenti"){
        const nav =
            {
                moduleName: "corsi/corsi",
                clearHistory: true,
                animated: false
            };
        page.frame.navigate(nav);
    }
    else if (grpDes === "Docenti")
    {
        const nav =
            {
                moduleName: "docenti/docenti-home/docenti-home",
                clearHistory: true,
                animated: false
            };
        page.frame.navigate(nav);
    }
};
exports.tapCalendar = function(){
    if (grpDes === "Studenti"){
        const nav =
            {
                moduleName: "userCalendar/userCalendar",
                clearHistory: true,
                animated: false
            };
        page.frame.navigate(nav);
    }
    else if (grpDes === "Docenti")
    {
        const nav =
            {
                moduleName: "docenti/docenti-home/docenti-home",
                clearHistory: false,
                animated: false
            };
        page.frame.navigate(nav);
    }
};

exports.tapAppello = function(){
    console.log(grpDes);
    if (grpDes === "Studenti"){
        const nav =
            {
                moduleName: "prenotazioni/prenotazioni",
                clearHistory: true,
                animated: false
            };
        page.frame.navigate(nav);
    }
    else if (grpDes === "Docenti")
    {
        const nav =
            {
                moduleName: "docenti/docenti-home/docenti-home",
                clearHistory: true,
                animated: false
            };
        page.frame.navigate(nav);
    }
 };
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
