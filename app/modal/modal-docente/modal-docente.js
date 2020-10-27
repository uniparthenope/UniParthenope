const observableModule = require("tns-core-modules/data/observable");
const utilsModule = require("tns-core-modules/utils/utils");
require("nativescript-accordion");
let email = require("nativescript-email");
let phone = require( "nativescript-phone" );
const modalViewModule = "modal/modal-ricevimento/modal-ricevimento";
let closeCallback;

let context;
let page;

function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
    page = args.object;
    page.getViewById("nome").text = context.nome;
    page.getViewById("ruolo").text = context.ruolo +" "+ context.settore;

    page.getViewById("telefono").text = context.telefono;
    page.getViewById("email").text = context.mail;
    page.getViewById("note").text = context.notes;
    page.getViewById("bio").text = context.biography;
    page.getViewById("curr").text = context.curriculum;
    page.getViewById("pub").text = context.pubblications;

    console.log(context.curriculum)




    page.bindingContext = observableModule.fromObject(context);


}
exports.ontap_ricevimento = function(){
    const adLogId = { nome: "test"};
    page.showModal(modalViewModule, adLogId, false);
};
exports.ontap_scheda = function(){
    utilsModule.openUrl(context.url);
};
exports.ontap_phone = function(){
    phone.dial(context.telefono,true);
    console.log("Chiamo...");
};
exports.ontap_email = function(){
    email.compose({
        subject: '',
        body: '\n\nSent with UniParthenope App',
        to: [context.mail]
    }).then(
        function() {
            console.log("Email composer closed");
        }, function(err) {
            console.log("Error: " + err);
        });
};
exports.onShownModally = onShownModally;
