const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
let BarcodeScanner = require("nativescript-barcodescanner").BarcodeScanner;
let barcodescanner = new BarcodeScanner();
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const utilsModule = require("tns-core-modules/utils/utils");
let base64= require('base-64');
let utf8 = require('utf8');
const appSettings = require("tns-core-modules/application-settings");



require("nativescript-accordion");

let closeCallback;
let viewModel;

let context;
let page;
let students;
let id;
let loading;

function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
    page = args.object;
    students = new ObservableArray();
    viewModel = observableModule.fromObject({
        students: students,
    });
    id = context.id;
    page.getViewById("title").text = context.data;
    loading = page.getViewById("activityIndicator");

    listStudent();
    page.bindingContext = viewModel;

    //page.bindingContext = observableModule.fromObject(context);


}

function listStudent(){
    let url = global.url_general + "GAUniparthenope/v1/getStudentsList/" + id;
    loading.visibility = "visible";
    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();
        if(result.length === 0)
            loading.visibility = "collapsed";

        for (let i=0; i<result.length; i++){
            console.log(result[i].matricola);
            students.push({
                "username": result[i].username,
                "matricola": result[i].matricola,
                "posto": "--"
            });
            students.sort(function (orderA, orderB) {
                let nameA = orderA.matricola;
                let nameB = orderB.matricola;
                return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
            });
            loading.visibility = "collapsed";
        }


    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Errore: Modal lezioni docenti",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
exports.onShownModally = onShownModally;

exports.tap_scan = function(){
    let count = 0;
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
            let byte = base64.decode(result.text);
            let qr = utf8.decode(byte,'ascii');
            qr = qr.split(":");

            httpModule.request({
                url : global.url_general + "GAUniparthenope/v1/ReservationByProf",
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : "Basic "+ global.encodedStr
                },
                content : JSON.stringify({
                    id_lezione : id,
                    username: qr[0],
                    matricola: qr[3],
                    aaId: appSettings.getString("aaId","2019")
                })
            }).then((response) => {
                const result = response.content.toJSON();
                console.log(result);

                let message;
                if (response.statusCode === 500)
                    message = "Error: " + result["errMsg"];
                else{
                    message = result["status"];
                    students.push({
                        "username": qr[0],
                        "matricola": qr[3],
                        "posto": "--"
                    });
                }

                // Inserire risposta nell'alert (Nome,Cognome,Email,Matr e Autorizzazione)
                dialogs.alert({
                    title: "Result:",
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

