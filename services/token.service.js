'use strict'

const jwt = require('jwt-simple');
const moment = require ('moment');

const SECRET = require('../config').secret;
const EXP_TIME = require('../config').tokenExpTmp;

//Crear el token
//
//devuelve token tipo JWT
//Formato JWT:
//  HEADER.PAYLOAD.VERIFY_SIGNATURE

//donde:
//  HEADER ( Objeto JSON con el algoritmo CODIFOCADO EN BASE URL64) {     
//          "alg": "HS256",
//          "typ": "JWT"
//      }
//  VERIFY_SIGNARURE = HMACSMA256 ( base64UrlEncode(HEADER)+"."+base64UrlEncode(PAYLOAD), SECRETO)

/*https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.3uvfBzxcuVtmS5PwWF4-mQi2rizpwUTY_3SK2K8Bki8*/

function creaToken( user ) {
    const payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(EXP_TIME, 'minutes').unix()
    };
    return jwt.encode( payload, SECRET );
}

//Decodificar token
// devuelve el identificador del usuario

function decodificaToken( token ) {
    return new Promise( (resolve, reject) => {
        try {
            const payload = jwt.decode( token, SECRET, true );
            if(payload.exp <= moment().unix()) {
                reject({
                    status: 401,
                    message: 'El token ha caducado'
                });
                resolve (payload.sub);
            }
            console.log( payload );
            resolve( payload.sub );
        } catch{
            reject({
                status: 500,
                message: 'El token no es válido'
            });
        }
    });
}

module.exports = {
    creaToken,
    decodificaToken
};