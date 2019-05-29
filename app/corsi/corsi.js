const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("application-settings");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");

let page;
let viewModel;
let sideDrawer;
let items;
let esamiList;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    drawTitle();

    items = new ObservableArray();
    esamiList = page.getViewById("listview");
    viewModel = Observable.fromObject({
        items:items
    });

    getExams();
    page.bindingContext = viewModel;
}
function getExams() {
    let exams = global.freqExams;
    console.log(exams);
    for (let i=0; i<exams.length; i++)
    {
        console.log(exams[i].annoId);
        //TODO continuare...
    }
}
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();

}

function drawTitle() {
    page.getViewById("aa").text = "A.A. " + appSettings.getString("aa_accad");
    page.getViewById("semestre").text = appSettings.getString("semestre");
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
