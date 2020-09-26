const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const modalViewModule = "modal-covidalert/modal-covidalert";


let page;
let viewModel;
let sideDrawer;
let loading;
let index;
let my_status = "";
let status = ["Non Definito","A Distanza","In Presenza"];
let isStudent = false;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({
        status: status
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");

    getSelfCert();

    if (appSettings.getString("grpDes") === "Studenti"){
        isStudent = true;
        getAccess();
        page.getViewById("scelta_accesso").visibility = "visible";

    }
    else{
        isStudent = false;
        page.getViewById("scelta_accesso").visibility = "collapsed";

    }

    page.bindingContext = viewModel;
}

function onListPickerLoaded(fargs) {
    const listPickerComponent = fargs.object;
    listPickerComponent.on("selectedIndexChange", (args) => {
        const picker = args.object;
        index = picker.selectedIndex;
        let accessIndex = convertIndex(appSettings.getString("accessType","undefined"));


        if(accessIndex !== picker.selectedIndex){
            saveInfo();
        }
        //console.log(`index: ${picker.selectedIndex}; item" ${status[picker.selectedIndex]}`);
    });
}
exports.onListPickerLoaded = onListPickerLoaded;

function getAccess(){
    loading.visibility = "visible";

    httpModule.request({
        url: global.url_general + "Access/v1/classroom",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        appSettings.setString("accessType", result.accessType);

        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"

            })
        }
        else
        {
            let lp = page.getViewById("listpicker");
            my_status = result.accessType;

            if (result.accessType === "presence"){
                page.getViewById("btn-prenotazioni").visibility = "visible";
                lp.selectedIndex = 2;

            }

            else if(result.accessType === "distance"){
                page.getViewById("btn-prenotazioni").visibility = "collapsed";

                lp.selectedIndex = 1;
            }

            else {
                page.getViewById("alert1").visibility = "visible";
                page.getViewById("btn-prenotazioni").visibility = "collapsed";

                lp.selectedIndex = 0;
            }


            loading.visibility = "collapsed";
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

function getSelfCert(){
    loading.visibility = "visible";

    httpModule.request({
        url: global.url_general + "Access/v1/covidStatement",
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        console.log(result);
        appSettings.setBoolean("covidStatement", result.covidStatement);


        if (response.statusCode === 401 || response.statusCode === 500) {
            dialogs.alert({
                title: "Errore Server!",
                message: result,
                okButtonText: "OK"

            })
        }
        else
        {
            let sw = page.getViewById("switch_sondaggio");
            if(result.covidStatement){

                global.my_selfcert = true;
                appSettings.setBoolean("selfcert", true);
                sw.checked = "true";
            }
            else{
                global.my_selfcert = false;
                appSettings.setBoolean("selfcert", false);
                sw.checked = "false";
            }

            loading.visibility = "collapsed";
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

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}
function saveInfo(){
    if(isStudent){
        if(index === 0){
            setAccess("undefined");
        }
        else if(index === 1){
            setAccess("distance");
        }
        else if(index === 2){
            if (global.my_selfcert){
                setAccess("presence");
            }
            else{
                dialogs.confirm({
                    title: "Attenzione!",
                    message: "Per poter selezionare il tipo di accesso in PRESENZA bisogna prima accettare l'Autocertificazione Obbligatoria!",
                    okButtonText: "OK"
                }).then(function (){
                    const nav =
                        {
                            moduleName: "access/access",
                            clearHistory: true
                        };
                    page.frame.navigate(nav);
                });
            }
        }
    }
    else{
        setSelfCert(global.my_selfcert);
    }
}

exports.ontap_save = function(){
    if(isStudent){
        if(index === 0){
            setAccess("undefined");
        }
        else if(index === 1){
            setAccess("distance");
        }
        else if(index === 2){
            if (global.my_selfcert){
                setAccess("presence");
            }
            else{
                dialogs.confirm({
                    title: "Attenzione!",
                    message: "Per poter selezionare il tipo di accesso in PRESENZA bisogna prima accettare l'Autocertificazione Obbligatoria!",
                    okButtonText: "OK"
                }).then(function (){
                    const nav =
                        {
                            moduleName: "access/access",
                            clearHistory: true
                        };
                    page.frame.navigate(nav);
                });
            }
        }
    }
    else{
        setSelfCert(global.my_selfcert);
    }
};

function setSelfCert(flag){
    loading.visibility = "visible";
    httpModule.request({
        url: global.url_general + "Access/v1/covidStatement",
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        },
        content: JSON.stringify({
            covidStatement: flag
        })
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "Errore: Access ontapSave",
                message: result.errMsg,
                okButtonText: "OK"
            });
        }
        else {
            loading.visibility = "collapsed";
            dialogs.confirm({
                title: "Success",
                message: "Modifica effettuata!",
                okButtonText: "OK"
            }).then(function () {
                const nav =
                    {
                        moduleName: "access/access",
                        clearHistory: true
                    };
                page.frame.navigate(nav);
            });
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: Access",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function setAccess(scelta){
    loading.visibility = "visible";
    httpModule.request({
        url: global.url_general + "Access/v1/classroom",
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic " + global.encodedStr
        },
        content: JSON.stringify({
            accessType: scelta
        })
    }).then((response) => {
        const result = response.content.toJSON();

        if (response.statusCode === 401 || response.statusCode === 500) {
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "Errore: Access ontapSave",
                message: result.errMsg,
                okButtonText: "OK"

            });
        }
        else
        {
            setSelfCert(global.my_selfcert);
        }
    },(e) => {
        dialogs.alert({
            title: "Errore: Access",
            message: e.toString(),
            okButtonText: "OK"
        });
    });

}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

function onSwitchLoaded_autocert(args) {
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;

        if(isChecked){
            const options = {
                context: "some context",
                closeCallback: () => {
                    saveInfo();
                    if(!global.my_selfcert)
                        page.getViewById("switch_sondaggio").checked = "false";
                },
                fullscreen: false
            };
            page.showModal(modalViewModule, options);


        }
        else{
            if(my_status !== "presence"){
                if(global.my_selfcert){
                    saveInfo();
                }
                global.my_selfcert = false;
                console.log("FALSO");
                appSettings.setBoolean("selfcert",false);
            }
            else{
                dialogs.confirm({
                    title: "Attenzione!",
                    message: "Per poter salvare il tipo di accesso in PRESENZA bisogna prima accettare l'Autocertificazione Obbligatoria!",
                    okButtonText: "OK"
                }).then(function (){
                    const nav =
                        {
                            moduleName: "access/access",
                            clearHistory: true
                        };
                    page.frame.navigate(nav);
                });
            }

        }
    });
}
exports.onSwitchLoaded_autocert = onSwitchLoaded_autocert;

function convertIndex(accessType){
    if (accessType === "presence")
        return 2;
    else if (accessType === "distance")
        return 1;
    else
        return 0;
}

exports.goto_prenotazioni = function () {

    const nav =
        {
            moduleName: "lezioni/lezioni",
            clearHistory: false
        };
    page.frame.navigate(nav);
};