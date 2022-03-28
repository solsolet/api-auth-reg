//API RESTFul CRUD amb Mongo
'use strict'

const port = process.env.PORT || 3000;

//després fem segur el servei
/*const https = require('https');//obliga a express a treballar en esta libreria
const fs = require('fs');//que puga accedir al file system

const OPTIONS_HTTPS = { //declarar clau privada i certificat
    key: fs.readFileSync('./cer/key.pen'),
    cert: fs.readFileSync('./cer/cert.pen')
};*/

const express = require('express');
const logger = require('morgan');
const mongojs = require('mongojs');
//const cors = require('cors');

const app = express();

var db = mongojs("SD"); //es pot incloure + parametres: username:password@example.com/SD
var id = mongojs.ObjectID;

//Declarem els middleware
/*var allowMethods = (req,res,next) => {
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
};*/

app.use(logger('dev')); //probar amb: tiny, short, dev, common, combined
app.use(express.urlencoded({extended: false}));
app.use(express.json());
//app.use(cors());
//app.use(allowMethods);
//app.use(allowCrossTokenHeader);
//app.use(allowCrossTokenOrigin);

//trigger previ a les rutes x donar suport a múltiples coleccions
//ara no té sentit
/*app.param("coleccion", (req,res,next,coleccion) => {
    console.log('param /api/:coleccion');
    console.log('colección: ', coleccion);

    req.collection = db.collection(coleccion);
    return next();
});*/

//Gestió d'usuaris
/*app.get('/api', (req,res,next) => {
    console.log('GET/api');
    console.log(req.params);
    console.log(req.collection);

    db.getCollectionNames((err,colecciones) => {
        if (err) return next(err);
        res.json(colecciones);
    });
});*/

app.get('/api/user', (req,res,next) => {
    req.collection.find((err, user) => {
        if (err) return next(err);
        res.json(user);
    });
});

app.get('/api/user/:id', (req,res,next) => {
    req.collection.findOne({_id: id(req.params.id)}, (err,elemento) => {
        if (err) return next(err);
        res.json(elemento);
    });
});

app.post('/api/user', /*auth,*/ (req,res,next) => {
    const elemento = req.body;

    if(!elemento.nombre){
        res.status(400).json ({
            error: 'Bad data',
            description: 'Se precisa al menos un campo <nombre>'
        });
    } else {
        req.collection.save(elemento, (err, usuarioGuardado) => {
            if(err) return next(err);
                res.json(usuarioGuardado);
        });
    }
});

app.put('/api/user/:id', /*auth,*/ (req,res,next) => {
    let elementoId = req.params.id;
    let elementoNuevo = req.body;
    req.collection.update({_id: id(elementoId)},
            {$set: elementoNuevo}, {safe: true, multi:false}, (err,elementoModif) => {
        if (err) return next(err);
        res.json(elementoModif);
    });
});

app.delete('/api/user/:id', /*auth,*/ (req,res,next) => {
    let elementoId = req.params.id;

    req.collection.remove({_id: id(elementoId)}, (err,resultado) => {
        if(err) return next(err);
        res.json(resultado);
    });
});

//creem server https que inicia l'app
/*https.createServer(OPTIONS_HTTPS, app).listen(port, () => {
    console.log(`SCR WS API REST CRUD ejecutándose en https://localhost:${port}/api/:coleccion/:id`);
});*/

//iniciem l'aplicació
app.listen(port, () => {
    console.log(`API REST ejecutándose en http://localhost:${port}/api/user/:id`);
});