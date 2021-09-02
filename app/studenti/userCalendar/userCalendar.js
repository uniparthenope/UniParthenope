const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("http");
const appSettings = require("tns-core-modules/application-settings");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");
const modalViewModule = "modal/modal-event/modal-event";
let firebase = require("nativescript-plugin-firebase");


//let colors = ["#c47340","#4566c1","#824bc1","#a32d13","#382603","#fff766"];

let page;
let viewModel;
let sideDrawer;
let calendar;
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

function insert_event() {
    //console.log("EVENT INSERT");
    calendar = page.getViewById("cal");
    if(calendar !== undefined){

        let temp = global.events;
        for (let x=0; x<temp.length; x++){
            try {
                let event = new calendarModule.CalendarEvent(temp[x].title, temp[x].data_inizio, temp[x].data_fine, false, temp[x].color);
                event_calendar.push(event);

            }catch (e) {
                console.log(e);
            }

        }
    }
}

function calendarCourses() {
    page.getViewById("activityIndicator3").visibility = "visible";

    global.events = [];

    let url = global.url_general + "GAUniparthenope/v1/getLectures/" + appSettings.getNumber("matId");

    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.confirm({
                title: "Errore: UserCalendar calendarCourses",
                message: result.errMsg,
                okButtonText: "OK"
            }).then(
                page.getViewById("activityIndicator3").visibility = "collapsed"
            );
        }
        else {
            for (let x = 0; x < result.length; x++) {
                let data_inizio = convertData(result[x].start);
                let data_fine = convertData(result[x].end);
                let color;
                let reserved = "";
                let reserved_by = "";
                if(result[x].reservation.reserved){
                    reserved = L('calendar_res');
                    if(result[x].reservation.reserved_by === appSettings.getString("userId"))
                        reserved_by = L('calendar_res_me');
                    else
                        reserved_by = L('calendar_res_by') + result[x].reservation.reserved_by;
                }

                color = new Color.Color(setColor(result[x].id_corso));

                //Vecchi colori
                //color = new Color.Color(colors[x%colors.length]);


                let tot_cap = Math.floor(result[x].room.capacity);
                let av_cap =  tot_cap - Math.floor(result[x].room.availability);

                let title = reserved + result[x].course_name + "_\n" + result[x].prof + "\n" + result[x].room.name +"\n" + L('calendar_res_room') + av_cap + "/ "+tot_cap + "\n"+reserved_by;
                //let title = reserved + result[x].course_name + "\n" + result[x].prof + "\n" + result[x].room.name;
                global.events.push({
                    title : title,
                    data_inizio:data_inizio ,
                    data_fine: data_fine,
                    color: color
                });
            }
            insert_event();
            page.getViewById("activityIndicator3").visibility = "collapsed";
        }
    },(e) => {
        console.log("Error", e);
        dialogs.confirm({
            title: "Errore: UserCalendar",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

    page.getViewById("activityIndicator4").visibility = "visible";

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
        //console.log(result);

        if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403) {
            dialogs.confirm({
                title: "Errore: UserCalendar examsToFreq",
                message: result.errMsg,
                okButtonText: "OK"
            }).then(
                page.getViewById("activityIndicator4").visibility = "collapsed"
            );
        }
        else{
            appSettings.setNumber("appelloBadge", result.length);

            for (let x = 0; x< result.length; x++){
                global.myPrenotazioni.push(result[x]);

                let data_inizio = convertData(result[x].dataEsa);

                global.events.push({
                    title : L('calendar_exam') + result[x].nomeAppello,
                    data_inizio: data_inizio,
                    data_fine: data_inizio,
                    color: new Color.Color("#0F9851")
                });
            }
            insert_event();

            page.getViewById("activityIndicator4").visibility = "collapsed";
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
        }
    },(e) => {
        dialogs.confirm({
            title: "Errore: UserCalendar getPrenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        }).then(
            page.getViewById("activityIndicator4").visibility = "collapsed"
        );
    });

}

function getMainInfo() {
    let cdsId = appSettings.getNumber("cdsId");

    page.getViewById("activityIndicator").visibility = "visible";

    httpModule.request({
        url: global.url + "general/current_aa/" + cdsId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        page.getViewById("activityIndicator").visibility = "collapsed";

        if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403) {
            dialogs.confirm({
                title: "Errore: UserCalendar getMainInfo",
                message: result.errMsg,
                okButtonText: "OK"
            }).then(
                page.getViewById("activityIndicator2").visibility = "collapsed"
            );
        }
        else {
            appSettings.setString("aa_accad", result.aa_accad);
            appSettings.setString("sessione", result.curr_sem);
            appSettings.setString("semestre", result.semestre);
            console.log(L('calendar_aa') + appSettings.getString("aa_accad"));
            console.log(L('calendar_sem') + appSettings.getString("semestre"));

            page.getViewById("activityIndicator2").visibility = "visible";

            httpModule.request({
                url: global.url2 + "students/myExams/" + appSettings.getNumber("matId", 0),
                method: "GET",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                }
            }).then((response) => {
                const result = response.content.toJSON();

                if (response.statusCode === 401 || response.statusCode === 500 || response.statusCode === 403) {
                    dialogs.confirm({
                        title: "Errore: UserCalendar examsToFreq",
                        message: result.errMsg,
                        okButtonText: "OK"
                    }).then(
                        page.getViewById("activityIndicator2").visibility = "collapsed"
                    );
                }
                else {
                    let x = 0;
                    for (let i=0; i<result.length; i++){
                        if(result[i].tipo)
                            if (result[i].esito === 'P' || result[i].esito === 'F')
                                x++;
                        global.myExams.push({
                            "nome" : result[i].nome,
                            "codice" : result[i].codice,
                            "tipo": result[i].tipo,
                            "annoId" : result[i].annoId,
                            "adsceID" : result[i].adsceID,
                            "adLogId" : result[i].adLogId,
                            "adId" : result[i].adId,
                            "CFU" : result[i].CFU,
                            "docente" : result[i].docente,
                            "docenteID" : result[i].docenteID,
                            "semestre" : result[i].semestre,
                            //"inizio" : result[i].inizio,
                            //"fine" : result[i].fine,
                            //"modifica" : result[i].ultMod,
                            //"orario" : [],
                            "domPartCod": result[i].domPartCod,
                            "esito": result[i].status.esito,
                            "lode": result[i].status.lode,
                            "voto": result[i].status.voto,
                            "data": result[i].status.data
                        })
                    }

                    global.updatedExam = true;
                    appSettings.setNumber("examsBadge",x);
                    calendarCourses();
                }
                page.getViewById("activityIndicator2").visibility = "collapsed";

            },(e) => {
                dialogs.confirm({
                    title: "Errore: UserCalendar",
                    message: e.toString(),
                    okButtonText: "OK"
                }).then(
                    page.getViewById("activityIndicator2").visibility = "collapsed"
                );
            });
        }

    },(e) => {
        dialogs.confirm({
            title: "Errore: UserCalendar",
            message: e.toString(),
            okButtonText: "OK"
        }).then(
            page.getViewById("activityIndicator2").visibility = "collapsed"
        );
    });
}
/*
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

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.confirm({
                title: "Errore: UserCalendar access",
                message: result.errMsg,
                okButtonText: "OK"

            });
        }
        else {
            if (result.accessType === "undefined"){
                dialogs.confirm({
                    title: L('warning'),
                    message: L('calendar_access'),
                    okButtonText: "OK"
                });
            }
        }
    },(e) => {
        dialogs.confirm({
            title: "Errore: UserCalendar getAccesso",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

 */
function getPrenotazioni(){

}

exports.onNavigatingTo = function (args) {
    page = args.object;
    page.getViewById("selected_col").col = "0";
    event_calendar = new ObservableArray();

    viewModel = observableModule.fromObject({
        events:event_calendar
    });

    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    calendar = page.getViewById("cal");

    console.log("UPDATED= "+global.updatedExam);
    //global.updatedExam = false;
    if (!global.updatedExam) {
        getMainInfo();
        //getAccesso();
        //getPrenotazioni();
    }
    else {
        insert_event();
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
            moduleName: "general/home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.tapAppello = function(){
    const nav =
        {
            moduleName: "studenti/prenotazioni/prenotazioni",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapCourses = function(){
    const nav =
        {
            moduleName: "studenti/corsi/corsi",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.tapLibretto = function(){
    const nav =
        {
            moduleName: "studenti/libretto/libretto",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

exports.onDaySelected = function(args){
    const mainView = args.object;
    let complete = args.eventData.title;
    let title = complete.split("_")[0];
    let body = complete.split("_")[1];
    const context = { title: title,body:body, start_date: args.eventData.startDate, end_date: args.eventData.endDate, color: args.eventData.eventColor};

    mainView.showModal(modalViewModule, context, false);
};

exports.tap_reload = function(){
    global.updatedExam = false;

    while (global.myPrenotazioni.length>0)
        global.myPrenotazioni.pop();
    while (global.myExams.length>0)
        global.myExams.pop();


    const nav =
        {
            moduleName: "studenti/userCalendar/userCalendar",
            clearHistory: true,
            animated: false
        };
    page.frame.navigate(nav);
};

function setColor(id){
    let flag_search = false;
    let color;
    let my_colors = JSON.parse(appSettings.getString("mycolors", "[]"));

    if(my_colors.length > 0){
        for (let i =0; i< my_colors.length; i++){
            if (my_colors[i].id === id){
                flag_search = true;
                color = my_colors[i].color;
            }
        }

        if(flag_search)
            return color;
        else{
            let rand_color = "#" +  Math.floor(Math.random()*16777215).toString(16);

            my_colors.push({
                id: id,
                color: rand_color
            });
            appSettings.setString("mycolors", JSON.stringify(my_colors));
            return rand_color;
        }
    }
    else{
        let rand_color = "#" +  Math.floor(Math.random()*16777215).toString(16);

        my_colors.push({
            id: id,
            color: rand_color
        });
        appSettings.setString("mycolors", JSON.stringify(my_colors));

        return rand_color;
    }
}