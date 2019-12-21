const observableModule = require("tns-core-modules/data/observable");
const dialogs = require("tns-core-modules/ui/dialogs");
const httpModule = require("tns-core-modules/http");
const utilsModule = require("tns-core-modules/utils/utils");
require("nativescript-accordion");

let closeCallback;

let context;

function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
    const page = args.object;


    page.bindingContext = observableModule.fromObject(context);


}

exports.onShownModally = onShownModally;
