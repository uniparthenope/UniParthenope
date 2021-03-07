const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
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

function drawTitle() {
    page.getViewById("aa").text = L('my_courses_aa') + appSettings.getString("aa_accad") + " - " + (parseInt(appSettings.getString("aa_accad"))+1);
    page.getViewById("sessione").text = appSettings.getString("sessione");
}

function getPrenotazioni(){
    loading.visibility = "visible";
    let result = global.myPrenotazioni;
    for (let i = 0; i<result.length; i++)
        items_appelli.push({
            "adId": result[i].adId,
            "appId": result[i].appId,
            "dataEsame": result[i].dataEsa,
            "classe": "examPass",
            "mese_app": result[i].desApp,
            "esame": result[i].nomeAppello,
            "docente": result[i].nome_pres + " "+ result[i].cognome_pres,
            "descrizione": result[i].tipoApp,
            "edificio": result[i].edificioDes,
            "aula": result[i].aulaDes,
            "iscritti": result[i].numIscritti,
            "note": result[i].note
        });
    loading.visibility = "collapsed";
    /*
        httpModule.request({
            url: global.url + "students/getReservations/" + matId,
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            const result = response.content.toJSON();
            appSettings.setNumber("appelloBadge", result.length);

            console.log(result);

            for (let i = 0; i<result.length; i++)
                items_appelli.push({
                    "adId": result[i].adId,
                    "appId": result[i].appId,
                    "dataEsame": result[i].dataEsa,
                    "classe": "examPass",
                    "mese_app": result[i].desApp,
                    "esame": result[i].nomeAppello,
                    "docente": result[i].nome_pres + " "+ result[i].cognome_pres,
                    "descrizione": result[i].tipoApp,
                    "edificio": result[i].edificioDes,
                    "aula": result[i].aulaDes,
                    "iscritti": result[i].numIscritti,
                    "note": result[i].note
                });

            global.getAllBadge(page);
            loading.visibility = "collapsed";
        },(e) => {
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "Errore: Prenotazioni getPrenotazioni",
                message: e.toString(),
                okButtonText: "OK"
            });
        });
     */
}

exports.onNavigatingTo = function(args) {
    page = args.object;
    page.getViewById("selected_col").col = "3";
    //appSettings.setBoolean("esami_futuri",false);
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    items_appelli = new ObservableArray();
    appelli_listview = page.getViewById("appelli_listview");
    loading = page.getViewById("activityIndicator");

    viewModel = Observable.fromObject({
        items_appelli: items_appelli
    });

    /*
    let prenotazione = global.myPrenotazioni;
    console.log(prenotazione);

    for (let i=0 ; i < prenotazione.length; i++){
        items_appelli.push({
            "adId": prenotazione[i].adId,
            "appId": prenotazione[i].appId,
            "dataEsame": prenotazione[i].dataEsa,
            "classe": "examPass",
            "mese_app": prenotazione[i].desApp,
            "esame": prenotazione[i].nomeAppello,
            "docente": prenotazione[i].nome_pres + " "+ prenotazione[i].cognome_pres,
            "descrizione": prenotazione[i].tipoApp,
            "edificio": prenotazione[i].edificioDes,
            "aula": prenotazione[i].aulaDes,
            "iscritti": prenotazione[i].numIscritti,
            "note": prenotazione[i].note
        })
    }
     */

    getPrenotazioni();

    global.getAllBadge(page);
    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onGeneralMenu = function () {
    const nav =
        {
            moduleName: "general/home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "studenti/userCalendar/userCalendar",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "studenti/corsi/corsi",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapLibretto = function(){
    const nav =
        {
            moduleName: "studenti/libretto/libretto",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.onItemTap = function(args) {
    const mainView = args.object;
    const index = args.index;

    console.log(items_appelli.getItem(index));

    let adId = items_appelli.getItem(index).adId;
    let appId = items_appelli.getItem(index).appId;

    console.log("AppId: " + items_appelli.getItem(index).appId);
    console.log("AdId: " + items_appelli.getItem(index).adId);

    dialogs.confirm({
        title: L('prenotazione_reservation'),
        message: L('prenotazione_reservation_text'),
        okButtonText: L('y'),
        cancelButtonText: L('n'),
    }).then(function (result) {
        console.log(result);

        if(result){
            httpModule.request({
                url : global.url_general + "/UniparthenopeApp/v1/students/deleteExam/" + appSettings.getNumber("cdsId") + "/" + adId + "/" + appId + "/" + appSettings.getNumber("stuId"),
                method : "DELETE",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                }
            }).then((response) => {
                const result = response.content.toJSON();
                console.log(result);

                if (response.statusCode === 200){
                    const x = global.myPrenotazioni.indexOf(index);
                    global.myPrenotazioni.splice(x,1);
                    appSettings.setNumber("appelloBadge", global.myPrenotazioni.length);

                    dialogs.confirm({
                        title: L('success'),
                        message: L('prenotazione_cancellation_text'),
                        okButtonText: "OK"
                    }).then(function (result) {
                        const nav =
                            {
                                moduleName: "prenotazioni/prenotazioni",
                                clearHistory: true
                            };
                        page.frame.navigate(nav);
                    });

                }

                else{
                    dialogs.alert({
                        title: L('lectures_error'),
                        message: result["errMsg"],
                        okButtonText: "OK"
                    });
                }

            }, error => {
                console.error(error);
                dialogs.alert({
                    title: L('lectures_error'),
                    message: error.toString(),
                    okButtonText: "OK"
                });
            });
        }
    });
}