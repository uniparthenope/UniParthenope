/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.

appSettings.setString("aa_accad", result.aa_accad);
appSettings.setString("sessione", result.curr_sem);
appSettings.setString("semestre", result.semestre);
appSettings.setNumber("pianoId", result.pianoId);
*/
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
/*
"nome" : result[i].nome,
"codice" : result[i].codice,
"annoId" : result[i].annoId,
"adsceId" : result[i].adsceId,
"adId" : result[i].adId,
"CFU" : result[i].CFU,
semstre
prof
orario aula []
*/
global.myExams = [];

global.saveInfo = function(result)
{
    appSettings.setString("codFis",result.user.codFis);
    appSettings.setString("nome",result.user.firstName);
    appSettings.setString("cognome",result.user.lastName);
    appSettings.setString("grpDes",result.user.grpDes);
    global.authToken= result.authToken;
    console.log("SAVE_INFO CF= "+result.user.codFis);
    console.log("SAVE_INFO Name= "+result.user.firstName);
    console.log("SAVE_INFO Surname= "+result.user.lastName);
    console.log("SAVE_INFO grpDes= "+result.user.grpDes);
    console.log("SAVE_INFO AuthToken= "+global.authToken);
};

global.saveCarr = function(result)
{
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

global.getAllBadge = function(page)
{
    let calendar = appSettings.getNumber("calendarBadge",0);
    let exams = appSettings.getNumber("examsBadge",0);
    let food = appSettings.getNumber("foodBadge",0);
    let trasport = appSettings.getNumber("trasportBadge",0);
    let appello = appSettings.getNumber("appelloBadge",0);

    if (calendar === 0)
        {
            page.getViewById("badge_Calendar").visibility = "collapsed";

        }
    else
        {
            page.getViewById("badge_Calendar").visibility = "visible";
            page.getViewById("text_badgeCalendar").text = calendar;
        }
    if (appello === 0)
    {
        page.getViewById("badge_appello").visibility = "collapsed";

    }
    else
    {
        page.getViewById("badge_appello").visibility = "visible";
        page.getViewById("text_badgeAppello").text = appello;
    }

    if (exams === 0)
    {
        page.getViewById("badge_Courses").visibility = "collapsed";
    }
    else
    {
        page.getViewById("badge_Courses").visibility = "visible";
        page.getViewById("text_badgeCourses").text = exams;
    }

    if (food === 0)
    {
        page.getViewById("badge_Food").visibility = "collapsed";
    }
    else
    {
        page.getViewById("badge_Food").visibility = "visible";
        page.getViewById("text_badgeFood").text = food;
    }


};


application.on(application.exitEvent, (args) => {
    if (args.android) {
        global.tempPos = false;
        if(global.encodedStr !== " "){
            let url = global.url + "logout/" + global.encodedStr + "/" + global.authToken;
            httpModule.request({
                url: url,
                method: "GET"
            }).then((response) => {
                const result = response.content.toJSON();

                if(result.status_code == 200){
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

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
