const observableModule = require("tns-core-modules/data/observable");
const app = require("tns-core-modules/application");
const dialogs = require("tns-core-modules/ui/dialogs");
const email = require("nativescript-email");
const appSettings = require("tns-core-modules/application-settings");
const httpModule = require("tns-core-modules/http");
const imageSourceModule = require("tns-core-modules/image-source");
const contacts = require("nativescript-contacts");
const platformModule = require("tns-core-modules/platform");



let page;
let viewModel;
let sideDrawer;

function choseBackground(page){
    let code = appSettings.getString("facCod");
    console.log(code);

    if (code === "D1" || code === "D6"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(11, 114, 181,0.9)";
    }
    else if (code === "D2" || code === "D7"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Parisi.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(119, 72, 150,0.9)";
    }
    else if (code === "D3"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(36, 36, 36,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_CDN.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(0, 167, 84,0.9)";
    }
    else if (code === "D4"){
        page.getViewById("back_image").backgroundImage = "~/images/image_Acton.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(221, 108, 166,0.9)";
    }
    else{
        page.getViewById("back_image").backgroundImage = "~/images/newbackground.jpg";
        page.getViewById("info_panel").backgroundColor = "rgba(30, 50, 88,1)";
    }
}

function getPIC(personId, value){
    let url;
    switch (value) {
        case 0:
            url = global.url + "general/image/"+ personId;
            break;

        case 1:
            url = global.url + "general/image_prof/"+ personId;
            break;
    }

    httpModule.getFile({
        "url": url,
        "method": "GET",
        headers: {
            "Content-Type" : "image/jpg",
            "Authorization" : "Basic "+ global.encodedStr
        },
        "dontFollowRedirects": true
    }).then((source) => {
        page.getViewById("my_img").backgroundImage = source["path"];
    }, (e) => {
        console.log("[Photo] Error", e);
        dialogs.alert({
            title: "Errore: Anagrafe getPic",
            message: e.toString(),
            okButtonText: "OK"
        });
    });
}

exports.onNavigatingTo = function(args) {
    page = args.object;
    viewModel = observableModule.fromObject({});
    sideDrawer = app.getRootView();
    sideDrawer.closeDrawer();

    console.log("Navigation",page.navigationContext);

    if(page.navigationContext !== undefined){
        page.getViewById("save_info").visibility = "visible";

        page.getViewById("name").text = page.navigationContext.nome;
        page.getViewById("surname").text = page.navigationContext.cognome;
        page.getViewById("role").text = page.navigationContext.ruolo.toUpperCase();
        page.getViewById("matricola").text = page.navigationContext.matricola;
        page.getViewById("depart").text = "--"
        page.getViewById("uid").text = page.navigationContext.username;

        page.getViewById("sex").text = page.navigationContext.sesso;
        page.getViewById("nascita").text = page.navigationContext.dataNascita.substring(0,10);
        page.getViewById("email_ist").text = page.navigationContext.emailAte;
        page.getViewById("tel").text = page.navigationContext.telRes;

        if (page.navigationContext.ruolo  === "Studenti"){

            page.getViewById("my_img").backgroundImage = imageSourceModule.fromBase64(page.navigationContext.foto);

            page.getViewById("email").text = page.navigationContext.email;
            page.getViewById("nazione").text =  page.navigationContext.desCittadinanza;

            page.getViewById("email_id").visibility = "visible";
            page.getViewById("nation_id").visibility = "visible";
        }
        else if (page.navigationContext.ruolo === "Docenti"){

            page.getViewById("my_img").backgroundImage = imageSourceModule.fromBase64(page.navigationContext.image);

            page.getViewById("roleID").text =  page.navigationContext.settore;
        }
    }
    else{
        page.getViewById("save_info").visibility = "collapsed";

        choseBackground(page);
        page.getViewById("name").text = appSettings.getString("nome");
        page.getViewById("surname").text = appSettings.getString("cognome");
        page.getViewById("role").text = appSettings.getString("grpDes").toUpperCase();
        page.getViewById("matricola").text = appSettings.getString("matricola");
        page.getViewById("depart").text = appSettings.getString("facDes").toUpperCase();
        page.getViewById("uid").text = appSettings.getString("userId").toLowerCase();


        page.getViewById("sex").text = appSettings.getString("sesso");
        page.getViewById("nascita").text = appSettings.getString("dataNascita").substring(0,10);
        page.getViewById("email_ist").text = appSettings.getString("emailAte");
        page.getViewById("tel").text = appSettings.getString("telRes");


        if (appSettings.getString("grpDes") === "Studenti"){

            getPIC(appSettings.getNumber("persId"), 0);

            page.getViewById("email").text = appSettings.getString("email");
            page.getViewById("nazione").text = appSettings.getString("desCittadinanza");

            page.getViewById("email_id").visibility = "visible";
            page.getViewById("nation_id").visibility = "visible";
        }
        else if (appSettings.getString("grpDes") === "Docenti"){

            getPIC(appSettings.getNumber("idAb"), 1);

            page.getViewById("my_img").backgroundImage = url;
            page.getViewById("roleID").text = appSettings.getString("settCod");
        }
        else if (appSettings.getString("grpDes") === "Ristorante"){

            //getPIC(appSettings.getNumber("idAb"), 1);

            //page.getViewById("my_img").backgroundImage = url;
            page.getViewById("mat_label").text = "NOME RISTORANTE";
        }
    }

    page.bindingContext = viewModel;
}

exports.onDrawerButtonTap = function() {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.tap_sendMail = function () {

    let my_mail = appSettings.getString("emailAte","");
    if(my_mail !== ""){
        dialogs.confirm({
            title: "Salvataggio Informazioni Utente",
            message: "Salvare le informazioni visualizzate nella propria casella email " + my_mail + " ?",
            okButtonText: "Si",
            cancelButtonText: "Annulla"
        }).then(function (result){
            if(result){
                let array = [];
                array.push(my_mail);
                //TODO permettere al server di gestire le mail
                email.compose({
                    subject: "APP@UNIPARTHENOPE Informazioni utente " + page.navigationContext.nome + " " +
                        page.navigationContext.cognome,
                    body: "Informazioni Utente\n\n" + page.navigationContext.nome + " " +
                        page.navigationContext.cognome + "\n"+
                        "Ruolo: " + page.navigationContext.ruolo + "\n"+
                        "Username: " + page.navigationContext.username + "\n"+
                        "Matricola: " + page.navigationContext.matricola + "\n"+
                        "Sesso: " + page.navigationContext.sesso + "\n"+
                        "Nascita: " + page.navigationContext.dataNascita.substring(0,10) + "\n"+
                        "Email Istituzionale: " + page.navigationContext.emailAte + "\n"+
                        "Tel. : " + page.navigationContext.telRes + "\n"+
                    "\n\nQuesta email è generata automaticamente da app@uniparthenope",
                    to: array
                }).then(
                    function() {
                        console.log("Email closed");

                    }, function(err) {
                        dialogs.alert({
                            title: "Errore: Email",
                            message: err.toString(),
                            okButtonText: "OK"
                        });
                    });
            }
        });
    }
    else{
        dialogs.alert({
            title: "Attenzione!",
            message: "Impossibile recuperare la propria mail!",
            okButtonText: "OK",
        }).then();
    }
}

exports.tap_addContact = function () {

    dialogs.confirm({
        title: "Salvataggio Informazioni Utente",
        message: "Aggiungere nuovo contatto alla rubrica?",
        okButtonText: "Si",
        cancelButtonText: "Annulla"
    }).then(function (result){

        if(result){
            let newContact = new contacts.Contact();
            newContact.name.given = page.navigationContext.nome;
            newContact.name.family = page.navigationContext.cognome;
            newContact.organization.name = "Università degli Studi di Napoli 'Parthenope'";
            newContact.organization.jobTitle = page.navigationContext.ruolo + " "+page.navigationContext.matricola;
            newContact.phoneNumbers.push({
                label: contacts.KnownLabel.HOME,
                value: page.navigationContext.telRes
            }); // See below for known labels
            newContact.emailAddresses.push({ label: contacts.KnownLabel.HOME,
                value: page.navigationContext.emailAte});
            //newContact.photo = imageSource.fromFileOrResource("~/photo.png");
            if(platformModule.isAndroid){
                Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS, android.Manifest.permission.WRITE_CONTACTS], "I need these permissions because I'm cool")
                    .then(() => {
                        newContact.save().then(()=>{
                            dialogs.alert({
                                title: "Successo!",
                                message: "Utente aggiunto con successo alla rubrica!",
                                okButtonText: "OK",
                            })
                        });
                    });
            }
            else
                newContact.save();

        }
    });

}