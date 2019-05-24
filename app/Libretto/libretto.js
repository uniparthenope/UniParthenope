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
    getExams(matId);
    getTotExams(matId);
    getMedie(matId);

    page.bindingContext = viewModel;
}
function getMedie(matId) {
    let url = "https://uniparthenope.esse3.cineca.it/e3rest/api/libretto-service-v1/libretti/"+ matId +"/medie";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {"Content-Type": "application/json",
            "Authorization":"Basic "+ global.encodedStr}
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
            let media = appSettings.getString("tipoMedia","P");
            for (let i=0; i<result.length; i++)
            {
                if (result[i].tipoMediaCod.value === media)
                {
                    if (result[i].base === 30)
                    {
                        page.getViewById("medExam").text = result[i].media;
                        page.getViewById("medExam_tot").text = " /"+result[i].base;
                    }
                    if (result[i].base === 110)
                    {
                        page.getViewById("medPond").text = result[i].media;
                        page.getViewById("medPond_tot").text =" /"+ result[i].base;
                    }
                }
            }
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
    let url = "https://uniparthenope.esse3.cineca.it/e3rest/api/libretto-service-v1/libretti/"+ matId +"/stats";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {"Content-Type": "application/json",
            "Authorization":"Basic "+ global.encodedStr}
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
            console.log(result.numAdSuperate);
            page.getViewById("doneExams").text = result.numAdSuperate;
            let tot = result.numAdSuperate + result.numAdFrequentate;
            page.getViewById("totExams").text = "/"+ (tot);

            page.getViewById("cfuPar").text = result.umPesoSuperato;
            page.getViewById("cfuTot").text = " /"+ result.umPesoPiano;
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
function getExams(matId)
{
    let url = "https://uniparthenope.esse3.cineca.it/e3rest/api/calesa-service-v1/prenotazioni/"+ matId +"/";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {"Content-Type": "application/json",
            "Authorization":"Basic "+ global.encodedStr}
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
            let dim = result.length;
            console.log(dim);
            for (let i = 0; i<dim; i++)
            {
                if (result[i].esito.superatoFlg === 1)
                {
                    let lode = "collapsed";
                    let voto = result[i].esito.votoEsa;
                    let size = 26;

                    if (voto === null)
                        {
                            voto = result[i].esito.tipoGiudCod;
                            size = 20;
                        }

                    if (result[i].esito.votoEsa === 31)
                        lode = "visible";
                    //console.log(result[i].adStuCod);
                    items.push({ "esame": result[i].adStuCod,
                        "voto" : voto,
                        "cfu" :result[i].pesoAd,
                        "data" : result[i].dataIns,
                        "lode" : lode,
                        "size" : size
                    });
                    esamiList.refresh();
                }
            }
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
