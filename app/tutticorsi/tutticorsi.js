const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");
const modalViewModule = "modal-corsi/modal-corsi";

let page;
let viewModel;
let sideDrawer;
let items;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    items = new ObservableArray();

    viewModel = Observable.fromObject({
        items:items
    });

    let exams = global.myExams;

    let anno = "";

    for (let i=0; i<exams.length; i++)
    {
        if(exams[i].annoId === 0)
            anno = "X";
        else
            anno = exams[i].annoId;

        items.push({
            esame: exams[i].nome,
            cfu: exams[i].CFU,
            adId: exams[i].adId,
            adsceId: exams[i].adsceId,
            annoOrd: exams[i].annoId,
            anno: anno
        });
        items.sort(function (orderA, orderB) {
            var nameA = orderA.annoOrd;
            var nameB = orderB.annoOrd;
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
        });
    }

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu() {
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
