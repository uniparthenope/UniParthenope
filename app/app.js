/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/
const application = require("tns-core-modules/application");
const appSettings = require("application-settings");

application.run({ moduleName: "app-root" });
global.url = "http://museonavale.uniparthenope.it:8080/api/uniparthenope/";
global.isConnected = false;
global.updatedExam = false;
global.encodedStr = "";

global.freqExams = [];
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

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
