// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push');

const mensajes = [
  {
    _id: 'msg',
    user: 'spiderman',
    mensaje: 'Hola mundo',
    date: getDateToString(new Date())
  }
];


function getDateToString(current_datetime) {

  return formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
};



// Get mensajes
router.get('/', function (req, res) {
  //res.json('Obteniendo mensajes');
  res.json(mensajes);
});

// Post mensajes
router.post('/', function (req, res) {

  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user,
    date: getDateToString(new Date())
  };

  mensajes.push(mensaje);

  console.log(mensajes);

  res.json({
    ok: true,
    mensaje
  });

});

//Almacenar la suscripcion
router.post('/subscribe', (req, res) => {


  const suscripcion = req.body;

  push.addSubscription(suscripcion);

  //console.log(suscripcion);

  res.json('subscribe');

});

//Almacenar la suscripcion
router.get('/key', (req, res) => {

  const key = push.getKey();

  res.send(key);

});

//Enviar una notificacion push a las personas
//que nosotros queramos
//Es algo que se controla del lado del server
router.post('/push', (req, res) => {

  const post = {
    titulo: req.body.titulo,
    cuerpo: req.body.cuerpo,
    usuario: req.body.usuario
  };

  push.sendPush(post);

  res.json(post);

});

module.exports = router;