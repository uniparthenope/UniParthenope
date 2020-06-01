const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");
let geolocation = require("nativescript-geolocation");
const httpModule = require("http");
const base64= require('base-64');
const utilsModule = require("tns-core-modules/utils/utils");
const utf8 = require('utf8');
const dialogs = require("tns-core-modules/ui/dialogs");
let appversion = require("nativescript-appversion");
const modalViewModule = "modal-meteo/modal-meteo";

let page;
let viewModel;
let sideDrawer;
let remember;
let user;
let pos;

let array_locations = [{id: 'CDN', lat: 40.856831, long: 14.284553, color: 'linear-gradient(135deg, #5CC77A, #009432)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(0, 167, 84))'},
    {id: 'Medina', lat: 40.840447, long: 14.251863, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(221, 108, 166))'},
    {id: 'Acton', lat: 40.837372, long: 14.253502, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(11, 114, 181))'},
    {id: 'Parisi', lat: 40.832308, long: 14.245027, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(119, 72, 150))'},
    {id: 'Villa', lat: 40.823872, long: 14.216225, color: 'linear-gradient(135deg, #107dd0, #22384f)', background:'linear-gradient(180deg, rgba(0, 0, 0, 0), rgb(36, 36, 36))'}];

function onNavigatingTo(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();

    remember = appSettings.getBoolean("rememberMe");
    user = appSettings.getString("username");

    appversion.getVersionName().then(function(v) {
        page.getViewById("version").text = "Versione: " + v;
    });

    initializeGraph();

    if(!global.tempPos){ //Setto la posizione attuale, soltanto alla prima apertura dell'app
        console.log("Setto la posizione!");
        getPosition();
        global.tempPos = true;
    }

   if (user !== undefined && !global.isConnected){
       dialogs.alert({
           title: "Bentornato!",
           message: "Bentornato "+ appSettings.getString("nome") + " " + appSettings.getString("cognome"),
           okButtonText: "OK"
       }).then(
       );
       autoconnect();
   }
   else if (remember) {
      setSideMenu(global.myform,global.username);
   }

    page.bindingContext = viewModel;
}

function onDrawerButtonTap() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function autoconnect() {
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
            url:  global.url + "login",
            method: "GET",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : "Basic "+ global.encodedStr
            }
        }).then((response) => {
            let _result = response.content.toJSON();

            if(response.statusCode === 401)
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
            else if (response.statusCode === 600)
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
            else if (response.statusCode === 666)
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
            else if(_result.user.grpDes === "Docenti")
            {
                detailedProf(_result.user.docenteId); // Get detailed info of a professor
                global.saveInfo(_result);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                let username = nome + " " + cognome;
                setSideMenu("userDocente",username);
                indicator.visibility = "collapsed";
                const nav =
                    {
                        moduleName: "docenti/docenti-home/docenti-home",
                        clearHistory: true
                    };
                page.frame.navigate(nav);
            }
            else if (_result.user.grpDes === "Studenti")
            {
                let carriere = _result.user.trattiCarriera;
                global.saveInfo(_result);
                let index = appSettings.getNumber("carriera");
                global.saveCarr(carriere[index]);
                getDepartment(carriere[index].stuId);
                global.isConnected = true;
                let nome = appSettings.getString("nome");
                let cognome = appSettings.getString("cognome");
                let username = nome + " " + cognome;
                setSideMenu("userForm",username);
                indicator.visibility = "collapsed";
                const nav =
                        {
                            moduleName: "userCalendar/userCalendar",
                            clearHistory: true
                        };
                page.frame.navigate(nav);

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

exports.onTapMeteo = function(){
    const loc = { lat: pos.latitude, long: pos.longitude };
    page.showModal(modalViewModule, loc, false);
};

exports.onTapTrasporti = function(){
    if(global.encodedStr === ""){
        dialogs.alert({
            title: "Non Autorizzato!",
            message: "Effettuare Login!",
            okButtonText: "OK"

        });
    }
    else{
        page.frame.navigate("trasporti/trasporti");
    }

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
           // moduleName:"docenti/docenti-appelli/docenti-appelli"
            moduleName: "menu/menu"
        };
    page.frame.navigate(nav);

};

function setSideMenu(type,username) {
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

exports.onTapStudia = function(){
    utilsModule.openUrl("http://orientamento.uniparthenope.it/index.php/corsi-di-studio-a-a-2019-2020");
};

function getPosition(){
    console.log("GetPosition ");

    geolocation.enableLocationRequest().then(function () {
        geolocation.isEnabled().then(function (isEnabled) {

            geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 10000, timeout: 10000}).
            then(function(loc) {
                console.log("Finding "+loc);
                if (loc) {
                    pos = loc;
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

    let bottom_bar = page.getViewById("bottom_bar");
    let image = page.getViewById("main_image");


    for (let i = 0; i < array_locations.length; i++) {
        let loc = new geolocation.Location();
        loc.latitude = array_locations[i].lat;
        loc.longitude = array_locations[i].long;
        //console.log("Distanza= "+geolocation.distance(position,loc));
        if (geolocation.distance(position, loc) < 300) {
            //console.log("Trovata!");
            closer = array_locations[i].id;
            bottom_bar.background = array_locations[i].color;
            image.backgroundImage = '~/images/image_' + array_locations[i].id + ".jpg";

        }

    }
    return closer;
}

function initializeGraph(){
    for (let i = 0; i < array_locations.length; i++) {
        let bg = page.getViewById("bg_" + i.toString());
        let icon = page.getViewById("icon_" + i.toString());


        bg.background = array_locations[i].background;
        icon.backgroundImage = '~/images/icon_home/' + array_locations[i].id + ".png";
    }
}
function detailedProf(docenteId) {
    httpModule.request({
        url: global.url + "professor/detailedInfo/"+ docenteId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();

        //console.log(_result);
        global.saveProf(_result);

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Autenticazione Fallita!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}
function getDepartment(studId) {
    console.log(studId);
    httpModule.request({
        url: global.url + "students/departmentInfo/"+ studId,
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : "Basic "+ global.encodedStr
        }
    }).then((response) => {
        let _result = response.content.toJSON();
        global.saveDepartment(_result);

    },(e) => {
        console.log("Error", e);
        dialogs.alert({
            title: "Autenticazione Fallita!",
            message: e.retErrMsg,
            okButtonText: "OK"
        });
    });
}
exports.onNavigatingTo = onNavigatingTo;
exports.onDrawerButtonTap = onDrawerButtonTap;
