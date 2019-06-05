const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const modalViewModule = "modal-corsi/modal-corsi";
const appSettings = require("application-settings");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
const frame = require("tns-core-modules/ui/frame");


let page;
let sideDrawer;
let items;
let esamiList;

function onNavigatingTo(args) {
    page = args.object;
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    page.getViewById("selected_col").col = "1";

    items = new ObservableArray();
    esamiList = page.getViewById("listview");
    let viewModel = Observable.fromObject({
        items:items
    });

    getCourses();
    appSettings.setNumber("examsBadge",global.freqExams.length);
    global.getAllBadge(page);
    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function getCourses()
{
    let courses = global.freqExams;
    const act_sem = appSettings.getString("semestre");
    for (let i=0; i<courses.length; i++)
    {
        if (act_sem == "Secondo Semestre" && courses[i].semestre == "S2")
        {
            items.push({ "anno": drawYear(courses[i].annoId),
                "esame": courses[i].nome,
                "prof": courses[i].docente,
                "data_inizio": "Dal " + courses[i].inizio,
                "data_fine": " al " + courses[i].fine,
                "ult_mod": courses[i].modifica
            });
            esamiList.refresh();
        }
        else if (act_sem == "Primo Semestre" && courses[i].semestre == "S1")
        {
            items.push({ "anno": drawYear(courses[i].annoId),
                "esame": courses[i].nome,
                "prof": courses[i].docente,
                "data_inizio": "Dal " + courses[i].inizio,
                "data_fine": " al " + courses[i].fine,
                "ult_mod": courses[i].modifica
            });
            esamiList.refresh();
        }
    }

}
function drawYear(year)
{
    if (year == 1)
        return "I";
    else if (year == 2)
        return "II";
    else if (year == 3)
        return "III";
    else
        return "SCE";
}
function onGeneralMenu()
{
    page.frame.goBack();

}
function onItemTap(args) {
    let courses = global.freqExams;
    const mainView = args.object;
    const index = args.index;
    const adLogId = { adLogId: courses[index].adLogId, esame: courses[index].nome, docente:courses[index].docente};

    mainView.showModal(modalViewModule, adLogId, false);

}
exports.onItemTap = onItemTap;

function drawTitle() {
    page.getViewById("aa").text = "A.A. " + appSettings.getString("aa_accad");
    page.getViewById("semestre").text = appSettings.getString("semestre");
}

exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

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
exports.tapCalendar = function(){
    const nav =
        {
            moduleName: "userCalendar/userCalendar",

            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
