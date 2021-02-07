const observableModule = require("tns-core-modules/data/observable");
const ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;
const app = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");


let page;
let viewModel;
let sideDrawer;
let loading;
let calendar;
let event_calendar;

function convertData(data){
    let day = data[8]+data[9];
    let month = data[5]+data[6];
    let year = data[0]+data[1]+data[2]+data[3];
    let hour = data[11]+data[12];
    let min = data[14]+data[15];

    let d = new Date(year,month-1,day,hour,min);

    return d;
}

exports.onNavigatingTo = function (args) {
    page = args.object;

    event_calendar = new ObservableArray();
    viewModel = observableModule.fromObject({
        events:event_calendar
    });
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    loading = page.getViewById("activityIndicator");
    loading.visibility = "visible";
    getHistory();

    page.bindingContext = viewModel;
}

function getHistory(){
    let url = global.url_general + "Badges/v1/ScanHistory";
    console.log(url);
    httpModule.request({
        url: url,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        const result = response.content.toJSON();

        //console.log(result);
        calendar = page.getViewById("cal");

        if (response.statusCode === 200){
            for (let i=0; i<result.length; i++){
                let title;
                let color;

                if (result[i]["result"] === "OK") {
                    title = "[" + result[i]["tablet"] + "] " + result[i]["timestamp"].split(" ")[1] + " - Autorizzato";
                    color = new Color.Color("#0F9851");
                }
                else{
                    title = "[" + result[i]["tablet"] + "] " + result[i]["timestamp"].split(" ")[1] + " - " + result[i]["result"];
                    color = new Color.Color("orange");
                }
                let data = convertData(result[i]["timestamp"]);
                let event = new calendarModule.CalendarEvent(title, data, data, true,
                    color);
                event_calendar.push(event);

            }
        }

        loading.visibility = "collapsed";
    });
}

exports.onDrawerButtonTap = function() {
    sideDrawer.showDrawer();
}