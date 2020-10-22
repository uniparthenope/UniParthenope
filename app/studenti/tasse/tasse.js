const Observable = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");

let page;
let sideDrawer;
let items;
let taxList;
let loading;

function getTaxes() {
    loading.visibility = "visible";
    const persId = appSettings.getNumber("persId");
    httpModule.request({
        url: global.url + "students/taxes/" + persId,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + global.encodedStr
        }
    }).then((response) => {
        let _response = response.content.toJSON();
        //console.log(_response);
        if (response.statusCode === 200) {


            if (_response["semaforo"] === "GIALLO"){
                page.getViewById("title").text = "Da Pagare";
                page.getViewById("background_title").backgroundColor = "orange";
            }
            else if (_response["semaforo"] === "ROSSO"){
                page.getViewById("title").text = "Scadute";
                page.getViewById("background_title").backgroundColor = "red";
            }
            else {
                page.getViewById("title").text = "Regolare";
                page.getViewById("background_title").backgroundColor = "green";
            }

            let cod;
            for (let i=0; i<_response["to_pay"].length; i++) {
                items.push({
                    "data": _response["to_pay"][i].scadFattura,
                    "desc": _response["to_pay"][i].desc,
                    "importo":  _response["to_pay"][i].importo,
                    "fatt_id": "Cod.Fattura " + _response["to_pay"][i].fattId,
                    "iur_iuv": "IUV " + _response["to_pay"][i].iuv,
                    "col": "color-yellow"
                });
                taxList.refresh();
            }
            for (let i=0; i<_response["payed"].length; i++) {
                if (_response["payed"][i].iur === null)
                    cod = "N.Bollettino " + _response["payed"][i].nBollettino;
                else
                    cod = "IUR " + _response["payed"][i].iur;

                items.push({
                    "data": _response["payed"][i].dataPagamento,
                    "desc": _response["payed"][i].desc,
                    "importo": _response["payed"][i].importo,
                    "fatt_id": "Cod.Fattura " + _response["payed"][i].fattId,
                    "iur_iuv": cod,
                    "col": "color-grey"
                });
                taxList.refresh();
            }
            loading.visibility = "collapsed";
        } else {
            dialogs.alert({
                title: "Errore: Tasse getTaxes",
                message: _response['errMsg'],
                okButtonText: "OK"
            });
            loading.visibility = "collapsed";
        }

    }, (e) => {
        dialogs.alert({
            title: "Errore: Tasse",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

exports.onNavigatingTo = function(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    loading = page.getViewById("activityIndicator");

    items = new ObservableArray();
    taxList = page.getViewById("listview");

    let viewModel = Observable.fromObject({
        items:items
    });

    getTaxes();

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}