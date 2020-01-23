const application = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");

global.url = "http://museonavale.uniparthenope.it:8080/api/uniparthenope/";
global.localurl = "http://192.168.1.198:5000/api/uniparthenope/";

global.isConnected = false;
global.updatedExam = false;
global.encodedStr = "";
global.authToken="";
global.tempNum = 0;
global.myform = "";
global.username = "";
global.data_today;
global.events = [];
global.tempPos = false;
global.freqExams = [];
global.myExams = [];
global.myDocenti = [];
global.myPrenotazioni = [];

/*
appSettings.setString("aa_accad", result.aa_accad);
appSettings.setString("sessione", result.curr_sem);
appSettings.setString("semestre", result.semestre);
*/

global.clearAll = function(){
    global.isConnected = false;
    global.updatedExam = false;
    global.tempPos = false;
    global.tempNum = 0;
    global.encodedStr = "";
    global.authToken="";
    global.myform = "";
    global.username = "";
    global.events = [];
    global.freqExams = [];
    global.myExams = [];
    global.myDocenti = [];
    appSettings.clear();

};
global.saveInfo = function(result) {
    appSettings.setString("codFis",result.user.codFis);
    appSettings.setString("nome",result.user.firstName);
    appSettings.setString("cognome",result.user.lastName);
    appSettings.setString("grpDes",result.user.grpDes);
    if  (result.user.grpDes === "Studenti"){
        let index = appSettings.getNumber("carriera");
        console.log(result.user.trattiCarriera[index].strutturaDes);
        appSettings.setString("strutturaDes",result.user.trattiCarriera[index].strutturaDes);

        appSettings.setString("strutturaId",result.user.trattiCarriera[index].strutturaId.toString());
        appSettings.setString("strutturaGaId",result.user.trattiCarriera[index].strutturaGaId.toString());
        appSettings.setString("corsoGaId",result.user.trattiCarriera[index].corsoGaId.toString());

        console.log("SAVE_INFO Dipartimento= "+result.user.trattiCarriera[index].strutturaDes);
        console.log("SAVE_INFO Dipartimento ID= "+result.user.trattiCarriera[index].strutturaId);
        console.log("SAVE_INFO GA Id= "+result.user.trattiCarriera[index].strutturaGaId);
        console.log("SAVE_INFO GA Corso= "+result.user.trattiCarriera[index].corsoGaId);
    }

    global.authToken= result.authToken;
    console.log("SAVE_INFO CF= "+result.user.codFis);
    console.log("SAVE_INFO Name= "+result.user.firstName);
    console.log("SAVE_INFO Surname= "+result.user.lastName);
    console.log("SAVE_INFO grpDes= "+result.user.grpDes);
    console.log("SAVE_INFO AuthToken= "+global.authToken);
};

global.saveCarr = function(result) {
    console.log("SAVE_CARR cdsDes= "+result.cdsDes);
    console.log("SAVE_CARR cdsId= "+result.cdsId);
    console.log("SAVE_CARR matId= "+result.matId);
    console.log("SAVE_CARR stuId= "+result.stuId);
    console.log("SAVE_CARR Mat.= "+result.matricola);

    appSettings.setString("cdsDes",result.cdsDes);
    appSettings.setNumber("cdsId",result.cdsId);
    appSettings.setNumber("matId",result.matId);
    appSettings.setNumber("stuId",result.stuId);
    appSettings.setString("matricola",result.matricola);

    return true;
};

global.getAllBadge = function(page) {
    let calendar = appSettings.getNumber("calendarBadge",0);
    let exams = appSettings.getNumber("examsBadge",0);
    let food = appSettings.getNumber("foodBadge",0);
    let trasport = appSettings.getNumber("trasportBadge",0);
    let appello = appSettings.getNumber("appelloBadge",0);

    if (calendar === 0) {
            page.getViewById("badge_Calendar").visibility = "collapsed";

    }
    else {
            page.getViewById("badge_Calendar").visibility = "visible";
            page.getViewById("text_badgeCalendar").text = calendar;
    }
    if (appello === 0) {
        page.getViewById("badge_appello").visibility = "collapsed";

    }
    else {
        page.getViewById("badge_appello").visibility = "visible";
        page.getViewById("text_badgeAppello").text = appello;
    }

    if (exams === 0) {
        page.getViewById("badge_Courses").visibility = "collapsed";
    }
    else {
        page.getViewById("badge_Courses").visibility = "visible";
        page.getViewById("text_badgeCourses").text = exams;
    }

    if (food === 0) {
        page.getViewById("badge_Food").visibility = "collapsed";
    }
    else {
        page.getViewById("badge_Food").visibility = "visible";
        page.getViewById("text_badgeFood").text = food;
    }

    if (trasport === 0) {
        page.getViewById("badge_Bus").visibility = "collapsed";
    }
    else {
        page.getViewById("badge_Bus").visibility = "visible";
        page.getViewById("text_badgeBus").text = trasport;
    }
};

application.on(application.exitEvent, (args) => {
    if (args.android) {
        global.tempPos = false;
        global.isConnected = false;
        global.updatedExam = false;
        global.encodedStr = "";
        global.authToken="";
        global.tempNum = 0;
        global.myform = "";
        global.username = "";
        global.events = [];
        global.tempPos = false;
        global.freqExams = [];
        global.myExams = [];


        if(global.encodedStr !== " "){
            let url = global.url + "logout/" + global.encodedStr + "/" + global.authToken;
            httpModule.request({
                url: url,
                method: "GET"
            }).then((response) => {
                const result = response.content.toJSON();

                if(result.status_code === 200){
                    console.log("Logout");
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
        console.log("Exit: " + args.android);
    } else if (args.ios) {
        console.log("Exit: " + args.ios);
    }
});

application.on(application.suspendEvent, (args) => {
    if (args.android) {
        console.log("Suspend: " + args.android);
        global.tempPos = false;
    } else if (args.ios) {
        console.log("Suspend: " + args.ios);
    }
});

application.run({ moduleName: "app-root" });
