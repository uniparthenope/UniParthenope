const observableModule = require("tns-core-modules/data/observable");
const Observable = require("tns-core-modules/data/observable").Observable;
const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("http");
const appSettings = require("tns-core-modules/application-settings");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");
const modalViewModule = "modal-event/modal-event";

let colors = ["#c47340","#4566c1","#824bc1","#a32d13","#382603","#fff766"];
let page;
let viewModel;
let sideDrawer;
let calendar;
let result;

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

        getCourses();
    }
    else {
        updateSession();
        //calendarCourses();
    }

    global.getAllBadge(page);

    page.bindingContext = viewModel;
}

function calendarCourses() {
    //console.log(global.freqExams.length);
    global.events = [];

    let esami = global.freqExams;

    for (let i = 0; i<esami.length; i++)
    {
        let esame = esami[i].nome;
        let docente = esami[i].docente.split(" ");
        const periodo = appSettings.getNumber("periodo",3);
        const corso = "AC"; //TODO modificare da server IDCORSO!
        const color = new Color.Color(colors[i]);

        //console.log("Esame: " + esame.toUpperCase());
        //console.log("Docente: " + docente[0].toUpperCase());

        httpModule.request({
            url: global.url_general + "GAUniparthenope/v1/searchCourse/" + esame.toUpperCase() + "/" + docente[0].toUpperCase() + "/" + corso +"/" + periodo,
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            result = response.content.toJSON();
            //console.log("Calendario: " + result);


            if (response.statusCode === 401 || response.statusCode === 500)
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
function getCourses() {
    console.log(global.url + "professor/getSession");

    httpModule.request({
        url: global.url + "professor/getSession",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        console.log(response.statusCode);

        if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403)
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
            //console.log(result.aaId);
            //console.log(global.url + "docenti/getCourses/" + global.encodedStr + "/" + global.authToken +"/"+ result);
            page.getViewById("aa").text = "A.A " + result.aa_curr;
            if (result.semId === 1)
                page.getViewById("semestre").text = "Primo Semestre";
            else
                page.getViewById("semestre").text = "Secondo Semestre";
            page.getViewById("sessione").text = result.semDes;
            //updateSession();

            appSettings.setString("aaId", result.aaId.toString());
            appSettings.setString("aa_accad", result.aa_curr);
            appSettings.setString("sessione", result.semDes.toString());
            appSettings.setString("semestre", result.semId.toString());

            //console.log("AA= "+ appSettings.getString("aa_accad"));
            //console.log("Semestre= "+ appSettings.getString("semestre"));

            httpModule.request({
                url: global.url + "professor/getCourses/" + result.aaId.toString(),
                method: "GET",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                }
            }).then((response2) => {
                const result2 = response2.content.toJSON();
                //console.log(result2);
                if (response2.statusCode === 401 || response2.statusCode === 500 || response2.statusCode === 403)
                {
                    dialogs.alert({
                        title: "Errore Server!",
                        message: result2.retErrMsg,
                        okButtonText: "OK"
                    }).then(
                    );
                }
                else
                {
                    for(let i=0; i< result2.length; i++){

                        global.myExams.push({
                            "nome": result2[i].adDes,
                            "cdsDes": result2[i].cdDes,
                            "cdsId": result2[i].cdsId,
                            "adDefAppCod": result2[i].adDefAppCod,
                            "adId": result2[i].adId,
                            "cfu": result2[i].cfu,
                            "durata": result2[i].durata,
                            "obbligatoria": result2[i].obbligatoria,
                            "libera": result2[i].libera,
                            "tipo": result2[i].tipo,
                            "settCod": result2[i].settCod,
                            "semCod": result2[i].semCod,
                            "semDes": result2[i].semDes,
                            "inizio": result2[i].inizio,
                            "fine": result2[i].fine,
                            "ultMod": result2[i].ultMod,
                            "sede": result2[i].sede
                        });
                    }
                    console.log("Courses Sync...");
                    global.updatedExam = true;
                    //appSettings.setNumber("aaId", result);
                }
                page.getViewById("activityIndicator").visibility = "collapsed";

            },(e) => {
                console.log("Error", e.retErrMsg);
                dialogs.alert({
                    title: "Errore Server!",
                    message: e.retErrMsg,
                    okButtonText: "OK"
                });
            });
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
function updateSession(){
    page.getViewById("aa").text = "A.A " + appSettings.getString("aa_accad","2020");
    if (appSettings.getString("semestre","1") === "1")
        page.getViewById("semestre").text = "Primo Semestre";
    else
        page.getViewById("semestre").text = "Secondo Semestre";
    page.getViewById("sessione").text = appSettings.getString("sessione","???");
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

exports.tapAppello = function(){
    const nav =
        {
            moduleName: "docenti/docenti-appelli/docenti-appelli",
            clearHistory: false,
            animated: false
        };
    frame.topmost().navigate(nav);
};

exports.tapCourses = function(){
   const nav =
        {
            moduleName: "docenti/docenti-corsi/docenti-corsi",
            clearHistory: false,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);

};

exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",
            clearHistory: false,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: false,
            animated: false
        };
    frame.Frame.topmost().navigate(nav);
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
