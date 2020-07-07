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


function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "0";
    viewModel = new Observable();
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    calendar = page.getViewById("cal");
    //global.updatedExam = false;

    console.log("UPDATED= "+global.updatedExam);

    if (!global.updatedExam)
    {
        page.getViewById("activityIndicator").visibility = "visible";
        getMainInfo();
        myExams();
        getCourses();
        getPrenotazioni();
    }
    else {
        calendarCourses();
    }

    global.getAllBadge(page);
    page.bindingContext = viewModel;
}

function calendarCourses() {
    //console.log(global.freqExams.length);
    global.events = [];
    let esami = global.freqExams;

    /*
     TODO Cambiare ciclo for ed API.
      Effettuare prima chiamata API e scaricare .ical o json e poi cercare il docente
      (Passo da N chiamate API ad 1!!)
     */
    for (let i = 0; i<esami.length; i++)
    {
        let esame = esami[i].nome;
        let docente = esami[i].docente.split(" ");
        const periodo = appSettings.getNumber("periodo",3);
        const luogo = appSettings.getString("strutturaDes", "CDN");
        const corso = appSettings.getString("corsoGaId");
        if (corso === ""){
            //TODO Corso non inserito nel database!
        }
        const color = new Color.Color(colors[i]);
        
        httpModule.request({
            url: global.url_general + "GAUniparthenope/v1/searchCourse/"+ luogo + "/" + esame.toUpperCase() + "/" + docente[0].toUpperCase() + "/" + corso +"/" + periodo ,
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            const result = response.content.toJSON();
            console.log(result);

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
    let prenotazioni = global.myPrenotazioni;
    for (let x=0; x < prenotazioni.length ; x++){
        let data_inizio = convertData(prenotazioni[x].dataEsa);
        //console.log(data_inizio);

        global.events.push({
            title : "[ESAME] "+ prenotazioni[x].nomeAppello,
            data_inizio: data_inizio,
            data_fine: data_inizio,
            color: new Color.Color("#0F9851")
        });
    }
    insert_event();

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
        url: global.url + "students/pianoId/" + stuId ,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);

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
            appSettings.setNumber("pianoId", result.pianoId);
        }

        let pianoId = appSettings.getNumber("pianoId");

        //console.log("IN CONNESSIONE A = "+global.url + "exams/" + global.encodedStr + "/" + stuId + "/" + pianoId +"/" + global.authToken);

        httpModule.request({
            url: global.url + "students/exams/" + stuId + "/" + pianoId,
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic " + global.encodedStr
            }
        }).then((response) => {
            const result = response.content.toJSON();
            //console.log(result);

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
                let array = [];

                //console.log(result.length);
                for (let i=0; i<result.length; i++)
                {
                    //console.log("ADSCEID = "+ result[i].adsceId);
                    if(result[i].adsceId !== null) {
                        //console.log(global.url + "students/checkExams/" + matId + "/" + result[i].adsceId);
                        httpModule.request({
                            url: global.url + "students/checkExams/" + matId + "/" + result[i].adsceId,
                            method: "GET",
                            headers: {
                                "Content-Type" : "application/json",
                                "Authorization" : "Basic "+ global.encodedStr
                            }
                        }).then((response) => {
                            const result_n = response.content.toJSON();
                            //console.log(result_n);

                            if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403) {
                                dialogs.alert({
                                    title: "Errore Server!",
                                    message: result_n.retErrMsg,
                                    okButtonText: "OK"
                                }).then(
                                );
                            } else {
                                exams.superata = result_n.stato;

                                global.myExams.push({
                                    "nome": result[i].nome,
                                    "codice": result[i].codice,
                                    "annoId": result[i].annoId,
                                    "adsceId": result[i].adsceId,
                                    "adId": result[i].adId,
                                    "CFU": result[i].CFU,
                                    "superata": result_n.stato,
                                    "superata_data": result_n.data,
                                    "superata_voto": result_n.voto,
                                    "superata_lode": result_n.lode,
                                    "annoCorso": result_n.anno
                                });
                            }
                        }, (e) => {
                            console.log("Error", e);
                            dialogs.alert({
                                title: "Errore Sincronizzazione Esami!",
                                message: e,
                                okButtonText: "OK"
                            });
                        });
                    }
                    else {
                        //console.log("ADSCE NULL!");
                    }
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

function getPrenotazioni(){
    let matId = appSettings.getNumber("matId").toString();

    httpModule.request({
        url: global.url + "students/getReservations/" + matId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        appSettings.setNumber("appelloBadge", result.length);

        for (let i = 0; i< result.length; i++){
            global.myPrenotazioni.push(result[i]);

        }
        /*
        memo) RESULT =
            'nome_pres' : _response2['presidenteNome'],
            'cognome_pres': _response2['presidenteCognome'],
            'numIscritti': _response2['numIscritti'],
            'note': _response2['note'],
            'statoDes': _response2['statoDes'],
            'statoEsito': _response2['statoInsEsiti']['value'],
            'statoVerb': _response2['statoVerb']['value'],
            'statoPubbl': _response2['statoPubblEsiti']['value'],
            'tipoApp': _response2['tipoGestAppDes'],
            'aulaId' : _response2['turni'][x]['aulaId'],
            'edificioId': _response2['turni'][x]['edificioCod'],
            'edificioDes': _response2['turni'][x]['edificioDes'],
            'aulaDes': _response2['turni'][x]['aulaDes'],
            'desApp': _response2['turni'][x]['des'],
            'dataEsa': _response2['turni'][x]['dataOraEsa']

         */
        global.getAllBadge(page);
    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore Server!",
            message: e,
            okButtonText: "OK"
        });
    });
}

function getMainInfo() {
    //console.log("Sono in GETMAININFO");
    let cdsId = appSettings.getNumber("cdsId");

    httpModule.request({
        url: global.url + "general/current_aa/" + cdsId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log("GetMainInfo() ="+ result);
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
            appSettings.setString("aa_accad", result.aa_accad);
            appSettings.setString("sessione", result.curr_sem);
            appSettings.setString("semestre", result.semestre);
            console.log("AA= "+ appSettings.getString("aa_accad"));
            console.log("Semestre= "+ appSettings.getString("semestre"));
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

    httpModule.request({
        url: global.url + "students/pianoId/" + stuId ,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        //console.log(result);

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
            appSettings.setNumber("pianoId", result.pianoId);
        }

        let pianoId = appSettings.getNumber("pianoId");

        httpModule.request({
            url: global.url + "students/examsToFreq/" + stuId + "/" + appSettings.getNumber("pianoId") +"/" + matId,
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            const result = response.content.toJSON();

            //console.log("URL: " + global.url + "examsToFreq/" + global.encodedStr + "/" + stuId + "/" + appSettings.getNumber("pianoId") +"/" + matId + "/" + global.authToken)
            //console.log(result);
            page.getViewById("activityIndicator").visibility = "visible";


            if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403)
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
function convertData(data){
    let day = data[0]+data[1];
    let month = data[3]+data[4];
    let year = data[6]+data[7]+data[8]+data[9];
    let hour = data[11]+data[12];
    let min = data[14]+data[15];

    let d = new Date(year,month-1,day,hour,min);

    return d;
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
            moduleName: "prenotazioni/prenotazioni",
            clearHistory: false,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "corsi/corsi",
            clearHistory: false,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",
            clearHistory: false,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: false,
            animated: false
        };
    page.frame.navigate(nav);
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
