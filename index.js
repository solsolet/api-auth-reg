//API RESTFul CRUD amb Mongo
'use strict'

const port = process.env.PORT || 3001; //tindre cuidao d no posar sempre el mateix port

//després fem segur el servei
const https = require('https');//obliga a express a treballar en esta libreria
const fs = require('fs');//que puga accedir al file system

const OPTIONS_HTTPS = { //declarar clau privada i certificat
    key: fs.readFileSync('./cer/key.pen'),
    cert: fs.readFileSync('./cer/cert.pen')
};

const express = require('express');
const logger = require('morgan');
const mongojs = require('mongojs');
const cors = require('cors');

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
//no va lo de les cors
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
//obtenim tots els usuaris registrats en el sistema. Versió reduida de GET api/user
app.get('/api/auth', (req,res,next) => {
    db.user.find((err, auth) => {
        if (err) return next(err);
        res.json(auth);
    });
});

//obtenim usuari a partir de token válid
//revisar
app.get('/api/auth/me', (req,res,next) => {
    db.user.find((err, auth) => {
        if (err) return next(err);
        res.json(auth);
    });
});

//realitza una identificació o login (signIn) i torna un token válid
app.post('/api/auth', auth, (req,res,next) => {
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

//realitza un registre mínim (signUp) d'un usuari i torna un token válid
app.post('/api/reg', auth, (req,res,next) => {
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

//creem server https que inicia l'app
https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SCR WS API REST CRUD ejecutándose en https://localhost:${port}/api/user/:id`);
});

//iniciem l'aplicació
/*app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/user/:id`);
});*/