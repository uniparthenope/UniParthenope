const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const listViewModule = require("tns-core-modules/ui/list-view");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("data/observable");
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

        url: global.url + "foods/menuSearchUser/" + global.username,
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
            console.log(result.length);
            for (let i=0; i<result.length; i++)
            {
                let classe = "textPrimary border ";

                let insert = "Sempre Attivo: ";
                if(result[i].sempre_attivo)
                    insert += "SI";
                else
                    insert += "NO";

                let prezzo = result[i].prezzo.toString();
                if(prezzo.includes(","))
                {
                    let pr = prezzo.split("."||",");
                    if (pr[1].length < 2)
                        prezzo = prezzo + "0";
                }

                let img;
                if (result[i].image === "")
                    img = "~/images/no_food.png";

                else
                    img = base64.fromBase64(result[i].image);

                items.push({
                    nome: result[i].nome,
                    descrizione: "Descrizione: "+ result[i].descrizione,
                    prezzo: "Prezzo: "+prezzo + " €",
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
            title: "Errore Sincronizzazione",
            message: e,
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
            fetch(global.url + "foods/removeMenu/" + global.encodedStr + "/" + header_index, {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }).then((r) => r.json())
                .then((response) => {
                    if (response.code === 200)
                    {
                        dialogs.alert({
                            title: "Menu Cancellato!",
                            message: "Il menu è stato cancellato con successo!",
                            okButtonText: "OK"
                        }).then(function () {
                            const nav =
                                {
                                    moduleName: "usertecnico-all/usertecnico-all",
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
                            }).then(function () {

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
