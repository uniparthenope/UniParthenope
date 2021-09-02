const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const modalViewModule = "modal/modal-covidalert/modal-covidalert";
let BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
let barcodescanner = new BarcodeScanner();
const frame = require("tns-core-modules/ui/frame");
let toasty = require("nativescript-toasty");


let page;
let viewModel;
let sideDrawer;
let loading;

//let index;
//let my_status = "";
//let status = [L('not_def'),L('distance'),L('presence')];
//let _status = ["undefined", "distance", "presence"];
//let isStudent = false;


exports.onNavigatingTo = function (args) {
    page = args.object;
    viewModel = observableModule.fromObject({
        //status: status
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");
    global.services = [];

    let grpId = appSettings.getNumber("grpId",7);
    if (grpId !== 7 && grpId !== 99)
        getGPStatus();
    else{
        let pren = page.getViewById("btn-prenotazioni");
        page.bindingContext = viewModel;
        pren.visibility = "collapsed";
    }
    //getSelfCert();
    /*
    let grpDes = appSettings.getString("grpDes","");

    if (grpDes === "Docenti" || grpDes === "PTA" || grpDes === "Ristorante" || grpDes === ""){
        isStudent = false;
        page.getViewById("scelta_accesso").visibility = "collapsed";
        getAllServices();

    }
    else{
        isStudent = true;
        getAccess();
        page.getViewById("scelta_accesso").visibility = "visible";
    }
    */
}

exports.onDrawerButtonTap = function () {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}


exports.goto_prenotazioni = function () {
    const nav =
        {
            moduleName: "studenti/lezioni/lezioni",
            clearHistory: false
        };
    page.frame.navigate(nav);
};

exports.goto_prenot_serv = function () {

    const nav =
        {
            moduleName: "common/prenotazione-servizi/prenotazione-servizi",
            clearHistory: false
        };
    page.frame.navigate(nav);
};

exports.goto_history = function () {

    const nav =
        {
            moduleName: "common/history/history",
            clearHistory: false
        };
    page.frame.navigate(nav);
};
function getGPStatus(){
    let status = page.getViewById("gp_status");
    let exp = page.getViewById("gp_exp");
    let exp_date = page.getViewById("gp_exp_date");
    let gp_btn = page.getViewById("btn-scangp");

    let url = global.url_general + "Badges/v3/greenPassStatus";
    loading.visibility = "visible";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        if(response.statusCode === 200){
            let _response = response.content.toJSON();
            loading.visibility = "collapsed";
            //console.log(_response);
            if(_response.autocertification){
                exp.visibility = "visible";
                status.text = L('gp_ok');
                status.color = "green";
                exp_date.text = _response.expiry;
                exp_date.color = "green";
                gp_btn.visibility = "collapsed";
            }
            else {
                exp.visibility = "collapsed";
                status.text = L('gp_bad');
                status.color = "red";
                //Show button
                if(appSettings.getNumber("grpId") !== 99)
                    gp_btn.visibility = "visible";
            }
            page.bindingContext = viewModel;
        }

    });

}
exports.scan_gp = function()
{
    let loading_gp = page.getViewById("activityIndicator_gp");
    loading_gp.visibility = "visible";
    let count = 0;
    barcodescanner.scan({
        formats: "QR_CODE, EAN_13, CODE_128",
        cancelLabel: "EXIT.", // iOS only, default 'Close'
        cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
        message: 'SCANSIONE GREEN PASS\n\n\nAvvicinare il GreenPass in corso di validità alla fotocamera del dispositivo ed attendere il beep.\n\nUniversità degli Studi di Napoli "Parthenope"', // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
        //message: "Scan QR",
        preferFrontCamera: false,     // Android only, default false
        showFlipCameraButton: true,   // default false
        showTorchButton: false,       // iOS only, default false
        torchOn: false,               // launch with the flashlight on (default false)
        resultDisplayDuration: 0,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text// Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
        beepOnScan: true,             // Play or Suppress beep on scan (default true)
        openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
        reportDuplicates: false

    }).then(
        function(result) {
            httpModule.request({
                url : global.url_general + "Badges/v3/checkGreenPassMobile",
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                },
                content : JSON.stringify({
                    token_GP : result.text
                    //id_tablet : appSettings.getString("id_tab","NA")
                })
            }).then((response) => {
                const result = response.content.toJSON();
                loading_gp.visibility = "collapsed";


                if(response.statusCode === 500){
                    new toasty.Toasty({"text": result.message,
                        position: toasty.ToastPosition.CENTER,
                        duration: toasty.ToastDuration.LONG,
                        yAxisOffset: 100,
                        backgroundColor: result.color}).show();
                }
                else {
                    new toasty.Toasty({"text": result.message,
                        position: toasty.ToastPosition.CENTER,
                        duration: toasty.ToastDuration.LONG,
                        yAxisOffset: 100,
                        backgroundColor: result.color}).show();

                    //barcodescanner.stop();
                    //frame.Frame.topmost().goBack();
                    //frame.Frame.topmost().navigate(nav);
                    getGPStatus();
                }

            }, error => {
                console.error(error);
            });
        },
        function(error) {
            console.log("No scan: " + error);
        }
    );

    }
/*
// OLD CODE FOR SELF-CERTIFICATION ACCESS
exports.onSwitchLoaded_autocert = function (args) {
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;

        if(isChecked){
            const options = {
                context: "some context",
                closeCallback: () => {
                    setSelfCert(global.my_selfcert);
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
                    global.my_selfcert = false;
                    console.log("FALSO");
                    appSettings.setBoolean("selfcert",false);
                    setSelfCert(global.my_selfcert);
                }
                global.my_selfcert = false;
                console.log("FALSO");
                appSettings.setBoolean("selfcert",false);
            }
            else{
                dialogs.confirm({
                    title: L('warning'),
                    message: L('access_mess'),
                    okButtonText: "OK"
                }).then(function (){
                    const nav =
                        {
                            moduleName: "common/access/access",
                            clearHistory: true
                        };
                    page.frame.navigate(nav);
                });
            }

        }
    });
}

exports.onListPickerLoaded = function (fargs) {
    const listPickerComponent = fargs.object;
    listPickerComponent.on("selectedIndexChange", (args) => {
        const picker = args.object;
        index = picker.selectedIndex;
        let accessIndex = convertIndex(appSettings.getString("accessType","undefined"));


        if(accessIndex !== picker.selectedIndex){
            setAccess(_status[picker.selectedIndex]);
        }
        //console.log(`index: ${picker.selectedIndex}; item" ${status[picker.selectedIndex]}`);
    });
}


function convertIndex(accessType){
    if (accessType === "presence")
        return 2;
    else if (accessType === "distance")
        return 1;
    else
        return 0;
}

function getAllServices(){

    let url = global.url_general + "GAUniparthenope/v1/getTodayServices";
    //loading.visibility = "visible";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        global.services = [];
        global.services = response.content.toJSON();

        //loading.visibility = "collapsed";
    },(e) => {
        console.log("Error", e);
        //loading.visibility = "collapsed";

        dialogs.alert({
            title: "Errore: prenotazioni",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

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
            let grpDes = appSettings.getString("grpDes","");


            if (result.accessType === "presence"){
                page.getViewById("btn-prenotazioni").visibility = "visible";
                lp.selectedIndex = 2;

                if (grpDes === "Docenti" || grpDes === "Studenti" || grpDes === "Ricercatori" || grpDes === "PTA" || grpDes === ""){
                    page.getViewById("btn-servizi").visibility = "visible";
                    getAllServices();
                }
                else
                    page.getViewById("btn-servizi").visibility = "collapsed";
            }

            else if(result.accessType === "distance"){
                page.getViewById("btn-prenotazioni").visibility = "collapsed";
                page.getViewById("btn-servizi").visibility = "collapsed";

                lp.selectedIndex = 1;
            }

            else {
                page.getViewById("alert1").visibility = "visible";
                page.getViewById("btn-prenotazioni").visibility = "collapsed";
                page.getViewById("btn-servizi").visibility = "collapsed";

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
                page.getViewById("btn-servizi").visibility = "visible";

                sw.checked = "true";
            }
            else{
                global.my_selfcert = false;
                appSettings.setBoolean("selfcert", false);
                page.getViewById("btn-servizi").visibility = "collapsed";

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
                title: L('success'),
                message: "Modifica effettuata!",
                okButtonText: "OK"
            }).then(function () {
                const nav =
                    {
                        moduleName: "common/access/access",
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
            }).then(function () {
                const nav =
                    {
                        moduleName: "common/access/access",
                        clearHistory: true
                    };
                page.frame.navigate(nav);
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
 */