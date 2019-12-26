const observableModule = require("tns-core-modules/data/observable");
const utilsModule = require("tns-core-modules/utils/utils");
const platformModule = require("tns-core-modules/platform");
require("nativescript-accordion");


let closeCallback;

let context;
let page;

function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
    page = args.object;

    //page.bindingContext = observableModule.fromObject(context);

}

exports.ontap_download = function(){
    if (platformModule.isAndroid){
        utilsModule.openUrl("market://details?id=it.meteo.uniparthenope");
    }
};
exports.onShownModally = onShownModally;
