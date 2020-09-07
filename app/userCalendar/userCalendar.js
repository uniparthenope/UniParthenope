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
const utilsModule = require("tns-core-modules/utils/utils");

//TODO Aggiungere altri colori
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
        getPiano();
        getAccesso();
        //getCourses();
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
        const luogo = appSettings.getString("strutturaId", "CDN");
        const corso = appSettings.getString("corsoGaId");

        console.log(luogo);
        if (corso === ""){
            //TODO Corso non inserito nel database!
        }
        const color = new Color.Color(colors[i%colors.length]);
        //const color = "#c47340";

        let url = global.url_general + "GAUniparthenope/v1/searchCourse/"+ luogo + "/" + esame.toUpperCase() + "/" + docente[0].toUpperCase() + "/" + corso +"/" + periodo;
        url = url.replace(/ /g, "%20");
        
        httpModule.request({
            url: url,
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
                    title: "Errore: UserCalendar calendarCourses",
                    message: result.errMsg,
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
                title: "Errore: UserCalendar",
                message: e.toString(),
                okButtonText: "OK"
            });
        });
    }
    let prenotazioni = global.myPrenotazioni;
    console.log(prenotazioni.length);
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

function getPiano() {
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
        console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403)
        {
            dialogs.alert({
                title: "Errore: UserCalendar getPiano pianoId",
                message: result.errMsg,
                okButtonText: "OK"
            }).then(
            );
        }
        else
        {
            if(result.pianoId === null){
                dialogs.alert({
                    title: "Attenzione!",
                    message: "Il piano di studi non è ancora disponibile, pertanto le funzionalità dell'app sono limitate. \n Ci scusiamo per il disagio!",
                    okButtonText: "OK"
                }).then(
                    page.getViewById("activityIndicator").visibility = "collapsed",
                    appSettings.setNumber("pianoId", result.pianoId)
                );
            }
            else {
                appSettings.setNumber("pianoId", result.pianoId);

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
                            title: "Errore: UserCalendar exams",
                            message: result.errMsg,
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
                                            title: "Errore: UserCalendar checkExams",
                                            message: result_n.errMsg,
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
                                    dialogs.alert({
                                        title: "Errore: UserCalendar",
                                        message: e.toString(),
                                        okButtonText: "OK"
                                    });
                                });
                            }
                            else {
                                //console.log("ADSCE NULL!");
                            }
                        }
                        //global.updatedExam = true;
                    }

                },(e) => {
                    dialogs.alert({
                        title: "Errore: UserCalendar",
                        message: e.toString(),
                        okButtonText: "OK"
                    });
                });
                global.updatedExam = true;

                httpModule.request({
                    url: global.url + "students/examsToFreq/" + stuId + "/" + pianoId +"/" + matId,
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
                            title: "Errore: UserCalendar examsToFreq",
                            message: result.errMsg,
                            okButtonText: "OK"
                        }).then(
                        );
                        page.getViewById("activityIndicator").visibility = "collapsed";
                    }
                    else {
                        let alphabets26 = 'abcdefghijklmnopqrstuvwxyz';
                        for (let i=0; i<result.length; i++){
                            if(result[i].domPartCod === "A-L"){
                                if((alphabets26.substr(0,12)).includes((appSettings.getString("cognome").charAt(0)).toLowerCase())){
                                    console.log(result[i].domPartCod);
                                    global.freqExams.push({
                                        "nome" : result[i].nome,
                                        "codice" : result[i].codice,
                                        "annoId" : result[i].annoId,
                                        "adsceID" : result[i].adsceID,
                                        "adLogId" : result[i].adLogId,
                                        "adId" : result[i].adId,
                                        "CFU" : result[i].CFU,
                                        "docente" : result[i].docente,
                                        "docenteID" : result[i].docenteID,
                                        "semestre" : result[i].semestre,
                                        "inizio" : result[i].inizio,
                                        "fine" : result[i].fine,
                                        "modifica" : result[i].ultMod,
                                        "orario" : [],
                                        "domPartCod" : result[i].domPartCod
                                    });
                                }
                            }
                            else if(result[i].domPartCod === "M-Z"){
                                if((alphabets26.substr(12,26)).includes((appSettings.getString("cognome").charAt(0)).toLowerCase())){
                                    global.freqExams.push({
                                        "nome" : result[i].nome,
                                        "codice" : result[i].codice,
                                        "annoId" : result[i].annoId,
                                        "adsceID" : result[i].adsceID,
                                        "adLogId" : result[i].adLogId,
                                        "adId" : result[i].adId,
                                        "CFU" : result[i].CFU,
                                        "docente" : result[i].docente,
                                        "docenteID" : result[i].docenteID,
                                        "semestre" : result[i].semestre,
                                        "inizio" : result[i].inizio,
                                        "fine" : result[i].fine,
                                        "modifica" : result[i].ultMod,
                                        "orario" : [],
                                        "domPartCod": result[i].domPartCod
                                    });
                                }
                            }
                            else {
                                global.freqExams.push({
                                    "nome": result[i].nome,
                                    "codice": result[i].codice,
                                    "annoId": result[i].annoId,
                                    "adsceID": result[i].adsceID,
                                    "adLogId": result[i].adLogId,
                                    "adId": result[i].adId,
                                    "CFU": result[i].CFU,
                                    "docente": result[i].docente,
                                    "docenteID": result[i].docenteID,
                                    "semestre": result[i].semestre,
                                    "inizio": result[i].inizio,
                                    "fine": result[i].fine,
                                    "modifica": result[i].ultMod,
                                    "orario": [],
                                    "domPartCod": result[i].domPartCod
                                });
                            }
                        }
                        page.getViewById("activityIndicator").visibility = "collapsed";
                        global.updatedExam = true;
                        calendarCourses();
                    }
                },(e) => {
                    dialogs.alert({
                        title: "Errore: UserCalendar",
                        message: e.toString(),
                        okButtonText: "OK"
                    });
                    page.getViewById("activityIndicator").visibility = "collapsed";
                });
            }
        }

    },(e) => {
        dialogs.alert({
            title: "Errore: UserCalendar",
            message: e.toString(),
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
                title: "Errore: UserCalendar getMainInfo",
                message: result.errMsg,
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
        dialogs.alert({
            title: "Errore: UserCalendar",
            message: e.toString(),
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
function getAccesso(){

    httpModule.request({
        url: global.url_general + "Access/v1/classroom",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore: UserCalendar access",
                message: result.errMsg,
                okButtonText: "OK"

            }).then();
        }
        else
        {

            if (result.accessType === "undefined"){
                dialogs.alert({
                    title: "Attenzione",
                    message: 'Bisogna scegliere la modalità con cui si intende frequentare i corsi del nuovo A.A!\n Accedere alla pagina "ACCESSO" dal menu laterale!',
                    okButtonText: "OK"
                });
            }

        }
    },(e) => {
        dialogs.alert({
            title: "Errore: UserCalendar getAccesso",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
exports.tapAppello = function(){
    const nav =
        {
            moduleName: "prenotazioni/prenotazioni",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "corsi/corsi",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapFood = function(){
    const nav =
        {
            moduleName: "menu/menu",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: true,
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

        console.log(result);

        for (let i = 0; i< result.length; i++){
            global.myPrenotazioni.push(result[i]);
        }
        /*
        memo) RESULT =
                "adId": result[i].adId,
                "appId": result[i].appId,
                "dataEsame": result[i].dataEsa,
                "classe": "examPass",
                "mese_app": result[i].desApp,
                "esame": result[i].nomeAppello,
                "docente": result[i].nome_pres + " "+ result[i].cognome_pres,
                "descrizione": result[i].tipoApp,
                "edificio": result[i].edificioDes,
                "aula": result[i].aulaDes,
                "iscritti": result[i].numIscritti,
                "note": result[i].note

         */
        global.getAllBadge(page);
    },(e) => {
        dialogs.alert({
            title: "Errore: UserCalendar getPrenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
//Cimitero
function getCourses() {
    const stuId = appSettings.getNumber("stuId");
    const matId = appSettings.getNumber("matId");

    httpModule.request({
        url: global.url + "students/pianoId/" + stuId,
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
                title: "Errore: UserCalendar",
                message: result.retErrMsg,
                okButtonText: "OK"
            }).then();
        }
        else
        {
            appSettings.setNumber("pianoId", result.pianoId);
        }

        let pianoId = appSettings.getNumber("pianoId");

        httpModule.request({
            url: global.url + "students/examsToFreq/" + stuId + "/" + pianoId +"/" + matId,
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
                        "adsceID" : result[i].adsceID,
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
