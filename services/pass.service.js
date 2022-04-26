'use strict'

const bcrypt = require('bcrypt');

//Encripta pssw
//   devuelve un hash con un salt incluido en formato:
//     $2b$10$sDDAPjcUVntTuUyRFvZmJuB71lx6aKOfNpMBBGE3Q2bw4pmx0zWtC
//     ****-- *****************************++++++++++++++++++++++++
//     Alg Cost             Salt                      Hash

function encriptaPassword( password ) {
    return bcrypt.hashSync( password, 10 ); //li posem el Sync per que baix ho esta
}

//ComparaPassword
//  devolver verdadero o falso si coinciden o no el pass y hash

function comparaPassword( password, hash ){
    return bcrypt.compareSync( password, hash); //el sync lleva el promise pending
}

module.exports = {
    encriptaPassword,
    comparaPassword
}