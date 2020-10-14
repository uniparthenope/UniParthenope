const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");
const modalViewModule = "modal-event/modal-event";


let new_id = [{id:"a",color:"#555555"},{id:"s",color:"#c47340"},{id:"b",color:"#824bc1"},{id:"c",color:"#4566c1"},{id:"t",color:"#a7f442"},{id:"O",color:"#f49b41"},{id:"Y",color:"#f44155"},
    {id:"z",color:"#41f4b2"}];
let page;
let viewModel;
let sideDrawer;
let calendar;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    calendar = page.getViewById("myCalendar");

    getTime();

    page.bindingContext = viewModel;
}

function getTime() {
    let url = global.url_general + "GAUniparthenope/v1/getEvents";
    httpModule.request({
            url: url,
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then((response) => {
            const result = response.content.toJSON();
            //console.log(result);
            if (response.statusCode === 401 || response.statusCode === 500)
            {
                dialogs.alert({
                    title: "Errore: Orari getTime",
                    message: result.errMsg,
                    okButtonText: "OK"
                }).then(
                );
            }
            else {
                let items = [];
                for (let i=0; i<result.length; i++)
                {
                    let title = result[i].description + "_\n" + result[i].course_name + "\n\n" + result[i].room.name+"\n" + result[i].room.description;

                    let data_inizio = convertData(result[i].start);
                    let data_fine = convertData(result[i].end);

                    let id = result[i].type;

                    let color = getColor(id);
                    //console.log(color);
                    let event = new calendarModule.CalendarEvent(title, data_inizio, data_fine, false, color);
                    items.push(event);
                }
                calendar.eventSource = items;

            }
            },(e) => {
            console.log("Error", e);
            dialogs.alert({
                title: "Errore: Orari",
                message: e.toString(),
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
    page.frame.goBack();
}
function getColor(id) {
    let color;
    for (let i=0; i<new_id.length; i++){
        if(new_id[i].id === id)
            color = new Color.Color(new_id[i].color);
    }
    return color;
}

exports.onDaySelected = function(args){
    const mainView = args.object;
    let complete = args.eventData.title;
    let title = complete.split("_")[0];
    let body = complete.split("_")[1];
    const context = { title: title,body:body, start_date: args.eventData.startDate, end_date: args.eventData.endDate, color: args.eventData.eventColor};

    mainView.showModal(modalViewModule, context, false);
};

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

function convertData(data){

    let day = data[8]+data[9];
    let month = data[5]+data[6];
    let year = data[0]+data[1]+data[2]+data[3];
    let hour = data[11]+data[12];
    let min = data[14]+data[15];

    let d = new Date(year,month-1,day,hour,min);

    return d;
}
