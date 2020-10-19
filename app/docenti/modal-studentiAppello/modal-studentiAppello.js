const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const appSettings = require("tns-core-modules/application-settings");
require("nativescript-accordion");

let closeCallback;
let viewModel;

let context;
let page;
let students;
let loading;

let cdsId;
let appId;
let adId;

function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
    page = args.object;

    students = new ObservableArray();
    viewModel = observableModule.fromObject({
        students: students,
    });

    cdsId = context.cdsId;
    appId = context.appId;
    adId = context.adId;

    page.getViewById("title").text = context.data;
    loading = page.getViewById("activityIndicator");

    listStudent();
    page.bindingContext = viewModel;
}

function listStudent(){
    let url = global.url + "professor/getStudentList/" + cdsId + "/" + adId + "/" + appId;
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
            console.log(result[i]);
            console.log(result[i].matricola);
            students.push({
                "username": result[i].userId,
                "matricola": result[i].matricola
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
            title: "Errore: Modal appelli docenti",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}
exports.onShownModally = onShownModally;

