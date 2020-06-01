const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const Observable = require("tns-core-modules/data/observable");

const httpModule = require("tns-core-modules/http");
const appSettings = require("tns-core-modules/application-settings");

let page;
let viewModel;
let items;
let esamiList;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    drawTitle();

    items = new ObservableArray();
    esamiList = page.getViewById("listview");
    const sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    viewModel = Observable.fromObject({
        items:items
    });
    let matId = appSettings.getNumber("matId");

    getTotExams(matId);
    getMedie(matId);

    getExams();

    page.bindingContext = viewModel;
}

function getMedie(matId) {
    let media = appSettings.getString("tipoMedia","P");
    console.log("Media: " + media);
    httpModule.request({
        url: global.url + "students/average/" + matId +"/" + media,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);
        if (response.statusCode === 401 || response.statusCode === 500)
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
            page.getViewById("medExam").text = result.trenta;
            page.getViewById("medExam_tot").text = " /"+result.base_trenta;
            page.getViewById("medPond").text = result.centodieci;
            page.getViewById("medPond_tot").text =" /"+ result.base_centodieci;
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

function getTotExams(matId) {

    httpModule.request({
        url: global.url + "students/totalExams/" + matId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500)
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
            page.getViewById("doneExams").text = result.numAdSuperate;
            page.getViewById("totExams").text = "/"+ result.totAdSuperate;

            page.getViewById("cfuPar").text = result.cfuPar;
            page.getViewById("cfuTot").text = " /"+ result.cfuTot;
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

function getExams() {
    let exams = global.myExams;
    console.log(exams);

    let dim = exams.length;
    console.log(dim);

    for (let i = 0; i<dim; i++)
    {
        console.log(exams[i].nome);
        console.log(exams[i].superata);
        console.log(exams[i].superata_voto);
        //console.log(exams[i].superata_lode);

        let lode = "collapsed";
        let voto = "?";
        let data = "";

        if (exams[i].superata === "Superata" || exams[i].superata === "Indefinito" )
        {
            if(exams[i].superata_lode === 1)
                lode = "visible";
            if(exams[i].superata_voto != null)
                voto = exams[i].superata_voto;
            else
                voto = "OK";
            if(exams[i].superata_data != null)
                data = exams[i].superata_data;

            items.push({ "esame": exams[i].nome,
                "voto" : voto,
                "cfu" :exams[i].CFU,
                "data" : data,
                "lode" : lode,
                "classe" : "examPass"
            });
            esamiList.refresh();
        }
        else if (exams[i].superata === "Frequentata"){
            items.push({ "esame": exams[i].nome,
                "cfu" :exams[i].CFU,
                "classe" : "examFreq",
                "voto" : voto,
                "data" : data,
                "lode" : lode
            });
        }
        else {
            //TODO Da controllare con account che non ha esami!
            items.push({ "esame": exams[i].nome,
                "voto" : voto,
                "cfu" :exams[i].CFU,
                "data" : data,
                "lode" : lode,
                "classe" : "examNA"
            });
        }
        items.sort(function (orderA, orderB) {
            var nameA = orderA.esame;
            var nameB = orderB.esame;
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
        });
    }
}

function drawTitle() {
    page.getViewById("cdsDes").text ="CdS in "+ appSettings.getString("cdsDes");
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
