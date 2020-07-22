const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const modalViewModule = "modal-esame/modal-esame";
const platformModule = require("tns-core-modules/platform");

let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appello;
let loading;
let num;
let exams;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "2";
    //appSettings.setBoolean("esami_futuri",false);
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    items_appello = new ObservableArray();
    appelli_listview = page.getViewById("accordion");
    loading = page.getViewById("activityIndicator");

    viewModel = observableModule.fromObject({
        items_appello: items_appello
    });

    //loading.visibility = "visible";
    exams = global.myExams;
    num = 0;

    getAppelli();

    global.getAllBadge(page);
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

function getAppelli() {
    items_appello.slice(0);
    for (let i=0; i<exams.length; i++){
        let myarray = [];

        httpModule.request({
            url: global.url + "students/checkAppello/" + exams[i].cdsId +"/" + exams[i].adId,
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            const result = response.content.toJSON();
            loading.visibility = "visible";
            if (response.statusCode === 401 || response.statusCode === 500)
            {
                dialogs.alert({
                    title: "Errore Server!",
                    message: result,
                    okButtonText: "OK"

                }).then();
            }
            else {
                for (let i=0; i<result.length; i++) {
                    let day,year,month;
                    let final_data ="" + dayOfWeek(result[i].dataEsame) + " " + result[i].dataEsame.substring(0, 2)+ " " + monthOfYear(result[i].dataEsame) + " " + result[i].dataEsame.substring(6, 10);
                    day = result[i].dataEsame.substring(0, 2);
                    month = result[i].dataEsame.substring(3, 5);
                    year = result[i].dataEsame.substring(6, 10);
                    let date = new Date(year,month-1,day);


                    if (appSettings.getBoolean("esami_futuri") && result[i].stato === "I"){
                        let items = {
                            "esame": result[i].esame,
                            "descrizione": result[i].descrizione,
                            "note": result[i].note,
                            "dataEsame": final_data,
                            "dataInizio": result[i].dataInizio,
                            "dataFine": result[i].dataFine,
                            "iscritti": result[i].numIscritti,
                            "classe" : "examFreq",
                            "date" : date,
                            "adId": exams[i].adId,
                            "appId": result[i].appId,
                            "prenotazione_da": "Prenotazioni: da ",
                            "prenotazione_a": " a ",
                            "text_iscritti": "Iscritti: ",
                            "stato" : result[i].statoDes
                        };
                        myarray.push(items);
                        //appelli_listview.refresh();
                    }
                    else{

                            let items = {
                                "esame": result[i].esame,
                                "descrizione": result[i].descrizione,
                                "note": result[i].note,
                                "dataEsame": final_data,
                                "dataInizio": result[i].dataInizio,
                                "dataFine": result[i].dataFine,
                                "iscritti": result[i].numIscritti,
                                "classe" : "examPass",
                                "date" : date,
                                "adId": exams[i].adId,
                                "appId": result[i].appId,
                                "prenotazione_da": "Prenotazioni: da ",
                                "prenotazione_a": " a ",
                                "text_iscritti": "Iscritti: ",
                                "stato" : result[i].statoDes
                            };
                            num++;
                            appSettings.setNumber("appelloBadge",num);
                            myarray.push(items);
                            //appelli_listview.refresh();

                    }
                }

            }

            if (platformModule.isIOS){
                myarray.splice(0, 0, {});
            }

            items_appello.push({
                titolo: exams[i].nome,
                items: myarray
            });

            loading.visibility = "collapsed";
        },(e) => {
            console.log("Error", e);
            dialogs.alert({
                title: "Errore Server!",
                message: e,
                okButtonText: "OK"
            });
        });
    }
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
            moduleName: "docenti/docenti-home/docenti-home",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};
exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "docenti/docenti-corsi/docenti-corsi",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: true,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};
/*
function onItemTap(args) {
    const mainView = args.object;
    const index = args.index;
    const adLogId = { adId: items_appelli.getItem(index).adId, appId: items_appelli.getItem(index).appId, docente: items_appelli.getItem(index).docente,
        esame: items_appelli.getItem(index).esame};

    mainView.showModal(modalViewModule, adLogId, false);

}

exports.onItemTap = onItemTap;
 */

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
