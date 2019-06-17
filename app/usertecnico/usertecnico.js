const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const textFieldModule = require("tns-core-modules/ui/text-field");
const httpModule = require("http");
const frame = require("tns-core-modules/ui/frame");


let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();




    page.bindingContext = viewModel;
}
function onTapSave() {

    let orario = page.getViewById("orario").text;
    //TODO inserire limitazioni orario
    let nome = page.getViewById("nome").text;
    let desc = page.getViewById("desc").text;
    let tipo = page.getViewById("tipo").text;
    let prezzo = page.getViewById("prezzo").text;
    let active = page.getViewById("alwaysActive").checked;


    dialogs.confirm({
        title: "Conferma",
        message: "Sicuro di voler pubblicare il menu?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        // result argument is boolean
        if (result && orario !== "")
        {

            fetch(global.url + "foods/addMenu/" + global.encodedStr, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nome,
                    descrizione: desc,
                    tipologia: tipo,
                    prezzo:prezzo,
                    attivo: active
                })
            }).then((r) => r.json())
                .then((response) => {
                    const result = response.json;
                    console.log(result);
                    dialogs.alert({
                        title: "Menu Caricato!",
                        message: "Il nuovo menu è stato caricato con successo!",
                        okButtonText: "OK"
                    }).then(function(){
                        /*const nav =
                            {
                                moduleName: "usertecnico-all/usertecnico-all",
                                clearHistory: true
                            };
                        frame.topmost().navigate(nav);*/
                    });
                }).catch((e) => {
            });
        }
        else if (orario === "")
            {
                dialogs.alert({
                    title: "Errore",
                    message: "Il campo ORARIO non può essere vuoto!",
                    okButtonText: "OK"
                }).then(
                );
            }
    });

}
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

exports.onTapSave = onTapSave;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
