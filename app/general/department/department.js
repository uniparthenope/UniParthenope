const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const appSettings = require("tns-core-modules/application-settings");
const utilsModule = require("tns-core-modules/utils/utils");
const frame = require("tns-core-modules/ui/frame");

let page;
let viewModel;
let sideDrawer;
let context;

function onNavigatingTo(args) {
    page = args.object;
    context = args.context;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();
    let image = page.getViewById("main_image");
    let icon = page.getViewById("icon_0");



    page.getViewById("title").text = context.title;
    page.getViewById("social").background = context.background;
    page.getViewById("top_bar").background = context.background;

    page.getViewById("bottom_bar").backgroundColor = context.color;
    image.backgroundImage = '~/images/image_' + context.id + ".jpg";
    icon.backgroundImage = '~/images/icon_home/' + context.img + ".png";

    for(let i=1; i<5; i++){
        page.getViewById("btn_"+i).borderColor = context.color;
        page.getViewById("social_"+i).backgroundColor = context.color;

        if (i === 1){
            page.getViewById("btn_"+i).backgroundColor = context.color;

        }
        else{
            page.getViewById("btn_"+i).color = context.color;
        }
    }
    page.getViewById("social_5").backgroundColor = context.color;






    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function onGeneralMenu() {
    const nav =
        {
            moduleName: "general/home/home-page",
            clearHistory: true
        };
    page.frame.navigate(nav);
}

exports.onGeneralMenu = onGeneralMenu;
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;

exports.tap_scienze = function(){
    const nav =
        {
            moduleName: "general/department/department",

            animated: false
        };
    page.frame.navigate(nav);

};

exports.onTapBtn1 = function(){
    utilsModule.openUrl(context.website);
};