const application = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;


let domain = "https://api.uniparthenope.it";
//let domain = "http://127.0.0.1:5000";


global.url = domain + "/UniparthenopeApp/v1/";
global.url_general = domain + "/";

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
global.myAppelli = new ObservableArray();
global.my_selfcert;

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
    global.myPrenotazioni = [];
    global.myAppelli = new ObservableArray();

    appSettings.clear();
};

global.saveInfo = function(result) {
    appSettings.setString("codFis",result.user.codFis);
    appSettings.setString("nome",result.user.firstName);
    appSettings.setString("cognome",result.user.lastName);
    appSettings.setString("grpDes",result.user.grpDes);
    //appSettings.setNumber("persId", result.user.persId);
   appSettings.setString("userId", result.user.userId);

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
    //console.log("SAVE_INFO persId= "+result.user.persId);
    console.log("SAVE_INFO userId= " + result.user.userId);
    console.log("SAVE_INFO AuthToken= " + global.authToken);
};
global.saveAnagrafe = function(type,result){
    console.log("SAVE_ANAGR dataNascita= "+result.dataNascita);
    console.log("SAVE_ANAGR emailAte= "+result.emailAte);
    console.log("SAVE_ANAGR sesso= "+result.sesso);
    console.log("SAVE_ANAGR telRes= "+result.telRes);

    appSettings.setString("dataNascita",result.dataNascita);
    appSettings.setString("emailAte",result.emailAte);
    appSettings.setString("sesso",result.sesso);
    appSettings.setString("telRes",result.telRes);

    if (type === "Studenti"){
        console.log("SAVE_ANAGR desCittadinanza= "+result.desCittadinanza);
        console.log("SAVE_ANAGR email= "+result.email);

        appSettings.setString("desCittadinanza",result.desCittadinanza);
        appSettings.setString("email",result.email);
  }
  else if (type === "Docenti"){
        console.log("SAVE_ANAGR ruolo= "+result.ruolo);
        console.log("SAVE_ANAGR settore= "+result.settore);

        appSettings.setString("ruolo",result.ruolo);
        appSettings.setString("settore",result.settore);
  }
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
global.saveDepartment = function(result) {
    console.log("SAVE_CARR dataIscr= "+result.dataIscr);
    console.log("SAVE_CARR facCod= "+result.facCod);
    console.log("SAVE_CARR facCsaCod= "+result.facCsaCod);
    console.log("SAVE_CARR facDes= "+result.facDes);
    console.log("SAVE_CARR sedeId.= "+result.sedeId);
    console.log("SAVE_CARR sediDes.= "+result.sediDes);

    appSettings.setString("dataIscr",result.dataIscr);
    appSettings.setString("facCod",result.facCod);
    appSettings.setString("facCsaCod",result.facCsaCod);
    appSettings.setString("facDes",result.facDes);
    appSettings.setNumber("sedeId",result.sedeId);
    appSettings.setString("sediDes",result.sediDes);


};
global.saveProf = function(result) {
    console.log("SAVE_CARR settCod= " + result.settCod);
    appSettings.setString("settCod",result.settCod);

    console.log("SAVE_CARR ruoloDocCod= "+result.ruoloDocCod);
    appSettings.setString("ruoloDocCod",result.ruoloDocCod);

    console.log("SAVE_CARR Mat.= "+result.docenteMatricola);
    appSettings.setString("matricola",result.docenteMatricola);

    console.log("SAVE_CARR facCod= " + result.facCod);
    appSettings.setString("facCod",result.facCod);

    console.log("SAVE_CARR facDes= "+result.facDes);
    appSettings.setString("facDes",result.facDes);

    console.log("SAVE_CARR facId.= "+result.facId);
    appSettings.setNumber("facId",result.facId);

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
    if (!appSettings.getBoolean("rememberMe")){
        let temp_scelta = appSettings.getBoolean("sondaggio");

        clearAll();

        appSettings.setBoolean("sondaggio", temp_scelta);
    }


    if (args.android) {

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
                dialogs.alert({
                    title: "Errore: Logout",
                    message: e.toString(),
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
    global.tempPos = false;

    if (args.android) {
        console.log("Suspend: " + args.android);
    } else if (args.ios) {
        console.log("Suspend: " + args.ios);
    }
});


application.run({ moduleName: "app-root" });
