const Observable = require("tns-core-modules/data/observable").Observable;
const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("http");
const appSettings = require("tns-core-modules/application-settings");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");
const modalViewModule = "modal-event/modal-event";
const platformModule = require("tns-core-modules/platform");

let colors = ["#c47340","#c42340","#a37390","#4566c1","#AA45BB","#824bc1","#a32d13","#382603","#fff766"];
let page;
let viewModel;
let sideDrawer;
let calendar;
let result;
let loading;
let num;
let event_calendar;


function convertData(data){
    let day = data[8]+data[9];
    let month = data[5]+data[6];
    let year = data[0]+data[1]+data[2]+data[3];
    let hour = data[11]+data[12];
    let min = data[14]+data[15];

    let d = new Date(year,month-1,day,hour,min);

    return d;
}

function dayOfWeek(date) {
    let day = date.substring(0, 2);
    let month = date.substring(3, 5);
    let year = date.substring(6, 10);

    let dayOfWeek = new Date(year,month-1,day).getDay();
    return isNaN(dayOfWeek) ? null : ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][dayOfWeek];
}

function monthOfYear(date) {
    let month = parseInt(date.substring(3, 5)) - 1;
    return isNaN(month) ? null : ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"][month];
}

function insert_event() {
    calendar = page.getViewById("myCalendar");
    if(calendar !== undefined){
        let temp = global.events;

        for (let x=0; x<temp.length; x++){
            let event = new calendarModule.CalendarEvent(temp[x].title, temp[x].data_inizio, temp[x].data_fine, false, temp[x].color);
            event_calendar.push(event);
        }

    }
}

function updateSession(){
    page.getViewById("aa").text = "A.A " + appSettings.getString("aa_accad","2020");
    if (appSettings.getString("semestre","1") === "1")
        page.getViewById("semestre").text = "Primo Semestre";
    else
        page.getViewById("semestre").text = "Secondo Semestre";
    page.getViewById("sessione").text = appSettings.getString("sessione","???");
}

function getLectures(){
    page.getViewById("activityIndicator2").visibility = "collapsed";

    let anno = appSettings.getString("aa_accad").split(" - ")[0];

    let url = global.url_general + "GAUniparthenope/v1/getProfLectures/"+ anno;
    loading.visibility = "visible";

    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let result = response.content.toJSON();

        global.myLezioni = result;
        for (let i=0; i<result.length; i++) {

            let courses = result[i].courses;
            const color = new Color.Color(colors[i%colors.length]);
            for (let j=0; j<courses.length; j++){
                let data_inizio = convertData(courses[j].start);
                let data_fine = convertData(courses[j].end);

                let tot_cap = Math.floor(courses[j].room.capacity);
                let av_cap =  tot_cap - Math.floor(courses[j].room.availability);

                global.events.push({
                    title : ""+ courses[j].course_name +"_\n"+ courses[j].room.description+"\n"+ courses[j].room.name+"\n Prenotati Aula: "+ av_cap + " / "+tot_cap,
                    data_inizio: data_inizio,
                    data_fine:data_fine,
                    color: color
                });
            }
        }
        insert_event();
        page.getViewById("activityIndicator2").visibility = "collapsed";


        loading.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        loading.visibility = "collapsed";

        dialogs.alert({
            title: "Errore: prenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function getCourses() {
    page.getViewById("activityIndicator3").visibility = "visible";

    httpModule.request({
        url: global.url + "professor/getSession",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403) {
            dialogs.alert({
                title: "Errore: DocentiHome GetCourses getSession",
                message: result.errMsg,
                okButtonText: "OK"
            });
        }
        else {
            page.getViewById("aa").text = "A.A " + result.aa_curr;
            if (result.semId === 1)
                page.getViewById("semestre").text = "Primo Semestre";
            else
                page.getViewById("semestre").text = "Secondo Semestre";
            page.getViewById("sessione").text = result.semDes;

            //appSettings.setString("aaId", result.aaId.toString());
            appSettings.setString("aaId", result.aaId.toString());
            appSettings.setString("aa_accad", result.aa_curr);
            appSettings.setString("sessione", result.semDes.toString());
            appSettings.setString("semestre", result.semId.toString());

            httpModule.request({
                url: global.url + "professor/getCourses/" + result.aaId.toString(),
                method: "GET",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                }
            }).then((response2) => {
                const result2 = response2.content.toJSON();
                if (response2.statusCode === 401 || response2.statusCode === 500 || response2.statusCode === 403) {
                    dialogs.alert({
                        title: "Errore: DocentiHome GetCourses getCourses",
                        message: result2.errMsg,
                        okButtonText: "OK"
                    });
                }
                else {
                    global.myAppelli.slice(0);
                    while(global.myExams.length > 0)
                        global.myExams.pop();
                    num = 0;
                    global.events = [];

                    for(let j=0; j<result2.length; j++){
                        let myarray = [];

                        global.myExams.push({
                            "nome": result2[j].adDes,
                            "cdsDes": result2[j].cdDes,
                            "cdsId": result2[j].cdsId,
                            "adDefAppCod": result2[j].adDefAppCod,
                            "adId": result2[j].adId,
                            "cfu": result2[j].cfu,
                            "durata": result2[j].durata,
                            "obbligatoria": result2[j].obbligatoria,
                            "libera": result2[j].libera,
                            "tipo": result2[j].tipo,
                            "settCod": result2[j].settCod,
                            "semCod": result2[j].semCod,
                            "semDes": result2[j].semDes,
                            "inizio": result2[j].inizio,
                            "fine": result2[j].fine,
                            "ultMod": result2[j].ultMod,
                            "sede": result2[j].sede,
                            "adLogId": result2[j].adLogId
                        });

                        httpModule.request({
                            url: global.url + "students/checkAppello/" + result2[j].cdsId +"/" + result2[j].adId,
                            method: "GET",
                            headers: {
                                "Content-Type" : "application/json",
                                "Authorization" : "Basic "+ global.encodedStr
                            }
                        }).then((response3) => {
                            const result3 = response3.content.toJSON();

                            if (response3.statusCode === 401 || response3.statusCode === 500) {
                                dialogs.alert({
                                    title: "Errore: DocentiAppelli getAppelli",
                                    message: response3.errMsg,
                                    okButtonText: "OK"

                                });
                            }
                            else{
                                for (let i=0; i<result3.length; i++) {
                                    let day,year,month;
                                    let final_data ="" + dayOfWeek(result3[i].dataEsame) + " " + result3[i].dataEsame.substring(0, 2)+ " " + monthOfYear(result3[i].dataEsame) + " " + result3[i].dataEsame.substring(6, 10);
                                    day = result3[i].dataEsame.substring(0, 2);
                                    month = result3[i].dataEsame.substring(3, 5);
                                    year = result3[i].dataEsame.substring(6, 10);
                                    let date = new Date(year,month-1,day);

                                    console.log(result3[i].esame);

                                    if (appSettings.getBoolean("esami_futuri") && result3[i].stato === "I"){

                                        //Removed adId and cdsId
                                        let items = {
                                            "esame": result3[i].esame,
                                            "descrizione": result3[i].descrizione,
                                            "note": result3[i].note,
                                            "dataEsame": final_data,
                                            "dataInizio": result3[i].dataInizio,
                                            "dataFine": result3[i].dataFine,
                                            "iscritti": result3[i].numIscritti,
                                            "classe" : "examPass",
                                            "date" : date,
                                            "appId": result3[i].appId,
                                            "prenotazione_da": "Prenotazioni: da ",
                                            "prenotazione_a": " a ",
                                            "text_iscritti": "Iscritti: ",
                                            "stato" : result3[i].statoDes
                                        };
                                        myarray.push(items);
                                    }
                                    else{
                                        let items = {
                                            "esame": result3[i].esame,
                                            "descrizione": result3[i].descrizione,
                                            "note": result3[i].note,
                                            "dataEsame": final_data,
                                            "dataInizio": result3[i].dataInizio,
                                            "dataFine": result3[i].dataFine,
                                            "iscritti": result3[i].numIscritti,
                                            "classe" : "examPass",
                                            "date" : date,
                                            "appId": result3[i].appId,
                                            "prenotazione_da": "Prenotazioni: da ",
                                            "prenotazione_a": " a ",
                                            "text_iscritti": "Iscritti: ",
                                            "stato" : result3[i].statoDes
                                        };
                                        num++;
                                        myarray.push(items);
                                    }

                                    let title = "[ESAME] " + result3[i].esame;
                                    global.events.push({
                                        title : title,
                                        data_inizio: date,
                                        data_fine:date,
                                        color: new Color.Color("#0F9851")
                                    });
                                }
                            }

                            if (platformModule.isIOS){
                                myarray.splice(0, 0, {});
                            }

                            global.myAppelli.push({
                                titolo: result2[j].adDes,
                                items: myarray
                            });
                            page.getViewById("activityIndicator3").visibility = "collapsed";


                        },(e) => {
                            dialogs.alert({
                                title: "Errore: DocentiAppelli",
                                message: e.toString(),
                                okButtonText: "OK"
                            });
                        });
                    }

                    insert_event();
                    global.updatedExam = true;

                    getLectures();

                }
                page.getViewById("activityIndicator").visibility = "collapsed";
            },(e) => {
                dialogs.alert({
                    title: "Errore: DocentiHome",
                    message: e.toString(),
                    okButtonText: "OK"
                });
            });
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: DocentiHome",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function onNavigatingTo(args) {
    page = args.object;
    page.getViewById("selected_col").col = "0";

    sideDrawer = app.getRootView();
    event_calendar = new ObservableArray();
    viewModel = observableModule.fromObject({
        events:event_calendar
    });

    sideDrawer.closeDrawer();
    calendar = page.getViewById("myCalendar");
    loading = page.getViewById("activityIndicator");
    console.log("UPDATED= "+global.updatedExam);


    if (!global.updatedExam) {
        loading.visibility = "visible";

        getCourses();
    }
    else {
        insert_event();
        updateSession();
    }
    global.getAllBadge(page);

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function () {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onGeneralMenu = function () {
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
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);};

exports.tapCourses = function(){
   const nav =
        {
            moduleName: "docenti/docenti-corsi/docenti-corsi",
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
    page.frame.navigate(nav);};

exports.tapBus = function(){
    const nav =
        {
            moduleName: "trasporti/trasporti",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);};

exports.onDaySelected = function(args){
    console.log(args.eventData);
    const mainView = args.object;
    let complete = args.eventData.title;
    let title = complete.split("_")[0];
    let body = complete.split("_")[1];
    console.log("BODY",body);
    const context = { title: title,body:body, start_date: args.eventData.startDate, end_date: args.eventData.endDate, color: args.eventData.eventColor};

    mainView.showModal(modalViewModule, context, false);
};

exports.onNavigatingTo = onNavigatingTo;
