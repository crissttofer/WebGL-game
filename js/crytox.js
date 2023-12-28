let gl;
function iniciarGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		gl.verAnchoVentana = canvas.width;
		gl.verAltoVentana = canvas.height;
	} catch (e) { }
	if (!gl) {
		alert("Perdone, no se pudo inicializar WebGL");
	}
}


function conseguirShader(gl, id) {
	let shaderScript = document.getElementById(id);
	if (!shaderScript) { return null; }
	let str = "";
	let k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	let shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else { return null; }
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}
let progShader;
function iniciarShader() {
	let fragShader = conseguirShader(gl, "shader-fs");
	let vertShader = conseguirShader(gl, "shader-vs");
	progShader = gl.createProgram();
	gl.attachShader(progShader, vertShader);
	gl.attachShader(progShader, fragShader);
	gl.linkProgram(progShader);
	if (!gl.getProgramParameter(progShader, gl.LINK_STATUS)) {
		alert("Perdone, no pudo inicializarse el shaders");
	}
	gl.useProgram(progShader);
	progShader.vertPosAtributo = gl.getAttribLocation(progShader, "aVertPosicion");
	gl.enableVertexAttribArray(progShader.vertPosAtributo);
	progShader.textCoordAtributo = gl.getAttribLocation(progShader, "aTexturaCoord");
	gl.enableVertexAttribArray(progShader.textCoordAtributo);
	progShader.pMatrizUniform = gl.getUniformLocation(progShader, "uPMatriz");
	progShader.mvMatrizUniform = gl.getUniformLocation(progShader, "uMVMatriz");
	progShader.muestraUniform = gl.getUniformLocation(progShader, "uMuestra");
	progShader.colorUniform = gl.getUniformLocation(progShader, "uColor");
 }
function cargarManijaTextura(pTextura) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pTextura.imagen);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
function cargarManija(pDireccion){
	let textura = gl.createTexture();
	textura.imagen = new Image();
	textura.imagen.onload = function () {
		cargarManijaTextura(textura);
	};
	textura.imagen.src = pDireccion;
	return textura;
}
function iniciarTextura(pDireccion) {
	for(let i=0;i<4;i++){
		enemigoText[i]=cargarManija(pDireccion+i+".gif")
	}
	playerText=cargarManija("img/player.gif")
}
let mvMatriz = mat4.create();
let pMatriz = mat4.create();
function modificarMatrizUniforme() {
	gl.uniformMatrix4fv(progShader.pMatrizUniform, false, pMatriz);
	gl.uniformMatrix4fv(progShader.mvMatrizUniform, false, mvMatriz);
}
function sexRad(pAngulo) {
	return pAngulo * Math.PI / 180;
}
let keyPrecionado = {};
function keyDesactivo(event) {
	keyPrecionado[event.keyCode] = true;
}
function keyActivo(event) {
	keyPrecionado[event.keyCode] = false;
}

let enemigoText=[];
let playerText;
let traslacionX = 0;
let traslacionz = 0;
function manejoKey() {
	if(!gameover){
		if (keyPrecionado[39]) {
			if(traslacionX<6){
				traslacionX += 0.05;
			}
		}
		if (keyPrecionado[37]) {
			if(traslacionX>-6){
	
				traslacionX -= 0.05;
			}
		}
	
		if (keyPrecionado[40]) {
			if(traslacionz<6){
				traslacionz += 0.05;
			}
		}
		if (keyPrecionado[38]) {
			if(traslacionz>-6){
	
				traslacionz -= 0.05;
			}
		}
	}
	
}
function puntosPoligono(pPuntos, pVertice){
    let pol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pPuntos), gl.STATIC_DRAW);
    pol.itemTam = 3;
    pol.numItems = pVertice;
    return pol;
}
function coordenadaTextura(pCoord, pNumT){
	let polT = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, polT);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pCoord), gl.STATIC_DRAW);
    polT.itemTam = 2;
    polT.numItems = pNumT;
	return polT;
}
let aPtoEstrella, aCoordTextura;
function iniciarBuffer() {
	aPtoEstrella= puntosPoligono([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 4);
	aCoordTextura= coordenadaTextura([0, 0, 1, 0, 0, 1, 1, 1], 4);
}
function dibujarImagen(pTextura, pCoordTextura, pPtoEstrella) {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, pTextura);
	gl.uniform1i(progShader.muestraUniform, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pCoordTextura);
	gl.vertexAttribPointer(progShader.textCoordAtributo, pCoordTextura.itemTam, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, pPtoEstrella);
	gl.vertexAttribPointer(progShader.vertPosAtributo, pPtoEstrella.itemTam, gl.FLOAT, false, 0, 0);
	modificarMatrizUniforme();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, pPtoEstrella.numItems);
}
let mvMatrizPila = [];
function mvApilarMatriz() {
	let copiar = mat4.create();
	mat4.set(mvMatriz, copiar);
	mvMatrizPila.push(copiar);
}
function mvDesapilarMatriz() {
	if (mvMatrizPila.length == 0) {
		throw "Invalid popMatriz!";
	}
	mvMatriz = mvMatrizPila.pop();
}

  function random(min, max) {
	return Math.random() * (max - min) + min;
  }

  function coordenadas(min1, max1, min2, max2) {
    let num1 = Math.random() * (max1 - min1) + min1;
  
    let num2 = Math.random() * (max2 - min2) + min2;
  
    return Math.random() < 0.5 ? num1 : num2;
  }

class objeto{
	constructor(textura) {
		this.puntox = coordenadas(-5,-1.5,1.5,5);
		this.puntoz = coordenadas(-5,-1.5,1.5,5);
		this.direccionx=0;
		this.direccionz=0;
		this.textura=textura
	}

	draw(){
		mvApilarMatriz();	
		mat4.translate(mvMatriz, [this.puntox, 0, this.puntoz]);
		mat4.rotate(mvMatriz,Math.PI/2, [1.0, 0.0, 0.0]);	
		mat4.rotate(mvMatriz,Math.PI, [0, 0.0, 1.0]);	
		mat4.scale(mvMatriz,[0.3,0.3,0.3])
		gl.uniform3f(progShader.colorUniform, 1, 1, 1);
		dibujarImagen(this.textura, aCoordTextura, aPtoEstrella);
		mvDesapilarMatriz();
	};

	animacionP(){
		if (this.puntox<-6 || this.puntox>6) {
			this.direccionx *= -1;
		}
	
		if (this.puntoz<-6 || this.puntoz>6) {
			this.direccionz *= -1;
		}
		this.puntox += 0.02 * this.direccionx;
		this.puntoz += 0.02 * this.direccionz;
	};
	  
}

class enemigo extends objeto{
	constructor(textura){
		super(textura)
		this.direccionx=this.direccion();
		this.direccionz=this.direccion();
		this.anteriorx;
		this.anteriorz;
	}

	// posicionAnterior(){
	// 	this.anteriorx=
	// }
	detenerMovimiento() {
        this.puntox -= 0.04*this.direccionx;
        this.puntoz -= 0.04*this.direccionz;
        this.direccionx *= -1;
        this.direccionz *= -1;
    }

	direccion() {
		let numeroAleatorio = Math.random();
		return numeroAleatorio <= 0.5 ? 1 : -1;
	}

}
class jugador extends objeto{
	constructor(textura){
		super(textura)
		this.puntox = 0;
		this.puntoz = 0;
		this.escala=0.5;
	}
	draw(movx,movz){
		this.puntox = movx;
		this.puntoz = movz;
		mvApilarMatriz();	
		mat4.translate(mvMatriz, [this.puntox, 0, this.puntoz]);
		mat4.rotate(mvMatriz,Math.PI/2, [1.0, 0.0, 0.0]);	
		mat4.rotate(mvMatriz,Math.PI, [0, 0.0, 1.0]);	
		mat4.scale(mvMatriz,[this.escala,this.escala,this.escala])
		gl.uniform3f(progShader.colorUniform, 1, 1, 1);
		dibujarImagen(this.textura, aCoordTextura, aPtoEstrella);
		mvDesapilarMatriz();
	};
	colisiona(enemigo){
		for(let i in enemigo){
			if(Math.sqrt((this.puntox-enemigo[i].puntox)**2 + (this.puntoz-enemigo[i].puntoz)**2)<0.6){
				return true
			}
			
		}
	}

	muerto(){
		this.escala=1.5;
		this.textura=cargarManija("img/gameover.png")
	}
}

function colision(obj1,obj2){
	let distancia=Math.sqrt((obj1.puntox-obj2.puntox)**2 + (obj1.puntoz-obj2.puntoz)**2)
		if(distancia<0.47){
			return true;
		}
}
let enemigos = [];
let player;
let gameover=false;

function iniciarMundoObjeto() {
	let numEnemigos = document.getElementById("cantidad-enemigos").value;
	enemigos=[];
	player=0;
	gameover=false;
	for (let i=0; i < numEnemigos; i++) {
		enemigos.push(new enemigo(enemigoText[Math.floor(random(0,4))]));
	}
	player=new jugador(playerText)
	for(let i in enemigos){
		for(let j in enemigos){
			if(i==j){
				continue;
			}
			if(colision(enemigos[i],enemigos[j])){
				enemigos[i].puntox-=0.6;
				enemigos[j].puntox+=0.6;
			}
		}
	}
}

function dibujarEscena() {
	gl.viewport(0, 0, gl.verAnchoVentana, gl.verAltoVentana);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.verAnchoVentana / gl.verAltoVentana, 0.1, 100.0, pMatriz);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	mat4.identity(mvMatriz);
	mat4.translate(mvMatriz, [0.0, 0.0, -15]);
	
	mat4.rotate(mvMatriz, sexRad(90), [1.0, 0.0, 0.0]);

	for (let i in enemigos) {
		enemigos[i].draw();
	}	
	

	for(let i in enemigos){
		for(let j in enemigos){
			if(i==j){
				continue;
			}
			if(colision(enemigos[i],enemigos[j])){
				enemigos[i].detenerMovimiento()
				enemigos[j].detenerMovimiento()
			}
		}
	}
	if(!player.colisiona(enemigos)){
		
		player.draw(traslacionX,traslacionz);
	}else{
		gameover=true
		
	}
	if(gameover){
		traslacionX=0;
		traslacionz=0
		player.muerto()
		player.draw(traslacionX,traslacionz);
	}

}
let finTiempo = 0;
function animacion() {
	let tiempoActual = new Date().getTime();
	if (finTiempo != 0) {
		for (let i in enemigos) {
			enemigos[i].animacionP();
		}
		
	}
	finTiempo = tiempoActual;
}
function momento() {
	manejoKey();
	dibujarEscena();
	animacion();
	requestAnimFrame(momento);
}
function iniciarWebGL() {
	let canvas = document.getElementById("leccion06-brillo");
	iniciarGL(canvas);
	iniciarShader();
	iniciarBuffer();
	iniciarTextura("img/alien");
	iniciarMundoObjeto()
	gl.clearColor(0.0902, 0.1137, 0.1804, 1.0);
	document.onkeydown = keyDesactivo;
	document.onkeyup = keyActivo;
	momento();

}