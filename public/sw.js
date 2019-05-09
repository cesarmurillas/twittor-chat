// imports
importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js');
importScripts('js/sw-db.js');
importScripts('js/sw-utils.js');



const STATIC_CACHE    = 'static-v1';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';


const APP_SHELL = [
    //'/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/camara-class.js',
    'js/sw-utils.js',
    'js/libs/pugins/mdtoast.min.css',
    'js/libs/pugins/mdtoast.min.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js'
];



self.addEventListener('install', e => {


    const cacheStatic = caches.open( STATIC_CACHE ).then(cache => 
        cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => 
        cache.addAll( APP_SHELL_INMUTABLE ));



    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );

});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            console.log('KEY: ', key);

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil( respuesta );

});




//Estrategia Cache with network update
self.addEventListener( 'fetch', e => {

    let respuesta;

    if(e.request.url.includes('/api')){

        respuesta =  manejoApiMensajes(DYNAMIC_CACHE, e.request);

    } else {
        respuesta = caches.match(e.request).then(res => {

            if (res) {

                actualizaCacheStatico(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
                return res;
            } else {

                return fetch(e.request).then(newRes => {

                    return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);

                });

            }

        });
    }

    e.respondWith( respuesta );

});

//Tareas asincronas

self.addEventListener('sync', e =>{
    console.log('SW: Sync');

    if(e.tag === 'nuevo-post'){

        //Postear a BD cuando hay conexion

        const respuesta = postearMensajes();

        e.waitUntil(respuesta);
    }
});


//Escuchar PUSH
self.addEventListener('push', e =>{
    const data = JSON.parse(e.data.text());
    //console.log(data);
    const title = data.titulo;
    const options = {
        body: data.cuerpo,
        //icon: 'img/icons/icon-72x72.png'
        icon: `img/avatars/${data.usuario}.jpg`,
        badge: 'img/favicon.ico',
        image: 'img/avengers-tower.jpg',
        vibrate: [125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600],
        openUrl: '/',
        data: {
            //url: 'https://www.ceiba.com.co/devfest2019/',
            url: '/',
            id: data.usuario
        },
        actions: [
            {
                action: 'thor-action',
                //title: 'Thor',
                title: 'Si por favor',
                icon: '/img/avatar/thor.jpg'
            },
            {
                action: 'ironman-action',
                //title: 'Ironman',
                title: 'No gracias',
                icon: '/img/avatar/ironman.jpg'
            }
        ]
    };
    e.waitUntil(self.registration.showNotification(title, options));
});


self.addEventListener('notificationclose', e =>{
    console.log('Notificacion cerrada', e);
});

self.addEventListener('notificationclick', e =>{

    const notificacion = e.notification;
    const accion = e.action;

    console.log({notificacion, accion});

    const respuesta = clients.matchAll()
    .then( clientes => {
        let cliente = clientes.find( c => {
            return c.visibilityState === 'visible';
        });

        if(cliente !== undefined){
            cliente.navigate( notificacion.data.url);
            cliente.focus();
        } else {
            clients.openWindow(notificacion.data.url);
        }
        notificacion.close();
    });   
    e.waitUntil(respuesta);

    

});


