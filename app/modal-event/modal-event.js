const observableModule = require("tns-core-modules/data/observable");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
require("nativescript-accordion");
const ObservableArray = require("data/observable-array").ObservableArray;
const Observable = require("data/observable");
let closeCallback;

function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;

    const page = args.object;
    page.bindingContext = observableModule.fromObject(context);
    let start = ""+ control_data(context.start_date.getHours()) + ":"+  control_data(context.start_date.getMinutes());
    let end = ""+  control_data(context.end_date.getHours()) + ":"+  control_data(context.end_date.getMinutes());
    page.getViewById("event_text").text = context.title;
    page.getViewById("event_date_start").text = start;
    page.getViewById("event_date_end").text = end;


}
function control_data(data){
    if (data<10)
        return "0"+data;
    else
        return data;
}
exports.onShownModally = onShownModally;
