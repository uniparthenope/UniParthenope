const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const modalViewModule = "modal-esame/modal-esame";

let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appelli;
let loading;
let num;

function onNavigatingTo(args) {
    page = args.object;
    //appSettings.setBoolean("esami_futuri",false);
    viewModel = observableModule.fromObject({});
    loading = page.getViewById("activityIndicator");

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();
    items_appelli = new ObservableArray();
    appelli_listview = page.getViewById("appelli_listview");


    viewModel = Observable.fromObject({
        items_appelli: items_appelli
    });

    let exams = global.freqExams;
    num = 0;


    for (let i=0; i < exams.length; i++){
        getAppelli(exams[i].adId);
    }
    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function drawTitle() {
    page.getViewById("aa").text = "A.A. " + appSettings.getString("aa_accad");
    page.getViewById("sessione").text = appSettings.getString("sessione");
}

function onGeneralMenu(){
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

function getAppelli(adId) {
    loading.visibility = "visible";
    httpModule.request({
        url: global.url + "students/checkAppello/" + appSettings.getNumber("cdsId") +"/" + adId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
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
        else
        {
            for (let i=0; i<result.length; i++)
            {
                let day,year,month;
                let final_data ="" + dayOfWeek(result[i].dataEsame) + " " + result[i].dataEsame.substring(0, 2)+ " " + monthOfYear(result[i].dataEsame) + " " + result[i].dataEsame.substring(6, 10);
                day = result[i].dataEsame.substring(0, 2);
                month = result[i].dataEsame.substring(3, 5);
                year = result[i].dataEsame.substring(6, 10);
                let date = new Date(year,month-1,day);

                if (result[i].stato === "P")
                {
                    items_appelli.push({
                        "esame": result[i].esame,
                        "docente": result[i].docente_completo,
                        "descrizione": result[i].descrizione,
                        "note": result[i].note,
                        "dataEsame": final_data,
                        "dataInizio": result[i].dataInizio,
                        "dataFine": result[i].dataFine,
                        "iscritti": result[i].numIscritti,
                        "classe" : "examPass",
                        "date" : date,
                        "adId": adId,
                        "appId": result[i].appId
                    });
                    items_appelli.sort(function (orderA, orderB) {
                        let nameA = orderA.date;
                        let nameB = orderB.date;
                        return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                    });

                    appelli_listview.refresh();

                }
                if (appSettings.getBoolean("esami_futuri") && result[i].stato === "I"){

                    items_appelli.push({
                        "esame": result[i].esame,
                        "docente": result[i].docente_completo,
                        "descrizione": result[i].descrizione,
                        "note": result[i].note,
                        "dataEsame": final_data,
                        "dataInizio": result[i].dataInizio,
                        "dataFine": result[i].dataFine,
                        "iscritti": result[i].numIscritti,
                        "classe" : "examFreq",
                        "date" : date,
                        "adId": adId,
                        "appId": result[i].appId

                    });
                    items_appelli.sort(function (orderA, orderB) {
                        let nameA = orderA.classe;
                        let nameB = orderB.classe;
                        return (nameA > nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                    });
                    appelli_listview.refresh();
                }
                loading.visibility = "collapsed";

            }
        }
    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore Server!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });

}

function dayOfWeek(date) {
    let day = date.substring(0, 2);
    let month = date.substring(3, 5);
    let year = date.substring(6, 10);

    let dayOfWeek = new Date(year,month-1,day).getDay();
    return isNaN(dayOfWeek) ? null : ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][dayOfWeek];

}

function monthOfYear(date) {
    let month = parseInt(date.substring(3, 5)) - 1;
        return isNaN(month) ? null : ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"][month];

}



function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;
    const adLogId = { adId: items_appelli.getItem(index).adId, appId: items_appelli.getItem(index).appId, docente: items_appelli.getItem(index).docente,
        esame: items_appelli.getItem(index).esame};

    mainView.showModal(modalViewModule, adLogId, false);
}

exports.onItemTap = onItemTap;
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
