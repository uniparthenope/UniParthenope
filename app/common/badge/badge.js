const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
let BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
let barcodescanner = new BarcodeScanner();
const fileSystemModule = require("tns-core-modules/file-system");
const timerModule = require("tns-core-modules/timer");

let interval = 3;
let timer_id = 0;
let page;
let viewModel;
let sideDrawer;
let zoom = false;
let loading;

function setTitle(){
    page.getViewById("badge_title").text = appSettings.getString("badgeButton","UniParthenope Card");
}

function choseBackground(page){
    let code = appSettings.getString("facCod");
    console.log(code);

    if (code === "D1" || code === "D6"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(11, 114, 181,0.8)";
    }
    else if (code === "D2" || code === "D7"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(119, 72, 150,0.8)";
    }
    else if (code === "D3"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(36, 36, 36,0.8)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(0, 167, 84,0.8)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Acton.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(221, 108, 166,0.8)";
    }
    else{
        page.getViewById("back_image").backgroundImage = "~/images/background2.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(30, 50, 88,1)";
    }
}

function getQr(){
    loading.visibility = "visible";
    page.getViewById("my_qr").backgroundImage = "~/images/qr_test.jpg";
    timerModule.clearInterval(timer_id);
    if(app.android){
        let data = new Date();
        const filePath = fileSystemModule.path.join(fileSystemModule.knownFolders.currentApp().path, "qrCode-" + data.getTime() + ".png");

        httpModule.getFile({
            "url": global.url_general + "Badges/v2/generateQrCode",
            "method": "GET",
            headers: {
                "Content-Type" : "image/png",
                "Authorization" : "Basic "+ global.encodedStr,
                "Token-notification": global.notification_token
            }
        }, filePath).then((source) => {
            page.getViewById("my_qr").backgroundImage = source.path;
            let actualTime = new Date();
            getRemainingTime(actualTime);
            loading.visibility = "collapsed";
        }, (e) => {
            console.log("Error", e);
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "QR-Code Error!",
                message: e.toString(),
                okButtonText: "OK"
            });
        });
    }
    if(app.ios){
        httpModule.getFile({
            "url": global.url_general + "Badges/v2/generateQrCode",
            "method": "GET",
            headers: {
                "Content-Type" : "image/png",
                "Authorization" : "Basic "+ global.encodedStr,
                "Token-notification": global.notification_token
            },
            "dontFollowRedirects": false
        }).then((source) => {
            page.getViewById("my_qr").backgroundImage = source.path;
            loading.visibility = "collapsed";
            let actualTime = new Date();
            getRemainingTime(actualTime);
        }, (e) => {
            console.log("Error", e);
            loading.visibility = "collapsed";
            dialogs.alert({
                title: "QR-Code Error!",
                message: e.toString(),
                okButtonText: "OK"
            });
        });
    }
}

function getPIC(personId, value){
    let url;
    switch (value) {
        case 0:
            url = global.url + "general/image/"+ personId;
            break;

        case 1:
            url = global.url + "general/image_prof/"+ personId;
            break;
    }

    httpModule.getFile({
        "url": url,
        "method": "GET",
        headers: {
            "Content-Type" : "image/jpg",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((source) => {
        page.getViewById("my_img").backgroundImage = source["path"];
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Errore: Badge getPic",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

function getRemainingTime(actualData) {
    timer_id = timerModule.setInterval(()=>{
        let now = new Date();
        now.setMinutes(now.getMinutes() - interval);
        let actual_time = new Date(actualData.getFullYear() - now.getFullYear(),
            actualData.getMonth() - now.getMonth(),
            actualData.getDate() - now.getDate(),
            actualData.getHours() - now.getHours(),
            actualData.getMinutes() - now.getMinutes(),
            actualData.getSeconds() - now.getSeconds());
        //page.getViewById("timer").text = actual_time.getMinutes() +":"+ actual_time.getSeconds();
        //console.log(actual_time.getMinutes() +":"+ actual_time.getSeconds());

        if(actual_time.getMinutes() === 0 && actual_time.getSeconds()===0){
            console.log("STOP!")
            getQr();
        }

    },1000)
}

exports.onNavigatingTo = function(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    choseBackground(page);
    setTitle();
    loading = page.getViewById("activityIndicator");
    getQr();
    console.log(appSettings.getString("grpDes"));
    if (appSettings.getString("grpDes") === "Studenti"){

        getPIC(appSettings.getNumber("persId",0), 0);
        page.getViewById("name").text = appSettings.getString("nome","");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("matricola").text = appSettings.getString("matricola","");
        page.getViewById("role").text = appSettings.getString("grpDes","").toUpperCase();
        page.getViewById("depart").text = appSettings.getString("facDes","").toUpperCase();
    }
    else if (appSettings.getString("grpDes") === "Docenti"){

        getPIC(appSettings.getNumber("idAb",0), 1);
        page.getViewById("name").text = appSettings.getString("nome","");
        page.getViewById("surname").text = appSettings.getString("cognome","");
        page.getViewById("my_img").backgroundImage = url;
        page.getViewById("role").text = appSettings.getString("grpDes","").toUpperCase();
        page.getViewById("matricola").text = appSettings.getString("matricola","");
        page.getViewById("roleID").text = appSettings.getString("settCod","");
        page.getViewById("depart").text = appSettings.getString("facDes","").toUpperCase();
    }
    else if (appSettings.getString("grpDes") === "PTA"){

        getPIC(appSettings.getNumber("persId"), 0);
        page.getViewById("name").text = appSettings.getString("nome","");
        page.getViewById("surname").text = appSettings.getString("cognome","");
        page.getViewById("matricola").text = appSettings.getString("matricola","");
        page.getViewById("role").text = appSettings.getString("grpDes","").toUpperCase();
    }
    else if (appSettings.getString("grpDes") === "Ristorante"){
        console.log("BADGE RISTORATORE");
        //getPIC(appSettings.getNumber("persId"), 0);
        page.getViewById("name").text = appSettings.getString("nome","");
        page.getViewById("surname").text = appSettings.getString("cognome","");
        page.getViewById("matricola").text = appSettings.getString("matricola","");
        page.getViewById("mat_label").text = "NOME RISTORANTE";
        page.getViewById("role").text = appSettings.getString("grpDes","").toUpperCase();
    }
    else {
        console.log(appSettings.getNumber("persId"));

        getPIC(appSettings.getNumber("persId"), 0);
        page.getViewById("name").text = appSettings.getString("nome","");
        page.getViewById("surname").text = appSettings.getString("cognome","");
        page.getViewById("matricola").text = appSettings.getString("matricola","");
        page.getViewById("role").text = appSettings.getString("grpDes","").toUpperCase();
    }



    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.tap_zoom = function(){
    zoom = !zoom;

    if (zoom){
        page.getViewById("stack_1").visibility = "collapsed";
        page.getViewById("stack_2").visibility = "collapsed";
        page.getViewById("stack_3").visibility = "collapsed";
    }
    else{
        page.getViewById("stack_1").visibility = "visible";
        page.getViewById("stack_2").visibility = "visible";
        page.getViewById("stack_3").visibility = "visible";
    }
};

exports.tap_reloadQR = function(){
    getQr();
};

exports.tap_scanQR = function(){
    let count = 0;

    barcodescanner.scan({
        formats: "QR_CODE, EAN_13, CODE_128",
        cancelLabel: "Scansionare QR-Code per ottenere informazioni.", // iOS only, default 'Close'
        cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
        message: "Scan QR code", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
        preferFrontCamera: false,     // Android only, default false
        showFlipCameraButton: false,   // default false
        showTorchButton: false,       // iOS only, default false
        torchOn: false,               // launch with the flashlight on (default false)
        resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text// Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
        beepOnScan: true,             // Play or Suppress beep on scan (default true)
        openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
        closeCallback: () => {
            //console.log("Scanner closed @ " + new Date().getTime());
        },
        continuousScanCallback: function (result) {
            //count++;
            console.log(result.format + ": " + result.text + " (count: " + count + ")");
            barcodescanner.message = "SCANNED";
            
            httpModule.request({
                url : global.url_general + "Badges/v2/sendRequestInfo",
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                },
                content : JSON.stringify({
                    myToken : global.notification_token,
                    receivedToken: result.text
                })
            }).then((response) => {
                const result = response.content.toJSON();
                console.log(result);

                let message;
                if (response.statusCode === 500 || response.statusCode === 403)
                    message = "Error: " + result.errMsg;
                else
                    message = result.message;


                    // Inserire risposta nell'alert (Nome,Cognome,Email,Matr e Autorizzazione)
                    dialogs.alert({
                        title: "Richiesta Informazioni",
                        message: message,
                        okButtonText: "OK"
                    }).then(function (){
                        barcodescanner.stop();
                    });
            }, error => {
                console.error(error);
            });
        },
    }).then(
        function (result) {
            console.log("--- scanned: " + result.text);
            
        },
        function (errorMessage) {
            console.log("No scan. " + errorMessage);
        }
    );

};

exports.onNavigatedFrom = function() {
    timerModule.clearInterval(timer_id);
}
