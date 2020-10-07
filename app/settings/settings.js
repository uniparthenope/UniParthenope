const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const utilsModule = require("tns-core-modules/utils/utils");
const frame = require("tns-core-modules/ui/frame");
let firebase = require("nativescript-plugin-firebase");




let page;
let viewModel;
let sideDrawer;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    let remember = appSettings.getBoolean("rememberMe",false);

    if (global.isConnected) //If im logged in, show user settings
    {
        page.getViewById("appello_futuro").visibility = "visible";
    }

    if (remember){
        if(appSettings.getNumber("grpId",0) === 6)
            page.getViewById("visibility_topic_cdsId").visibility = "visible";

        page.getViewById("visibility_topic_grpId").visibility = "visible";
        page.getViewById("deleteBtn").visibility = "visible";
    }
    else{
        page.getViewById("visibility_topic_grpId").visibility = "collapsed";
        page.getViewById("visibility_topic_cdsId").visibility = "collapsed";
        page.getViewById("deleteBtn").visibility = "collapsed";

    }

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu()
{
    const nav =
        {
            moduleName: "home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

function onTapDelete(){
    dialogs.confirm({
        title: "Rimozione Account",
        message: "Dimenticare tutti i dati?",
        okButtonText: "Si",
        cancelButtonText: "No"
    }).then(function (result) {
        if (result){
            global.clearAll();
            sideDrawer.getViewById("userForm").visibility="collapsed";
            sideDrawer.getViewById("userDocente").visibility="collapsed";
            sideDrawer.getViewById("userRistoratore").visibility="collapsed";
            sideDrawer.getViewById("userOther").visibility="collapsed";
            sideDrawer.getViewById("topName").text = "Benvenuto!";
            sideDrawer.getViewById("loginForm").visibility="visible";
            sideDrawer.getViewById("topImg").backgroundImage = "~/images/logo_parth.png";
            page.getViewById("deleteBtn").visibility = "collapsed";
            sideDrawer.getViewById("topMatr").visibility = "collapsed";
            sideDrawer.getViewById("topEmail").visibility = "collapsed";

            let grp = "GRP_" + appSettings.getNumber("grpId",0);
            if(appSettings.getNumber("grpId",0) !== 0)
                firebase.unsubscribeFromTopic(grp).then(() => console.log("Unsubscribed from ",grp));

            let cds = "CDS_" + appSettings.getNumber("cdsId",0);
            if(appSettings.getNumber("grpId",0) === 6)
                firebase.unsubscribeFromTopic(cds).then(() => console.log("Unsubscribed from ",cds));

            const nav =
                {
                    moduleName: "home/home-page",
                    clearHistory: true
                };
            page.frame.navigate(nav);        }
    });
}
exports.onTapDelete = onTapDelete;

function onTapSurvey() {
    utilsModule.openUrl("https://forms.gle/NHt34NRw7uwMk9rEA");
}
exports.onTapSurvey = onTapSurvey;

// Check per mostrare nella pagina APPELLI.JS anche gli appelli non ancora prenotabili, ma disponibili.
function onSwitchLoaded_appello(args) {
    page.getViewById("switch_appello").checked = appSettings.getBoolean("esami_futuri",false);
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean("esami_futuri",isChecked);
    });
}
exports.onSwitchLoaded_appello = onSwitchLoaded_appello;

function onSwitchLoaded_sondaggio(args) {
    page.getViewById("switch_sondaggio").checked = appSettings.getBoolean("sondaggio",false);
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean("sondaggio",isChecked);
    });
}
exports.onSwitchLoaded_sondaggio = onSwitchLoaded_sondaggio;

function onSwitchLoaded_topic_grpId(args) {
    page.getViewById("switch_topic_grpId").checked = appSettings.getBoolean("topic_grpId",false);
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean("topic_grpId",isChecked);

        let grp = "GRP_" + appSettings.getNumber("grpId",0);
        if (isChecked)
            firebase.subscribeToTopic(grp).then(() => console.log("Subscribed to ",grp));
        else
            firebase.unsubscribeFromTopic(grp).then(() => console.log("Unsubscribed from ",grp));

    });
}
exports.onSwitchLoaded_topic_grpId = onSwitchLoaded_topic_grpId;

function onSwitchLoaded_topic_cdsId(args) {
    page.getViewById("switch_topic_cdsId").checked = appSettings.getBoolean("topic_cdsId",false);
    const mySwitch = args.object;

    mySwitch.on("checkedChange", (args) => {
        const sw = args.object;
        const isChecked = sw.checked;
        appSettings.setBoolean("topic_cdsId",isChecked);

        let cds = "CDS_" + appSettings.getNumber("cdsId",0);
        if (isChecked)
            firebase.subscribeToTopic(cds).then(() => console.log("Subscribed to ",cds));
        else
            firebase.unsubscribeFromTopic(cds).then(() => console.log("Unsubscribed from ",cds));

    });
}
exports.onSwitchLoaded_topic_cdsId = onSwitchLoaded_topic_cdsId;

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
