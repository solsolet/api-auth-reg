'use strict'

const bcrypt = require('bcrypt');

//Encripta pssw
//   devuelve un hash con un salt incluido en formato:
//     $2b$10$sDDAPjcUVntTuUyRFvZmJuB71lx6aKOfNpMBBGE3Q2bw4pmx0zWtC
//     ****-- *****************************++++++++++++++++++++++++
//     Alg Cost             Salt                      Hash

function encriptaPassword( password ) {
    return bcrypt.hash( password, 10 ); //10 es podria canviar x variable, en el nostre cas es cte
}

//ComparaPassword
//  devolver verdadero o falso si coinciden o no el pass y hash

function comparaPassword( password, hash ){
    return bcrypt.compare( password, hash);
}

module.exports = {
    encriptaPassword,
    comparaPassword
}