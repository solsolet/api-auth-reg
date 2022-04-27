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

//per a treballar amb la BD
var db = mongojs("SD"); //es pot incloure + parametres: username:password@example.com/SD
var id = mongojs.ObjectID;

//Middleware
var allowMethods = (req,res,next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return next();
};
var allowCrossTokenHeader = (req,res,next) => {
    res.header("Access-Control-Allow-Headers", "*");
    return next();
};
var allowCrossTokenOrigin = (req,res,next) => {
    res.header("Acces-Control-Allow-Origin", "*");
    return next();
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
function auth (req,res,next) {
    const token = req.headers.authorization.split(" ")[1]; //que tia + tonta ni escriure be podies no??
    
    TokenService.decodificaToken(token)
        .then (userId => {
            req.user = { id: userId }
            return next();
        })
        .catch (err => res.status(400).json({result: 'ko', msg: err}));
}

//obtenim tots els usuaris registrats en el sistema. Versió reduida de GET api/user
app.get('/api/auth', auth, (req,res,next) => {
    db.user.find({}, {_id:0, nombre: 1, email: 1}, (err,usuaris) => { //si no s'exclueix explícitament el :id ix
        if(err) return next(err);
        else res.json(usuaris);
    });
});

//obtenim usuari a partir de token válid
app.get('/api/auth/me', auth, (req,res,next) => {
    const usuari = req.user;

    //busca usuari en bd
    db.user.findOne({ _id: id(usuari.id) }, (err, usu) => { //usu per a esta part del codi
        if (err) return next(err);
        else if(!usu){
            res.status(400).json ({
                error: 'Bad data',
                description: `No existe el usuario con id ${usuari.id}` //alomillor too much
            });
        }
        else {
            res.json(usu);
        }
    });
});

//realitza una identificació o login (signIn) i torna un token válid
app.post('/api/auth', (req,res,next) => {
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
                    //console.log(PassService.comparaPassword(usuari.password, emilio.password)); //es queda pendent
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
app.post('/api/reg', (req,res,next) => {
    const usuari = req.body;

    if(!usuari.nombre || !usuari.email || !usuari.password){
        res.status(400).json ({
            error: 'Bad data',
            description: 'Se precisa del campo <nombre>, <email> y <password>'
        });
    } else {
        //comprovar q el usuari no existisca ja
        db.user.findOne({ email: (usuari.email) }, (err, emilio) => { //emilio jaja k gracioso no
            if(err) return next(err);
            else if(!emilio){
                //encriptar password
                usuari.password = PassService.encriptaPassword(usuari.password);
                //creem
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
            else {
                res.status(400).json ({
                    error: 'Bad data',
                    description: `El email ${usuari.email} ya existe, use otro`
                });
            }
        });
    }
});

//creem server https que inicia l'app
https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`WS RESTFul de Registro y Autenticación ejecutándose en https://localhost:${port}/api`);
});