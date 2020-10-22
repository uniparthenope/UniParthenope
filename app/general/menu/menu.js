const base64 = require("tns-core-modules/image-source");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
require("nativescript-accordion");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const platformModule = require("tns-core-modules/platform");

let page;
let viewModel;
let sideDrawer;
let items;

exports.onNavigatingTo = function(args) {
    page = args.object;

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    items = new ObservableArray();
    viewModel = Observable.fromObject({
        items:items
    });

    httpModule.request({
        url: global.url_general + "Eating/v1/getAllToday",
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        }
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore: Menu getToday!",
                message: result.errMsg,
                okButtonText: "OK"
            });
        }
        else{
            for (let i=0; i<result.length; i++){
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
                        prezzo: menu[j]["prezzo"],
                        tipologia: menu[j].tipologia,
                        image: img
                    })
                }

                if (platformModule.isIOS){
                    temp_items.splice(0, 0, {});
                }

                let img_bar;
                if (result[i]["info"]["image"] === "")
                    img_bar = "~/images/logo_new.png";
                else
                    img_bar = base64.fromBase64(result[i]["info"]["image"]);

                items.push({
                    nome_bar: result[i]["info"]["nome"],
                    email_bar: result[i]["info"]["email"],
                    luogo_bar: result[i]["info"]["luogo"],
                    tel_bar: result[i]["info"]["tel"],
                    image_bar: img_bar,
                    items: temp_items
                });
            }
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: Menu",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap= function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}