const observableModule = require("tns-core-modules/data/observable");

let page;
let viewModel;

exports.onNavigatingTo = function (args) {
    page = args.object;

    viewModel = observableModule.fromObject({});

    page.getViewById("title").text = page.navigationContext.title;
    page.getViewById("body").html = page.navigationContext.body;

    page.bindingContext = viewModel;
}