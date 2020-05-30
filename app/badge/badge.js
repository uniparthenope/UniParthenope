const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
var BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
var barcodescanner = new BarcodeScanner();

let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    choseBackground(page);
    getQr();
    console.log("PERSID= "+appSettings.getNumber("persId"))
    if (appSettings.getString("grpDes") === "Studenti"){

        getPIC(appSettings.getNumber("persId"), 0);
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
    }
    else if (appSettings.getString("grpDes") === "Docenti"){

        getPIC(appSettings.getNumber("idAb"), 1);
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("my_img").backgroundImage = url;
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("roleID").text = appSettings.getString("settCod");
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
    }



    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    page.frame.goBack();
}

function choseBackground(page){
    let code = appSettings.getString("facCod");
    console.log(code);

    if (code === "D1" || code === "D6"){
        page.getViewById("back_image").backgroundImage = "~/images/image_PARISI.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(11, 114, 181,0.9)";
    }
    else if (code === "D2" || code === "D7"){
        page.getViewById("back_image").backgroundImage = "~/images/image_PARISI.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(119, 72, 150,0.9)";
    }
    else if (code === "D3"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(36, 36, 36,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(0, 167, 84,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_ACTON.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(221, 108, 166,0.9)";
    }
    else{
        page.getViewById("back_image").backgroundImage = "~/images/image1.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(34, 56, 79,0.9)";
    }
}

function getQr(){
    httpModule.getFile({
        "url": global.url + "general/qrCode",
        "method": "GET",
        headers: {
            "Content-Type" : "image/png",
            "Authorization" : "Basic "+ global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        page.getViewById("my_qr").backgroundImage = source["path"];
    }, (e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Autenticazione Fallita!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
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
        },
        "dontFollowRedirects": true
    }).then((source) => {
        page.getViewById("my_img").backgroundImage = source["path"];
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Error",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}
exports.tap_scanQR = function(){
   /* const nav =
        {
            // moduleName:"docenti/docenti-appelli/docenti-appelli"
            moduleName: "badge/scanqr"
        };
    page.frame.navigate(nav);*/
    barcodescanner.scan({
        formats: "QR_CODE, EAN_13, CODE_128",
        cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
        cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
        message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
        preferFrontCamera: false,     // Android only, default false
        showFlipCameraButton: false,   // default false
        showTorchButton: false,       // iOS only, default false
        torchOn: false,               // launch with the flashlight on (default false)
        resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text// Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
        beepOnScan: true,             // Play or Suppress beep on scan (default true)
        openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
        closeCallback: () => {
            //console.log("Scanner closed @ " + new Date().getTime());
        }
    }).then(
        function (result) {
            console.log("--- scanned: " + result.text);
            // Estrarre dal JSON le info
            // Inviare richiesta API con codice scansionato
            //
            setTimeout(function () {
                // Inserire risposta nell'alert (Nome,Cognome,Email,Matr e Autorizzazione)
                alert({
                    title: "Scan result",
                    message: "Format: " + result.format + ",\nValue: " + result.text,
                    okButtonText: "OK"
                });

            }, 500);
        },
        function (errorMessage) {
            console.log("No scan. " + errorMessage);
        }
    );

};
exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;