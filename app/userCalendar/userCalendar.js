const observableModule = require("tns-core-modules/data/observable");
const Observable = require("data/observable").Observable;
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("http");
const appSettings = require("application-settings");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");
const modalViewModule = "modal-event/modal-event";

let colors = ["#c47340","#4566c1","#824bc1","#a32d13","#382603","#fff766"];
let page;
let viewModel;
let sideDrawer;
let calendar;

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "0";
    viewModel = new Observable();
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    calendar = page.getViewById("myCalendar");
    console.log("UPDATED= "+global.updatedExam);

    if (!global.updatedExam)
    {
        page.getViewById("activityIndicator").visibility = "visible";
        getMainInfo();
        myExams();
        getCourses();
    }
    else {
        calendarCourses();
    }

    global.getAllBadge(page);

    page.bindingContext = viewModel;
}
function calendarCourses() {
    console.log(global.freqExams.length);
    global.events = [];

    let esami = global.freqExams;


    for (let i = 0; i<esami.length; i++)
    {
        let esame = esami[i].nome;
        let docente = esami[i].docente.split(" ");
        const periodo = appSettings.getNumber("periodo",3);
        const corso = "AB"; //TODO modificare da server IDCORSO!
        const color = new Color.Color(colors[i]);

        httpModule.request({
            url: global.url + "orari/cercaCorso/" + esame.toUpperCase() + "/" + docente[0].toUpperCase() + "/" + corso +"/" + periodo ,
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then((response) => {
            const result = response.content.toJSON();
            //console.log(result);


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
                for (let x = 0; x < result.length; x++) {
                    let data_inizio = new Date(result[x].inizio);
                    let data_fine = new Date(result[x].fine);
                    let title = esame + "\n" + esami[i].docente + "\n\n" + result[x].aula;
                    global.events.push({
                        title : title,
                        data_inizio: data_inizio,
                        data_fine:data_fine,
                        color: color
                    });
                }
                insert_event();

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


function insert_event() {
    console.log("EVENT INSERT");
    let temp_array = [];
    let temp = global.events;

    for (let x=0; x<temp.length; x++){
        let event = new calendarModule.CalendarEvent(temp[x].title, temp[x].data_inizio, temp[x].data_fine, false, temp[x].color);
        temp_array.push(event);
    }
    calendar.eventSource = temp_array;
}

function myExams() {
    let exams = {};
    const matId = appSettings.getNumber("matId");
    const stuId = appSettings.getNumber("stuId");

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

        let pianoId = appSettings.getNumber("pianoId");

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


function getCourses()
{
    const stuId = appSettings.getNumber("stuId");
    const matId = appSettings.getNumber("matId");

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

        let pianoId = appSettings.getNumber("pianoId");

        httpModule.request({
            url: global.url + "examsToFreq/" + global.encodedStr + "/" + stuId + "/" + appSettings.getNumber("pianoId") +"/" + matId ,
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then((response) => {
            const result = response.content.toJSON();
            //console.log(result);
            page.getViewById("activityIndicator").visibility = "visible";


            if (result.statusCode === 401 || result.statusCode === 500)
            {
                dialogs.alert({
                    title: "Errore Server!",
                    message: result_n.retErrMsg,
                    okButtonText: "OK"
                }).then(
                );
                page.getViewById("activityIndicator").visibility = "collapsed";
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
                page.getViewById("activityIndicator").visibility = "collapsed";
                calendarCourses();
                global.updatedExam = true;

            }
        },(e) => {
            console.log("Error", e);
            dialogs.alert({
                title: "Errore Sincronizzazione Esami!",
                message: e,
                okButtonText: "OK"
            });
            page.getViewById("activityIndicator").visibility = "collapsed";
        });

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
exports.tapAppello = function(){
    const nav =
        {
            moduleName: "userAppelli/appelli",
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
exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",

            clearHistory: true
        };
    frame.topmost().navigate(nav);
};
exports.onDaySelected = function(args){
    console.log(args.eventData);
    const mainView = args.object;

    const context = { title: args.eventData.title, start_date: args.eventData.startDate, end_date: args.eventData.endDate, color: args.eventData.eventColor};

    mainView.showModal(modalViewModule, context, false);
};
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
