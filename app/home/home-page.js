const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
const frame = require("tns-core-modules/ui/frame");
const httpModule = require("http");
const base64= require('base-64');
const utilsModule = require("tns-core-modules/utils/utils");
const utf8 = require('utf8');
const dialogs = require("tns-core-modules/ui/dialogs");

let page;
let viewModel;
let sideDrawer;
let remember;
let user;

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    remember = appSettings.getBoolean("rememberMe");
    user = appSettings.getString("username");
   if (!global.isConnected & user !== undefined){
       dialogs.alert({
           title: "Bentornato!",
           message: "Bentornato "+ user,
           okButtonText: "OK"
       }).then(
       );
       autoconnect();
   }

   else if (remember)
   {
      setSideMenu(global.myform,global.username);

   }


    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
function autoconnect()
{
    console.log("REMEMBER= "+remember);
    if (remember){

        const sideDrawer = app.getRootView();
        let indicator = page.getViewById("activityIndicator");
        indicator.visibility = "visible";
        let user = appSettings.getString("username");
        let pass = appSettings.getString("password");
        console.log("USERNAME (old)= "+user);
        let token = user + ":" + pass;
        var bytes = utf8.encode(token);
        global.encodedStr = base64.encode(bytes);

        httpModule.request({
            url:  global.url + "login/" + global.encodedStr,
            method: "GET"
        }).then((response) => {
            let _result = response.content.toJSON();
            let result = _result.response;

            if(_result.statusCode === 401)
            {
                dialogs.alert({
                    title: "Autenticazione Fallita!",
                    message: _result.errMsg,
                    okButtonText: "OK"
                }).then(
                    args.object.closeModal()
                );
            }
            /* Se un utente è di tipo USER TECNICO (ristorante) */
            else if (_result.statusCode === 600)
            {
                let remember = sideDrawer.getViewById("rememberMe").checked;
                console.log("UserTecnico:" + _result.username);
                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("password",pass);
                    appSettings.setBoolean("rememberMe",true);
                }

                sideDrawer.getViewById("topName").text = _result.username;
                setSideMenu("userTecnico",_result.username);
                const nav =
                    {
                        moduleName: "usertecnico-all/usertecnico-all",
                        clearHistory: true
                    };
                frame.topmost().navigate(nav);
            }
            /* Se un utente è di tipoADMIN */
            else if (_result.statusCode === 666)
            {
                let remember = sideDrawer.getViewById("rememberMe").checked;
                console.log("Admin:" + _result.username);
                if (remember){
                    appSettings.setString("username",user);
                    appSettings.setString("password",pass);
                    appSettings.setBoolean("rememberMe",true);
                }

                sideDrawer.getViewById("topName").text = _result.username;
                setSideMenu("userAdmin",_result.username);
                const nav =
                    {
                        moduleName: "admin/admin-home/admin-home",
                        clearHistory: true
                    };
                frame.topmost().navigate(nav);
            }
            else
            {
                let carriere = result.user.trattiCarriera;
                global.saveInfo(result);

                let index = appSettings.getNumber("carriera");
                global.saveCarr(carriere[index]);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                let user = nome + " " + cognome;
                let grpDes = appSettings.getString("grpDes");
                if (grpDes === "Studenti")
                {
                    setSideMenu("userForm",user);
                    indicator.visibility = "collapsed";
                    const nav =
                        {
                            moduleName: "userCalendar/userCalendar",
                            clearHistory: true
                        };
                    frame.topmost().navigate(nav);
                }
            }

        },(e) => {
            console.log("Error", e);
            dialogs.alert({
                title: "Autenticazione Fallita!",
                message: e.retErrMsg,
                okButtonText: "OK"
            });
        });
        indicator.visibility = "collapsed";
    }
}

exports.onTapNotizie = function(){
  page.frame.navigate("notizie/notizie");
};

exports.onTapTrasporti = function(){
   page.frame.navigate("trasporti/trasporti");
};

exports.onTapAteneo = function(){
    const nav =
        {
            moduleName: "portale/portale",
            context: {link:"https://www.uniparthenope.it/"}
        };
        page.frame.navigate(nav);

};

exports.onTapEventi = function(){
    const nav =
        {
            moduleName: "orari/orari"
        };
    page.frame.navigate(nav);

};
 function setSideMenu(type,username)
 {
     let actualForm = sideDrawer.getViewById(type);
     let loginForm = sideDrawer.getViewById("loginForm");
     loginForm.visibility = "collapsed";
     actualForm.visibility = "visible";
     global.myform = type;

     sideDrawer.getViewById("topName").text = username;
     global.username = username;
 }

exports.ontap_fb = function(){
    utilsModule.openUrl("https://www.facebook.com/Parthenope");
};
exports.ontap_you = function(){
    utilsModule.openUrl("https://www.youtube.com/channel/UCNBZALzU97MuIKSMS_gnO6A");
};
exports.ontap_twi = function(){
    utilsModule.openUrl("https://twitter.com/uniparthenope");
};
exports.ontap_insta = function(){
    utilsModule.openUrl("https://www.instagram.com/uniparthenope");
};
//TODO Trasporti
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
