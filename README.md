# Servicio Web RESTFul de Registro y Autenticación

## Comenzando 🚀

_Instrucciones para obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

### Pre-requisitos 📋

Para trabajar usaremos  una **máquina virtual**, aunque se puede trabajar en Windows, Linux u OS X.

La máquina para que nos funcione correctamente como mínimo tendrá 2GHz de procesador, 4GB de RAM y 25GB de HD. Además instalaremos la última versión estable de 64 bits de **Ubuntu**.

Toda la práctica está explicada para la 20.04 LTS. Podemos verificar los parámetros con los comandos:
```
$ lab_release -a
$ uname -m
$ df -h
```
Si usamos el gestor VirtualBox podemos usar la imagen ISO de la última versión de Ubuntu. Es recomendable instalar las extensiones del gestor (desde VirtualBox le diremos que monte el disco con el nuevo software).

Una vez tengamos nuestra máquina preparada ya podemos empezar a instalar todos los programas que necesitemos

### Instalación 🔧

Para la ejecución de esta práctica se necesita tener:
* NodeJS (con express, cors, bcrypt, moment y jwt-simple)
* Git
* Code (o similar)
* MongoBD (con mongodb y mongojs)
* Nodemon 
* Morgan
* Postman
* Apache2

Instalamos los programas
```
$ sudo snap install --classic code

$ sudo apt install npm
$ sudo apt install git
$ sudo snap install postman
$ sudo apt install apache2
$ sudo apt install -y mongodb
```

Trabajaremos en la carpeta **api-auth-reg**
```
$ mkdir api-auth-reg
$ cd api-auth-reg
```

Instalamos las bibliotecas
```
$ npm i -S express
$ npm i -D nodemon
$ npm i -S morgan
$ npm i -S mongodb
$ npm i -S mongojs
$ npm i -S bcrypt
$ npm i -S moment
$ npm i -S jwt-simple
$ npm i -S cors
```

Preparamos algunos programas:
#### Node
```
$ sudo npm clean -f
$ sudo npm i -g n
$ sudo n stable
```
Si queremos comprobar las versiones
```
$ node --version
$ npm -v
```
##### Express
Para crear nuestra aplicación **node+express** incorporamos en `index.js`:
```
const express = require('express');
```
#### Git
```
$ git config --global user.name gsl21
$ git config --global user.email gsl21@alu.ua.es
```
Depende de si partimos de un repositorio o no haremos unos comandos u otros.
En nuestro caso al empezar de 0 haremos lo siguiente:
```
$ git init
$ echo "# Servivio Web RESTFUL de Registro y Autenticación" > README.md
$ git remote -v
$ git remote add origin https://guthub.com/solsolet/api-auth-reg.git
$ git init //para poner nuestros datos en el package.json
```
Para subir nuestro progreso al repositorio haremos
```
$ git status
$ git add .
$ git commit -m "Nombre del commit"
$ git push -u origin master
```
#### Nodemon
Con Code incluimos en el archivo `package.json` en la sección de scripts para que invoque nodemon.
```
"start": "nodemon index.js",
```
#### Morgan
Lo configuramos como un middleware de Node, así tendremos un logger en nuestra aplicación.

En nuestro `index.js` pondremos:
```
const logger = require('morgan');
```

#### MongoDB
Iniciamos apache2 y mongoDB (puede ser en otra terminal):
```
$ sudo systemctl start apache2
$ sudo systemctl start mongodb
```
Podemos verificar el funcionamiento
```
$ mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```
abrimos el gestor de la case de datos:
```
$ mongo --host 127.0.0.1:27017
> show dbs
```

## Desarrollo 👩‍💻
Creamos el archivo `index.js`.
```
$ touch index.js
```
### Gestión de usuarios
Para empezar implementamos las funciones de GET, POST, PUT y DELETE para poder consultar, publicar modificar y borrar usuarios.

#### GET
Para obtener tanto todos los usuarios del distema como uno determinado
#### POST
Registramos un nuevo usuario con toda su información
#### PUT
Modificamos al usuario {id}
#### DELETE
Eliminamos al usuarip {id}

### Gestión de las autorizaciones
#### GET
Obtenemos todos los usuarios registrados en el sistema (versión reducida) o uno solo a partir de un token válido.

#### POST
Realiza un SingIn o SingUp y devuelve un token válido.
En ambos hay que rellenar el `body` de la petición en Postman con los campos requeridos y devolverá una respuesta en el formato `result`, `token` y `usuario`.
##### SingIn 📲
**api/auth**: identifica al usuario con el `email` y `password`. Se requieren obligatoriamente.
Comprueba que exista el email en la BD y que el password coincida (en `pass.service.js` las funciones se han vuelto síncronas para que funcione). También actualiza `lastLogin`.
##### SingUp 📝
**api/reg**: registro mínimo de usuario con el `nombre`, `email` y `password`. Se requieren obligatoriamente.
Comprueba que no exista el email en la BD y encripta el password. Añade `signUpDate`, `lastLogin` y guarda al usuario.


### HTTPS 🔒
Para que nuestras opraciones sean seguras implementamos la carpeta **cer** donde está el certificado y la clave que usaremos en `index.js` para hacer uso del protocolo https. Préviamente habremos instalado la librería de **cors**
```
const https = require('https');
const fs = require('fs');

const OPTIONS_HTTPS = { //declarar clau privada i certificat
    key: fs.readFileSync('./cer/key.pen'),
    cert: fs.readFileSync('./cer/cert.pen')
};

const cors = require('cors');
```
Luego hacemos unos cuantos middleware:
```
var allowMethods = (req,res,next) => {...}
var allowCrossTokenHeader = (req,res,next) => {...}
var allowCrossTokenOrigin = (req,res,next) => {...}
```
Y los usamos:
```
app.use(cors());
app.use(allowMethods);
app.use(allowCrossTokenHeader);
app.use(allowCrossTokenOrigin);
```
Para todas las funciones que necesiten de autorización añadiremos el parámetro de entrada **auth**.

### Criptografía y Tokens 🔑
Creamos nuestro repositorio. En `01_bcrypt.js`, importamos la librería **bcrypt** y ponemos nuestros datos para la simulación.
```
const bcrypt = require('bcrypt');

const miPass = 'miContraseña';
const badPass = 'miotraContraseña';
```
### Hash y Passwords encriptados
Creamos el **Salt** y lo utilizamos para generar el **Hash**
```
bcrypt.genSalt( ... ) => { 
    bcrypt.hash( ... )
}
```
Creamos el Hash **directamente** y compararemos con las contraseñas para ver qual es correcta
```
bcrypt.hash( miPass, 10, (err, hash) => {
    if(err) console.log(err);
    else {
        ...
        // contr correcta
        bcrypt.compare( miPass, hash, (err, result)=>{ ... });
        // contrassenya incorrecta
        bcrypt.compare( miPass, badPass, (err, result)=>{ ... });
    };
});
```
### Moment: fechas y tiempos ⏰
Podemos hacer pruebas con `moment` desde la terminal para ver alguna de sus funciones
```
$ date()
$ moment()
$ moment().unix()
```

### Services
Creamos una carpeta **services** y hacemos los archivos `pass.services.js` y `token.service.js`. En el primero encriptaremos el password y lo compararemos, en el segundo crearemos el token y lo decodificaremos.

## Servicio Auth JWT (tokens) ✅
Creamos fuera de  services los archivos `pass-test.js`, `config.js` y `jwt-test.js`.

## Ejecutando las pruebas ⚙️
Una vez picado el código correctamente, para su ejecución usaremos **Postman** y haremos las peticiones pertinentes. Todas ellas se encuentran en el archivo `postam_collection.json`.

Podemos ver que en Auth está elegido el `Type` Bearer Token y el token es el de un usuario cualquiera. Esta autorización es tratada con la función **auth** de `index.js`.


## Construido con 🛠️
* [VS Code](https://code.visualstudio.com) - Editor de texto
* [Postman](http://www.postman.com) - Plataforma API
* [MongoDB](https://www.mongodb.com) - Base de Datos
* [NodeJS](https://nodejs.org) - Base de Datos
* [Moment](https://npmjs.com/package/moment) - Librería
* [Bcrypt](https://npmjs.com/package/bcrypt) - Librería
* [JWT-simple](https://npmjs.com/package/jwt-simple) - Librería

## Versionado 📌
Para todas las versiones disponibles, mira los [tags](https://github.com/solsolet/api-auth-reg/tags).

## Autora ✒️
* **Gemma Sellés** - *Desarrollo de la práctica* - [gls21](https://github.com/solsolet)

## Licencia 📄
Este proyecto no está bajo ninguna licencia.