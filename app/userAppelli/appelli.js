const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");


let page;
let viewModel;
let sideDrawer;
let appelli_listview;
let items_appelli;
let loading;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "2";
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

    loading.visibility = "visible";
    let exams = global.freqExams;
    for (let i=0; i<exams.length; i++)
        getAppelli(exams[i].adId);
    appSettings.setNumber("appelloBadge",global.tempNum);
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
function onGeneralMenu()
{
    page.frame.goBack();
}

exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",
            clearHistory: true
        };
    frame.topmost().navigate(nav);
};

function getAppelli(adId) {
    let num = 0;
    httpModule.request({
        url: global.url + "checkAppello/"+ global.encodedStr +"/" + appSettings.getNumber("cdsId") +"/" + adId,
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
        else
        {
            for (let i=0; i<result.length; i++)
            {
                let classe;
                if (result[i].stato === "P")
                {
                    ++num;
                    classe = "examPass";
                }
                else
                    classe = "examFreq";


                let day,year,month;
                let final_data ="" + dayOfWeek(result[i].dataEsame) + " " + result[i].dataEsame.substring(0, 2)+ " " + monthOfYear(result[i].dataEsame) + " " + result[i].dataEsame.substring(6, 10);
                day = result[i].dataEsame.substring(0, 2);
                month = result[i].dataEsame.substring(3, 5);
                year = result[i].dataEsame.substring(6, 10);
                let date = new Date(year,month-1,day);

                items_appelli.push({
                    "esame": result[i].esame,
                    "docente": result[i].docente_completo,
                    "descrizione": result[i].descrizione,
                    "note": result[i].note,
                    "dataEsame": final_data,
                    "dataInizio": result[i].dataInizio,
                    "dataFine": result[i].dataFine,
                    "iscritti": result[i].numIscritti,
                    "classe" : classe,
                    "date" : date
                });
                items_appelli.sort(function (orderA, orderB) {
                    var nameA = orderA.date;
                    var nameB = orderB.date;
                    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
                });
                appelli_listview.refresh();
            }
            global.tempNum = num;
        }

        loading.visibility = "collapsed";

    },(e) => {
        console.log("Error", e.retErrMsg);
        dialogs.alert({
            title: "Errore Server!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });

 console.log(global.tempNum);
}

function dayOfWeek(date) {
    let day = date.substring(0, 2);
    let month = date.substring(3, 5);
    let year = date.substring(6, 10);

    let dayOfWeek = new Date(year,month-1,day).getDay();
    return isNaN(dayOfWeek) ? null : ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][dayOfWeek];

};

function monthOfYear(date) {
    let month = parseInt(date.substring(3, 5)) - 1;
        return isNaN(month) ? null : ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"][month];

};
exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.tapCourses = function(){
    const nav =
        {
            moduleName: "corsi/corsi",

            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.tapAppello = function(){
    const nav =
        {
            moduleName: "userAppelli/appelli",

            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
