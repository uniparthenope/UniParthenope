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
const appSettings = require("application-settings");

application.run({ moduleName: "app-root" });
global.url = "http://museonavale.uniparthenope.it:8080/api/uniparthenope/";
global.isConnected = false;
global.updatedExam = false;
global.encodedStr = "";
global.tempNum = 0;
global.myform = "";
global.username = "";
global.data_today;

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
};

global.saveCarr = function(result)
{
    appSettings.setString("cdsDes",result.cdsDes);
    appSettings.setNumber("cdsId",result.cdsId);
    appSettings.setNumber("matId",result.matId);
    appSettings.setNumber("stuId",result.stuId);
    appSettings.setString("matricola",result.matricola);

};

global.getAllBadge = function(page)
{
    let calendar = appSettings.getNumber("calendarBadge",0);
    let exams = appSettings.getNumber("examsBadge",0);
    let food = appSettings.getNumber("foodBadge",0);
    let trasport = appSettings.getNumber("trasportBadge",0);
    let alert = appSettings.getNumber("alertBadge",0);

    if (calendar === 0)
        {
            page.getViewById("badge_Calendar").visibility = "collapsed";

        }
    else
        {
            page.getViewById("badge_Calendar").visibility = "visible";
            page.getViewById("text_badgeCalendar").text = calendar;
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

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
