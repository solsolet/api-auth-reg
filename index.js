//API RESTFul CRUD amb Mongo
'use strict'

const port = process.env.PORT || require('./config').port; /*el port que haja en config*/

//fem segur el servei
const https = require('https'); //obliga a express a treballar en esta libreria
const fs = require('fs'); //que puga accedir al file system

const OPTIONS_HTTPS = { //declarar clau privada i certificat
    key: fs.readFileSync('./cer/key.pen'),
    cert: fs.readFileSync('./cer/cert.pen')
};

const express = require('express');
const logger = require('morgan');
const mongojs = require('mongojs');
const cors = require('cors');

const bcrypt = require('bcrypt');
const TokenService = require('./services/token.service');
const PassService = require ('./services/pass.service');
const moment = require('moment');

const app = express();

var db = mongojs("SD"); //es pot incloure + parametres: username:password@example.com/SD
var id = mongojs.ObjectID;

//Declarem els middleware
var allowMethods = (req,res,next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return next();
};
var allowCrossTokenHeader = (req,res,next) => {
    res.header("Access-Control-Allow-Headers", "token");
    return next();
};
var allowCrossTokenOrigin = (req,res,next) => {
    res.header("Acces-Control-Allow-Origin", "*");
    return next();
};
var auth = (req,res,next) => {
    if(req.headers.token === "password1234"){
        return next();
    } else {
        return next(new Error("No autorizado"));
    };
};

app.use(logger('dev')); //probar amb: tiny, short, dev, common, combined
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(allowMethods);
app.use(allowCrossTokenHeader);
app.use(allowCrossTokenOrigin);

//Gestió d'usuaris
//obtenim tots els usuaris registrats en el sistema
app.get('/api/user', (req,res,next) => {
    db.user.find((err, user) => {
        if (err) return next(err);
        res.json(user);
    });
});

//obtenim l'usuari indicat en {id}
app.get('/api/user/:id', (req,res,next) => {
    db.user.findOne({_id: id(req.params.id)}, (err,elemento) => {
        if (err) return next(err);
        res.json(elemento);
    });
});

//registrem un nou usuari amb tota la seua info
app.post('/api/user', auth, (req,res,next) => {
    const elemento = req.body;

    if(!elemento.nombre){
        res.status(400).json ({
            error: 'Bad data',
            description: 'Se precisa al menos un campo <nombre>'
        });
    } else {
        db.user.save(elemento, (err, usuarioGuardado) => {
            if(err) return next(err);
                res.json(usuarioGuardado);
        });
    }
});

//modifiquem l'usuari {id}
app.put('/api/user/:id', auth, (req,res,next) => {
    let elementoId = req.params.id;
    let elementoNuevo = req.body;
    db.user.update({_id: id(elementoId)},
            {$set: elementoNuevo}, {safe: true, multi:false}, (err,elementoModif) => {
        if (err) return next(err);
        res.json(elementoModif);
    });
});

//eliminem l'usuari {id}
app.delete('/api/user/:id', auth, (req,res,next) => {
    let elementoId = req.params.id;

    db.user.remove({_id: id(elementoId)}, (err,resultado) => {
        if(err) return next(err);
        res.json(resultado);
    });
});


//Gestió d'autiritzacions
//funció per a autoritzar nsq. Afegir en tot com a variable auth??
function auth(req,res,next) {
    const token = req.headers.authoritation.split(' ')[1];
    TokenService.decodificaToken(token)
        .then (userId => {
            req.user = { id: userId }
            return next();
        })
        .catch (err => res.status(400).json({result: 'ko', msg: err}));
}

//obtenim tots els usuaris registrats en el sistema. Versió reduida de GET api/user
app.get('/api/auth', (req,res,next) => {
    db.user.find({}, {_id:0, nombre: 1, email: 1}, (err,usuaris) => { //si no s'exclueix explícitament el :id ix
        if(err) return next(err);
        else res.json(usuaris);
    });
});

//obtenim usuari a partir de token válid
//revisar
app.get('/api/auth/me', (req,res,next) => {
    //mirar si .findOne()

    //buscar usuari en bd
    db.user.find((err, auth) => {
        if (err) return next(err);
        res.json(auth);
    });
});

//realitza una identificació o login (signIn) i torna un token válid
app.post('/api/auth', auth, (req,res,next) => {
    const usuari = req.body;

    if(!usuari.email || !usuari.password){
        res.status(400).json ({
            error: 'Bad data',
            description: 'Se precisa al menos los campos <email> y <password>'
        });
    } else {
        //comprovar q esta l'usuari
        db.user.findOne({ email: (usuari.email) }, (err, emilio) => { //emilio jaja k gracioso no
            if(err) return next(err);
            else if(!emilio){
                res.status(400).json ({ //el 400 estarà bé?
                    error: 'Bad data',
                    description: `No se encuentra el usuario ${usuari.email}`
                });
            }
            else {
                //comprovar password
                if(PassService.comparaPassword(usuari.password, emilio.password)) {
                    console.log(PassService.comparaPassword(usuari.password, emilio.password)); //es queda pendent
                    //console.log(emilio.password + ' ' + usuari.password);
                    emilio.lastLogin = moment().unix();
                    res.json({
                        "result": "OK",
                        "token": TokenService.creaToken(emilio),
                        "usuario": emilio
                    });
                }
                else {
                    res.status(400).json ({
                        error: 'Bad data',
                        description: `La contraseña ${usuari.password} no es la correcta` //canviar de cara al futur
                    });
                }
            }
        });
    }
});

//realitza un registre mínim (signUp) d'un usuari i torna un token válid
app.post('/api/reg', auth, (req,res,next) => {
    const usuari = req.body;

    if(!usuari.nombre || !usuari.email || !usuari.password){
        res.status(400).json ({
            error: 'Bad data',
            description: 'Se precisa del campo <nombre>, <email> y <password>'
        });
    } else {
        //comprovar q el usuari no existisca ja
        //comprovar password

        usuari.signUpDate = moment().unix();
        usuari.lastLogin = moment().unix();
        db.user.save(usuari, (err, usuarioGuardado) => {
            if(err) return next(err);
            else {
                res.json({
                    "result": "OK",
                    "token": TokenService.creaToken(usuarioGuardado),
                    "usuario": usuarioGuardado
                });
            }     
        });
    }
});

//creem server https que inicia l'app
https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SCR WS API REST CRUD ejecutándose en https://localhost:${port}/api`);
});

//iniciem l'aplicació
/*app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/user/:id`);
});*/