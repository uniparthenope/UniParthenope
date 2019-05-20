const app = require("tns-core-modules/application");
const frame = require("tns-core-modules/ui/frame");
const observableModule = require("tns-core-modules/data/observable");
const httpModule = require("tns-core-modules/http");
var base64= require('base-64');
var utf8 = require('utf8');

let viewModel;

function pageLoaded(args) {
    const page = args.object;
    viewModel = observableModule.fromObject({});
    page.bindingContext = viewModel;

}

exports.onTapLogin = function() {
    let sideDrawer = app.getRootView();
    let user = sideDrawer.getViewById("username").text;
    let pass = sideDrawer.getViewById("password").text;
    let url = "https://uniparthenope.esse3.cineca.it/e3rest/api/login";
    let indicator = sideDrawer.getViewById("activityIndicator");
    indicator.visibility = "visible";

    let token = user + ":" + pass;
    var bytes = utf8.encode(token);
    var encodedStr = base64.encode(bytes);


    console.log("Username: " + user);
    console.log("Password= " + pass);
    console.log("Token= " + encodedStr);

    httpModule.request({
        url: url,
        method: "GET",
        headers: {"Content-Type": "application/json",
                "Authorization":"Basic "+ encodedStr}
    }).then((response) => {
        const result = response.content.toJSON();

        console.log(result);
        indicator.visibility = "collapsed";

    },(e) => {
        console.log("Error", e);
        indicator.visibility = "collapsed";
    });
};

//Go to Settings page
exports.goto_settings = function () {
    const nav =
        {
            moduleName: "settings/settings",
        };

    frame.topmost().navigate(nav);


};

exports.pageLoaded = pageLoaded;
