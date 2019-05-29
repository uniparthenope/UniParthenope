const observableModule = require("tns-core-modules/data/observable");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
require("nativescript-accordion");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
let closeCallback;

let items;

function onShownModally(args) {
    const context = args.context;
    const adLogId = context.adLogId;

    closeCallback = args.closeCallback;
    const page = args.object;
    page.bindingContext = observableModule.fromObject(context);
    items = new ObservableArray();
    let viewModel = Observable.fromObject({
        items:items
    });

    httpModule.request({
        url: global.url + "infoCourse/" + adLogId ,
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();

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
            page.getViewById("esame").text = context.esame;
            page.getViewById("docente").text = context.docente;

            console.log(result.metodi);
            let array = ["Contenuti","Obiettivi","Prerequisiti","Verifica","Testi","Metodi","Altro"];
            let array_1 = ["contenuti","obiettivi","prerequisiti","verifica","testi","metodi","altro"];

            for (let i=0; i<array.length; i++)
            {
                items.push({
                    obiettivi: array[i],
                    items: [
                        {
                            desc: result[array_1[i]]
                        }
                    ]
                });
            }

            /*
            page.getViewById("contenuti").text = result.contenuti;
            page.getViewById("verifica").text = result.verifica;
            page.getViewById("obiettivi").text = result.obiettivi;
            page.getViewById("prerequisiti").text = result.prerequisiti;
            page.getViewById("testi").text = result.testi;
            page.getViewById("altro").text = result.altro;
            page.getViewById("metodi").text = result.metodi;
*/



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
exports.onShownModally = onShownModally;
