const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const calendarModule = require("nativescript-ui-calendar");
const Color = require("tns-core-modules/color");

let colors = ["#c47340","#4566c1","#824bc1","#a32d13","#382603","#fff766"];
let new_id = [{id:"M",color:"#555555"},{id:"Altro",color:"#c47340"},{id:"MQDA",color:"#824bc1"},{id:"Tirocini",color:"#4566c1"},{id:"Seminari",color:"#a7f442"},{id:"EVENTI",color:"#f49b41"},{id:"Master",color:"#f44155"},
    {id:"Congressi",color:"#41f4b2"}];
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
    let periodo = appSettings.getNumber("periodo_altri",3);
    let url = global.url + "orari/altriCorsi/" + periodo ;
    url = url.replace(/ /g, "%20");
    console.log(url);

    httpModule.request({
            url: url,
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then((response) => {
            const result = response.content.toJSON();
            //console.log(result);
            if (result.statusCode === 401 || result.statusCode === 500)
            {
                dialogs.alert({
                    title: "Errore Server!",
                    message: result_n.retErrMsg,
                    okButtonText: "OK"
                }).then(
                );
            }
            else {
                //console.log(result);
                let items = [];
                for (let i=0; i<result.length; i++)
                {
                    let title = result[i].titolo + "\n" + result[i].descrizione + "\n\n" + result[i].aula+"\n" + result[i].confermato;
                    let data_inizio = new Date(result[i].start_time);
                    let data_fine = new Date(result[i].end_time);
                    let id = result[i].id;
                    console.log(id);
                    //setId(id);
                    let color = getColor(id);
                    console.log(color);

                    let event = new calendarModule.CalendarEvent(title, data_inizio, data_fine, false, color);
                    items.push(event);
                }
                calendar.eventSource = items;

            }
            },(e) => {
            console.log("Error", e);
            dialogs.alert({
                title: "Errore Sincronizzazione Esami!",
                message: e,
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

function setId(id)
{
    let flag =false;
    let randomColor = Math.floor(Math.random()*16777215).toString(16);
    let color = new Color.Color("#" + randomColor);
    for (let i=0; i<new_id.length; i++){
        if(new_id[i].id === id)
            flag = true;

    }
    if (id === "M")
        color = new Color.Color("#555555");

    if (!flag){
        new_id.push({
            id : id,
            color: color
        });
    }
}

exports.onDaySelected = function(args){
    console.log(args.eventData);
    const mainView = args.object;

    const context = { title: args.eventData.title, start_date: args.eventData.startDate, end_date: args.eventData.endDate, color: args.eventData.eventColor};

    //mainView.showModal(modalViewModule, context, false);
};

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
