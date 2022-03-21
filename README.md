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
* NodeJS (con bcrypt, moment y jwt-simple)
* Git
* Code (o similar)

Instalamos los programas
```
$ sudo snap install --classic code

$ sudo apt install npm
$ sudo apt install git
```
Creamos carpeta de trabajo:
```
$ mkdir node
$ cd node
$ mkdir auth-test
$ cd auth-test
```
Instalamos las bibliotecas
```
$ npm i -S bcrypt
$ npm i -S moment
$ npm i -S jwt-simple
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
#### Git
```
$ git config --global user.name gsl21
$ git config --global user.email gsl21@alu.ua.es
```
Depende de si partimos de un repositorio o no haremos unos comandos u otros.

### Carpetas
Trabajaremos en la carpeta **api-auth-reg**
```
mkdir api-auth-reg
cd api-auth-reg
```
Creamos el repositorio local
```
git init
echo "# tal" > README.md
git remote -v
git remote add origin https://guthub.com/solsolet/api-auth-reg.git
```

## Criptografía y Tokens ⚙️

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
### Moment: fechas y tiempos
Podemos hacer ppruebas con moment desde la terminal para ver alguna de sus funciones
```
$ date()
$ moment()
$ moment().unix()
...
```
### Services

Creamos una carpeta **services** y hacemos los archivos `pass.services.js` y `token.service.js`. En el primero encriptaremos el password y lo compararemos, en el segundo crearemos el token y lo decodificaremos

## Servicio Auth JWT (tokens) ✅

Creamos fuera de  services los archivos `pass-test.js`, `config.js` y `jwt-test.js`.

## Construido con 🛠️

* [VS Code](https://code.visualstudio.com) - Editor de texto
* [NodeJS](https://nodejs.org) - Base de Datos
* [Moment](https://npmjs.com/package/moment) - Librería
* [Bcrypt](https://npmjs.com/package/bcrypt) - Librería
* [JWT-simple](https://npmjs.com/package/jwt-simple) - Librería

## Versionado 📌

Para todas las versiones disponibles, mira los [tags](https://github.com/tu/proyecto/tags).

## Autora ✒️

* **Gemma Sellés** - *Trabajo Inicial* - [gls21](https://github.com/solsolet)


## Licencia 📄

Este proyecto no está bajo ninguna licencia.