const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const listViewModule = require("tns-core-modules/ui/list-view");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const fromObject = require("tns-core-modules/data/observable").fromObject;
const httpModule = require("tns-core-modules/http");
const frame = require("tns-core-modules/ui/frame");
const base64 = require("tns-core-modules/image-source");

let page;
let viewModel;
let sideDrawer;
let items;
let header_index = 0;


function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    items = new ObservableArray();

    viewModel = Observable.fromObject({
        items:items
    });
    page.bindingContext = viewModel;
    console.log(global.username);
    httpModule.request({
        url: global.url_general + "Eating/v1/getMenuBar",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore: Ristoratore-Home getMenuBar",
                message: result.errMsg,
                okButtonText: "OK"
            }).then();
        }
        else {
            console.log(result.length);
            for (let i=0; i<result.length; i++)
            {
                let classe = "textPrimary border ";

                let insert = "Sempre Attivo: ";
                if(result[i].sempre_attivo)
                    insert += "SI";
                else
                    insert += "NO";

                /*
                let prezzo = result[i].prezzo.toString();
                if(prezzo.includes(","))
                {
                    let pr = prezzo.split("."||",");
                    if (pr[1].length < 2)
                        prezzo = prezzo + "0";
                }

                 */

                let img;
                if (result[i].image === "")
                    img = "~/images/no_food.png";

                else
                    img = base64.ImageSource.fromBase64Sync(result[i].image);

                items.push({
                    nome: result[i].nome,
                    descrizione: "Descrizione: "+ result[i].descrizione,
                    prezzo: "Prezzo: "+ result[i].prezzo,
                    tipologia: "Tipo: "+result[i].tipologia,
                    sempre_att: insert,
                    full_data:"Inserito il: "+result[i].data,
                    id: result[i].id,
                    classe:classe,
                    image: img
                });
                items.sort(function (orderA, orderB) {
                    let nameA = orderA.full_data;
                    let nameB = orderB.full_data;
                    return (nameA > nameB) ? -1 : (nameA < nameB) ? 1 : 0;
                });
                page.getViewById("listview").refresh();

            }
        }
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Ristoratore-Home",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

}
//REMOVE FOOD
exports.tapped = function (args) {
    let ind = args.index;
    header_index = items.getItem(ind).id;

    dialogs.confirm({
        title: "Conferma",
        message: "Sicuro di voler eliminare l'oggetto?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        if (result)
        {
            httpModule.request({
                url: global.url_general + "Eating/v1/removeMenu/" + header_index,
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                }
            }).then((response) => {
                    if (response.statusCode === 200)
                    {
                        dialogs.alert({
                            title: "Menu Cancellato!",
                            message: "Il menu è stato cancellato con successo!",
                            okButtonText: "OK"
                        }).then(function () {
                            const nav =
                                {
                                    moduleName: "ristoratore/ristoratore-home",
                                    clearHistory: true
                                    };
                                frame.topmost().navigate(nav);
                        });
                    }
                    else {
                        dialogs.alert({
                            title: "Errore!",
                            message: "Il menu non è stato cancellato con successo!",
                            okButtonText: "OK"
                        });
                    }
            }).catch((e) => {
                    console.log(e);
            });
        }
    });
};
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
