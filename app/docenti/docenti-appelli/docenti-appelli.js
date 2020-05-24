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
let items_appello;
let loading;
let num;

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

    loading.visibility = "visible";
    let exams = global.myExams;
    num = 0;

    items_appello.splice(0);
    for (let i=0; i<exams.length; i++){
        items_appello.push(
            {
                titolo: exams[i].nome,
                items: getAppelli(exams[i].adId,exams[i].cdsId)
            }
        );

        appelli_listview.refresh();

    }
    //page.set("items_appello",items_appello);
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
function getAppelli(adId,cdsId) {
    let myarray = [];

    httpModule.request({
        url: global.url + "students/checkAppello/" + cdsId +"/" + adId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        loading.visibility = "visible";
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
                        "adId": adId,
                        "appId": result[i].appId
                    };
                    num++;
                    appSettings.setNumber("appelloBadge",num);
                    myarray.push(items);
                    //appelli_listview.refresh();
                }
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
                        "adId": adId,
                        "appId": result[i].appId

                    };
                    myarray.push(items);
                    //appelli_listview.refresh();
                }
            }
            loading.visibility = "collapsed";
        }

    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore Server!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
    return myarray;
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
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};
exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "docenti/docenti-corsi/docenti-corsi",
            clearHistory: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: false
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
