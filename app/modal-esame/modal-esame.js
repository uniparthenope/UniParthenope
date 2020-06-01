const observableModule = require("tns-core-modules/data/observable");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
let closeCallback;

let items;
let prenotato;

function onShownModally(args) {
    const context = args.context;
    const appId = context.appId;
    const adId = context.adId;

    closeCallback = args.closeCallback;
    const page = args.object;
    page.bindingContext = observableModule.fromObject(context);
    items = new ObservableArray();
    let viewModel = Observable.fromObject({
        items:items
    });

    httpModule.request({
        url: global.url + "checkPrenotazione/" + global.encodedStr + "/" +  appSettings.getNumber("cdsId") + "/" + adId + "/" + appId + "/" +  appSettings.getNumber("stuId"),
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result.retErrMsg,
                okButtonText: "OK"
            }).then(
            );
        }
        else {
            console.log(result);
            page.getViewById("esame").text = context.esame;
            page.getViewById("docente").text = context.docente;
            prenotato = result.prenotato;
            if (prenotato){
                page.getViewById("prenotazione").text = "Prenotato il: ";
                page.getViewById("data").text = result.data;
                page.getViewById("prenotati").visibility = "collapsed";
                page.getViewById("disiscriviti").visibility = "visible";

            }
            else{
                page.getViewById("prenotati").visibility = "visible";
                page.getViewById("disiscriviti").visibility = "collapsed";
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

    page.bindingContext = viewModel;
}

exports.onTapPrenotati = function(){

    console.log("PRENOTATI");
};
exports.onTapDisiscriviti = function(){
    console.log("DISISCRIVITI");
};
exports.onShownModally = onShownModally;
