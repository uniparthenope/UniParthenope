const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
let geolocation = require("nativescript-geolocation");
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

    if(!global.tempPos){ //Setto la posizione attuale, soltanto alla prima apertura dell'app
        console.log("Setto la posizione!");
        getPosition();
        global.tempPos = true;
    }

   if (!global.isConnected && user !== undefined){
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
                page.frame.navigate(nav);
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
                page.frame.navigate(nav);
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
                    page.frame.navigate(nav);
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

exports.onTapFood = function(){
    const nav =
        {
            moduleName: "menu/menu"
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

function getPosition(){
    console.log("GetPosition ");
    geolocation.enableLocationRequest().then(function () {
        geolocation.isEnabled().then(function (isEnabled) {
            geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
            then(function(loc) {
                if (loc) {
                    let position = calculateDistance(loc);
                    appSettings.setString("position", position);
                    console.log("MY_POSITION = "+loc.latitude+ " "+loc.longitude);
                }
                else { console.log("MY_POSITION = ERROR ");}
            }, function(e){

                console.log("Position Error: " + e.message);
            });
        })
    });
    console.log("QUI");
}
function calculateDistance(position) {
    let closer = "None";
    let array_locations = [{id: 'CDN', lat: 40.856831, long: 14.284553, color: 'linear-gradient(135deg, #5CC77A, #009432)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(0, 167, 84))'},
        {id: 'Acton', lat: 40.837372, long: 14.253502, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(11, 114, 181))'},
        {id: 'Medina', lat: 40.840447, long: 14.251863, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(221, 108, 166))'},
        {id: 'Parisi', lat: 40.832308, long: 14.245027, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(119, 72, 150))'},
        {id: 'Villa', lat: 40.823872, long: 14.216225, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(36, 36, 36))'}];

    let bottom_bar = page.getViewById("bottom_bar");
    let image = page.getViewById("main_image");

    let main_bg = page.getViewById("main_bg");
    let main_icon = page.getViewById("icon_main");
    main_icon.backgroundImage = '~/images/icon_home/' + array_locations[4].id + ".png";
    main_bg.background = array_locations[4].background;


let x = 0;

    for (let i = 0; i < array_locations.length; i++) {
        let loc = new geolocation.Location();
        loc.latitude = array_locations[i].lat;
        loc.longitude = array_locations[i].long;

        if (geolocation.distance(position, loc) < 200) {
            closer = array_locations[i].id;
            bottom_bar.background = array_locations[i].color;
            image.backgroundImage = '~/images/image_' + array_locations[i].id + ".jpg";
            main_bg.background = array_locations[i].background;
            main_icon.backgroundImage = '~/images/icon_home/' + array_locations[i].id + ".png";
        }
        else{
            let bg = page.getViewById("bg_" + x.toString());
            let icon = page.getViewById("icon_" + x.toString());
            bg.background = array_locations[i].background;
            icon.backgroundImage = '~/images/icon_home/' + array_locations[i].id + ".png";
            x++;

        }
    }
    return closer;
}
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
