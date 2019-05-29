const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("http");
const appSettings = require("application-settings");


let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "0";
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    if (!global.updatedExam)
    {
        getMainInfo();
        myExams();
        getCourses();

        global.updatedExam = true;

    }
    global.getAllBadge(page);
    page.bindingContext = viewModel;
}
function myExams()
{
    let exams = {};
    const matId = appSettings.getNumber("matId");
    const stuId = appSettings.getNumber("stuId");
    getPianoId(stuId);
    const pianoId = appSettings.getNumber("pianoId");
    console.log("IN CONNESSIONE A = "+global.url + "exams/" + global.encodedStr + "/" + stuId + "/" + pianoId);

    httpModule.request({
        url: global.url + "exams/" + global.encodedStr + "/" + stuId + "/" + pianoId,
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
            let array = [];

            console.log(result.length);
            for (let i=0; i<result.length; i++)
            {
                httpModule.request({
                    url: global.url + "checkExam/" + global.encodedStr + "/" + matId + "/" + result[i].adsceId,
                    method: "GET",
                    headers: {"Content-Type": "application/json"}
                }).then((response) => {
                    const result_n = response.content.toJSON();
                    //console.log(result_n);

                    if (result_n.statusCode === 401 || result_n.statusCode === 500)
                    {
                        dialogs.alert({
                            title: "Errore Server!",
                            message: result_n.retErrMsg,
                            okButtonText: "OK"
                        }).then(
                        );
                    }
                    else {
                        exams.superata = result_n.stato;

                        global.myExams.push({
                            "nome" : result[i].nome,
                            "codice" : result[i].codice,
                            "annoId" : result[i].annoId,
                            "adsceId" : result[i].adsceId,
                            "adId" : result[i].adId,
                            "CFU" : result[i].CFU,
                            "superata" : result_n.stato,
                            "superata_data" : result_n.data,
                            "superata_voto" : result_n.voto,
                            "superata_lode" : result_n.lode
                        });
                    }
                },(e) => {
                    console.log("Error", e);
                    dialogs.alert({
                        title: "Errore Sincronizzazione Esami!",
                        message: e,
                        okButtonText: "OK"
                    });
                });
            }
        }

        },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server!",
            message: e,
            okButtonText: "OK"
        });
    });
}
function getPianoId(stuId)
{
    httpModule.request({
        url: global.url + "pianoId/" + global.encodedStr + "/" + stuId,
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
            appSettings.setNumber("pianoId", result.pianoId);
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
function getMainInfo()
{
    let cdsId = appSettings.getNumber("cdsId");

    httpModule.request({
        url: global.url + "current_aa/" + global.encodedStr + "/" + cdsId,
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
            appSettings.setString("aa_accad", result.aa_accad);
            appSettings.setString("sessione", result.curr_sem);
            appSettings.setString("semestre", result.semestre);
            //console.log("AA= "+ appSettings.getString("aa_accad"));
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
function getCourses() {
    const stuId = appSettings.getNumber("stuId");
    const matId = appSettings.getNumber("matId");
    getPianoId(stuId);
    httpModule.request({
        url: global.url + "examsToFreq/" + global.encodedStr + "/" + stuId + "/" + appSettings.getNumber("pianoId") +"/" + matId ,
        method: "GET",
        headers: {"Content-Type": "application/json"}
    }).then((response) => {
        const result = response.content.toJSON();
        console.log("QUIII");
        console.log(result);


        if (result.statusCode === 401 || result.statusCode === 500)
        {
            dialogs.alert({
                title: "Errore Server!",
                message: result_n.retErrMsg,
                okButtonText: "OK"
            }).then(
            );
        }
        else {
            for (let i=0; i<result.length; i++)
            {
                global.freqExams.push({
                    "nome" : result[i].nome,
                    "codice" : result[i].codice,
                    "annoId" : result[i].annoId,
                    "adsceId" : result[i].adsceId,
                    "adLogId" : result[i].adLogId,
                    "adId" : result[i].adId,
                    "CFU" : result[i].CFU,
                    "docente" : result[i].docente,
                    "docenteID" : result[i].docenteID,
                    "semestre" : result[i].semestre,
                    "inizio" : result[i].inizio,
                    "fine" : result[i].fine,
                    "modifica" : result[i].ultMod,
                    "orario" : []
                });
            }
        }
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Sincronizzazione Esami!",
            message: e,
            okButtonText: "OK"
        });
    });
    /*if (exams.superata === "Frequentata")
    {
        global.freqExams.push({
            "nome" : result[i].nome,
            "codice" : result[i].codice,
            "annoId" : result[i].annoId,
            "adsceId" : result[i].adsceId,
            "adId" : result[i].adId,
            "CFU" : result[i].CFU,
            "orario" : [],
            "semestre" : "",
            "prof" : ""
        });
    }*/
}
function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.navigate("home/home-page")
}
exports.tapCourses = function(){
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
