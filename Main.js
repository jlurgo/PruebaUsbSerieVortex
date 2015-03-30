var onDeviceReady = function() {  
	DivConsola.start();
	console.log("Arrancando..");

    
    vx.conectarCon(new NodoUsbHost());
    
    
	var errorCallback = function(message) {
		console.log('Error: ' + message);
	};
	
	var abrirPuertoSerie = function(){
		serial.open ({baudRate: 115200},
			function(successMessage) {
				console.log("puerto serie abierto:", successMessage);
				$("#btn_enviar").bind('touchstart', function(){
					var mensaje = JSON.stringify({
							estadoBoton:"presionado"
						})+'|';
					console.log(mensaje);
					serial.write(
						mensaje,
						function(successMessage) {
							console.log(successMessage);
						},
						function(err){
							console.log("error al enviar por puerto serie:", err);
						}
					);	
				});

				$("#btn_enviar").bind('touchend', function(){
					var mensaje = JSON.stringify({
							estadoBoton:"suelto"
						})+'|';
					console.log(mensaje);
					serial.write(
						mensaje,
						function(successMessage) {
							console.log(successMessage);
						},
						function(err){
							console.log("error al enviar por puerto serie:", err);
						}
					);	
				});
				
				var recibir_mensaje = function(mensaje_str){
					var mensaje;
					try{
						mensaje = JSON.parse(mensaje_str);
					}catch(err){
						console.log("error al parsear:", mensaje_str);
					}
					if(mensaje.estadoBoton == "presionado")	$("#led").addClass("led_encendido");
					if(mensaje.estadoBoton == "suelto")	$("#led").removeClass("led_encendido");
				};
			
				var buffer_entrada_serie = "";
				serial.registerReadCallback(
					function(data){
						var view = new Uint8Array(data);
						buffer_entrada_serie += String.fromCharCode.apply(null, view);
						console.log("recibido:", String.fromCharCode.apply(null, view));
						var mensajes_en_buffer = buffer_entrada_serie.split('|');
						if(mensajes_en_buffer.length>1){
							recibir_mensaje(mensajes_en_buffer[0]);
							buffer_entrada_serie = "";
							for(var i=1; i<mensajes_en_buffer.length; i++){
								buffer_entrada_serie+=mensajes_en_buffer[i] + "|";
							}
							buffer_entrada_serie = buffer_entrada_serie.substring(0,buffer_entrada_serie.length-2);
						}						
					},
					function(err){
						console.log("error al registrar callback:", err);
					}
				);
			},
			function(err){
				console.log("error al abrir puerto serie:", err);
			}
		);
	};
	
	serial.requestPermission(
		 function(successMessage) {
			console.log("permiso concedido para usar puerto serie:", successMessage);
			serial.close(function(){
				console.log("puerto serie cerrado");
				abrirPuertoSerie();
			}, function(err){
				console.log("error al cerrar puerto serie");
				abrirPuertoSerie();
			});
		},
		function(err){
			console.log("error al pedir permiso para usar puerto serie:", err);
		}
	);
};

$(document).ready(function() {  
    //toda esta garcha es para detectar si la aplicacion esta corriendo en un celular o en una pc.
    //En el celular para arrancar la app hay que esperar al evento deviceReady, en la pc solo al documentReady
    window.isphone = false;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        window.isphone = true;
    }

    if(window.isphone) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
});

