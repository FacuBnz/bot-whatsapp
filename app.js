const qrcode = require('qrcode-terminal');
const fs = require('fs');
const ora = require('ora');
const { Client, MessageMedia } = require('whatsapp-web.js');
const chalk = require('chalk');
const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withSession = () =>{
    //si existe cargamos el archivo con las credenciales
    const spinner = ora(`Cargando ${chalk.yellow('Validando session con whatsapp ...')}`);

    sessionData = require(SESSION_FILE_PATH);
    spinner.start();

    client = new Client({
        session: sessionData
    });

    client.on('ready', () => {
        console.log('Cliente is ready!')
        spinner.stop();
        listenMenssage();
    })

    client.on('auth_failure', () =>{
        spinner.stop();
        console.log('** Error de autenticacion vuelve a generar el QRCODE (Borra el archivo session.json) **')
    });

    client.initialize();
}

/**
 * Esta funcion genera el qrcode
*/

const withOutSession = () =>{
    console.log('No tenemos session guardada');

    client = new Client();
    client.on('qr', qr =>{
        qrcode.generate(qr, { small:true })
    });

    client.on('authenticated', (session) => {
        //Guardamos credenciales de session para usar luego

        sessionData = session;

        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err){
            if(err){
                console.log(err);
            }
        });
    })

    client.initialize();
}

/**
* Esta funcion se encarga de escuchar cada vez que un mensaje entra nuevo
*/

const listenMenssage = () =>{
    client.on('message', (msg) => {
        const {from, to, body} = msg;

        switch (body) {
            case 'Te_extraño'.toLowerCase():
                sendMessage(from, 'Yo tambien te extraño y mucho 🥰');
                break;

            case 'Te_amo'.toLowerCase():
                sendMessage(from, 'Yo te amo mucho mas amorcito 😘')
                break;

            case 'Hola_mi_amor'.toLowerCase():
                sendMessage(from, 'Hola mi amor, mi vida como estas? 🥰')
                break;

            case 'Buen_dia_amor'.toLowerCase():
                sendMessage(from, 'Buen dia mi amor, mi vida, mi cielo, mi corazon, mi todo 🥰🥰🥰')
                break;
            
            case 'Como_estas?'.toLowerCase():
                sendMessage(from, 'Bien, en mi habitat natural como siempre.')
                break;
            
            case 'send_michi'.toLowerCase():
                sendMedia(from)
                sendMessage(from, 'Aqui tienes tu gatito!');
                break;      
        }
        console.log(`${chalk.green(from)} : ${chalk.yellow(body)}`);
    })
}

const sendMedia = (to) =>{
    let num = Math.floor((Math.random() * (5 - 1 + 1)) + 1);
    const mediaFile = MessageMedia.fromFilePath(`./mediaSendMichi/gatito${num}.jpg`)
    client.sendMessage(to, mediaFile);
}

const sendMessage = (to, message) => {

    client.sendMessage(to, message)
}

(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();