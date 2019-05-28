const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");

const httpModule = require("tns-core-modules/http");
const appSettings = require("application-settings");

let page;
let viewModel;
let items;
let esamiList;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
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
    console.log(media);
    httpModule.request({
        url: global.url + "average/"+ global.encodedStr +"/" + matId +"/" + media,
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);
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
        url: global.url + "totalexams/"+ global.encodedStr +"/" + matId,
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);

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
            //console.log(result.numAdSuperate);
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
function getExams()
{
    let exams = global.myExams;
    console.log(exams);

    let dim = exams.length;
    for (let i = 0; i<dim; i++)
    {

        if (exams[i].superata === "Superata" && exams[i].superata === undefined)
        {
            let lode = "collapsed";
            let voto = "--";
            let data = "";

            if(exams[i].superata_lode === 1)
                lode = "visible";
            if(exams[i].superata_voto != null)
                voto = exams[i].superata_voto;
            if(exams[i].superata_data != null)
                data = exams[i].superata_data;

            items.push({ "esame": exams[i].nome,
                "voto" : voto,
                "cfu" :exams[i].CFU,
                "data" : data,
                "lode" : lode,
                "size" : size,
                "classe" : "examPass"
            });
            esamiList.refresh();
        }
        else if (exams[i].superata === "Frequentata"){
            items.push({ "esame": exams[i].nome,
                "cfu" :exams[i].CFU,
                "classe" : "examFreq"
            });
        }
    }
}
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.navigate("home/home-page")
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
