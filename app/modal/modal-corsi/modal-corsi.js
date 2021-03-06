const observableModule = require("tns-core-modules/data/observable");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
require("nativescript-accordion");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const platformModule = require("tns-core-modules/platform");

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
    //console.log("adLOGID= "+ adLogId);
    httpModule.request({
        url: global.url + "general/infoCourse/" + adLogId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore: Modal-Corsi infoCourse",
                message: result.errMsg,
                okButtonText: "OK"
            }).then(
            );
        }
        else {
            page.getViewById("esame").text = context.esame;
            page.getViewById("docente").text = context.docente;

            //console.log(result.metodi);
            let array = [L('cont'),L('obj'),L('prereq'),L('verif'),L('testi'),L('metod'),L('altro')];
            let array_1 = ["contenuti","obiettivi","prerequisiti","verifica","testi","metodi","altro"];

            for (let i=0; i<array.length; i++)
            {
                let arr_desc = [];
                let _items = {
                    desc: result[array_1[i]]
                };

                arr_desc.push(_items);

                if (platformModule.isIOS){
                    arr_desc.splice(0, 0, {});
                }

                items.push({
                    obiettivi: array[i],
                    items: arr_desc
                });

            }

        }
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Modal-Corsi",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

    page.bindingContext = viewModel;
}
exports.onShownModally = onShownModally;
