const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");

let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appelli;
let loading;
let num;

function drawTitle() {
    page.getViewById("aa").text = "A.A. " + appSettings.getString("aa_accad") + " - " + (parseInt(appSettings.getString("aa_accad"))+1);
    page.getViewById("sessione").text = appSettings.getString("sessione");
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

function getAppelli(adId, adsceId) {
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

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore: Appelli getAppelli",
                message: result.errMsg,
                okButtonText: "OK"

            }).then();
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
                console.log(final_data);

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
                        "classe" : "examPass",
                        "date" : date,
                        "adId": adId,
                        "appId": result[i].appId,
                        "adsceId": adsceId,
                        "stato" : result[i].statoDes,
                        "iscritti": result[i].numIscritti.toString()

                    });
                    items_appelli.sort(function (orderA, orderB) {
                        let nameA = orderA.date;
                        let nameB = orderB.date;
                        return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                    });

                }
                else if (appSettings.getBoolean("esami_futuri")){

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
                        "appId": result[i].appId,
                        "adsceId": adsceId,
                        "stato" : result[i].statoDes
                    });
                    items_appelli.sort(function (orderA, orderB) {
                        let nameA = orderA.classe;
                        let nameB = orderB.classe;
                        return (nameA > nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                    });
                }

                loading.visibility = "collapsed";
            }
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: Appelli",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

exports.onNavigatingTo = function(args) {
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

    let exams = global.myExams;
    num = 0;

    for (let i=0; i < exams.length; i++){
        if (exams[i].tipo === 'V')
            if (exams[i].esito === 'P')
                getAppelli(exams[i].adId, exams[i].adsceID);
    }
    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onItemTap = function(args) {
    const mainView = args.object;
    const index = args.index;

    let adsceId = items_appelli.getItem(index).adsceId;
    let adId = items_appelli.getItem(index).adId;
    let appId = items_appelli.getItem(index).appId;

    dialogs.confirm({
        title: "Prenotazione appello",
        message: "Sicuro di volerti prenotare a questo appello?",
        okButtonText: "Sì",
        cancelButtonText: "No",
    }).then(function (result) {

        if(result){
            httpModule.request({
                url : global.url_general + "/UniparthenopeApp/v1/students/bookExam/" + appSettings.getNumber("cdsId") + "/" + adId + "/" + appId,
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                },
                content : JSON.stringify({
                    adsceId : adsceId,
                    notaStu: ""
                })
            }).then((response) => {
                const result = response.content.toJSON();

                let message;
                if (response.statusCode === 201){
                    dialogs.confirm({
                        title: "Successo!",
                        message: "Prenotazione Effettuata",
                        okButtonText: "OK"
                    }).then(function (result) {
                        global.updatedExam = false;
                        const nav =
                            {
                                moduleName: "userCalendar/userCalendar",
                                clearHistory: true
                            };
                        page.frame.navigate(nav);
                    });

                }

                else{
                    dialogs.alert({
                        title: "Errore!",
                        message: result["errMsg"],
                        okButtonText: "OK"
                    });
                }


            }, error => {
                dialogs.alert({
                    title: "Errore: Appelli bookExam",
                    message: error.toString(),
                    okButtonText: "OK"
                });
            });
        }
    });

    /*
    const adLogId = { adId: items_appelli.getItem(index).adId, appId: items_appelli.getItem(index).appId, docente: items_appelli.getItem(index).docente,
        esame: items_appelli.getItem(index).esame};

    mainView.showModal(modalViewModule, adLogId, false);
     */
}
