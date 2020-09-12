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

            httpModule.request({
                url: global.url_general + "Access/v1/covidStatementMessage",
                method: "GET",
            }).then((response) => {
                const result = response.content.toJSON();

                if (response.statusCode === 401 || response.statusCode === 500) {
                    dialogs.alert({
                        title: "Errore Server!",
                        message: result,
                        okButtonText: "OK"

                    }).then();
                }
                else{
                    //console.log(result.title);
                    page.getViewById("title").text = result.title;
                    page.getViewById("body").html = result.body;

                }
            },(e) => {
                dialogs.alert({
                    title: "Errore: COVID Message",
                    message: e.toString(),
                    okButtonText: "OK"
                });
            });


    page.bindingContext = observableModule.fromObject(context);


}
exports.onShownModally = onShownModally;

exports.tap_yes = function (args) {
    global.my_selfcert = true;
    args.object.closeModal();

};

exports.tap_no = function (args) {
    global.my_selfcert = false;
    args.object.closeModal();

};
