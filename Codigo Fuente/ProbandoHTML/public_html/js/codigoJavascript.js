// son los caracteres que conforman el alfabeto
const LETRAS_MINUSCULAS=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const LETRAS_MAYUSCULAS=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const DIGITOS=[0,1,2,3,4,5,6,7,8,9];
const SIGNOS_PUNTUACION=['.',',',':',';'];
const OPERADORES_ARITMETICOS=['+','-','*','/','%'];
const SIGNOS_AGRUPACION=['(',')','[',']','{','}'];
const ESPACIO_SALTO_LINEA=['','\n'];
// son los nombres de los tokens
const IDENTIFICADOR="Identificador";//inicia con letra seguido de letras o digitos
const NUMERO="Numero";//solo digitos
const DECIMAL="Decimal";//n numeros seguidos de punto seguido de mas numeros
const PUNTUACION="Puntuacion";// solo los simbolos de puntuacion
const OPERADOR="Operador";// solo los simbolos de operador
const AGRUPACION="Agrupacion";// solo los simbolos de agrupacion
// son los distintos nombres que reciben los caracteres
const PALABRA_LETRA="letra";
const PALABRA_DIGITO="digito";
const PALABRA_SIGNO_PUNTUACION="signoPuntuacion";
const PALABRA_OPERADOR_ARITMETICO="operadorAritmetico";
const PALABRA_SIGNO_AGRUPACION="signoAgrupacion";
const PALABRA_ESPACIO_SALTO_LINEA="espacioSaltoLinea";
// variable que servira para llevar el control
var banderaReporteTokens=true;
// arreglos que tendran diferentes textos
var lexema = new Array();
var veces= new Array();
var zonaDatos;

// aqui es donde empezara  a leerse el archivo de entrada
function introducirDatos(){
    zonaDatos= document.getElementById("zonaDatos");
//    zonaDatos.disabled =true;
    var archivos = document.getElementById("archivos");
    archivos.addEventListener("change",procesar,false);
    }
// aqui se procesa el archivo de entrada
function procesar(e){// agarra los datos de textto que tiene el archivo
    var archivos= e.target.files;
    var miArchivo=archivos[0];
    var lector=new FileReader();
    lector.readAsText(miArchivo);// los lee y los manda al metodo mostrar informacion
    lector.addEventListener("load", mostrarInformacion,false);
    
}
// aqui es donde se introducen los datos del archivo al text area
function mostrarInformacion(e){
    var resultado=e.target.result;
    zonaDatos.innerHTML=null;// introduce codigo html al index
    zonaDatos.outerHTML= '<textarea id="zonaDatos" placeholder="Informacion" rows="20" cols="100">'+resultado+'</textarea>';

}
// funcion que sirve para numerar las columnas que estan en el text area
function numerar(){
    var nvalor='';// agarra el documento
    var contenido = document.getElementById('zonaDatos').value;
    var lineas = contenido.split('\n');// les hace un split
     // y conforme las filas que tenga asi iran introduciendose
    for(var i = 0;i < lineas.length;i++){
        nvalor  += (i+1)+ '\n';
    }// aqui añade al text area de filas los valores
    document.getElementById('filas').value = nvalor;
}
// esta es como la funcion padre es la que se encarga de evaluar las cadenas del texto  
function validarCadena(){
    // con esto nos aseguramos que el analisis sea independiente cada vez que se ejecute el metodo
    numerar();
    eliminarFilasTablaErrores("tablaTokens");
    eliminarFilasTablaErrores("tablaLexemas");
    eliminarFilasTablaErrores("tablaErrores");
    
    eliminarDatosLexema();//bandera que servira para la logica
    banderaReporteTokens=true;
    var cadena=document.getElementById("zonaDatos").value;
    var caracterInicial;// divide el texto en vectores por medio del salto de linea
    var vectorLineas = String(cadena).split("\n");
    for(var j=0;j<vectorLineas.length;j++){     // ahora divide los vectores en otros vectores por medio de espacios  
        var vectorCadenas= String(vectorLineas[j]).split(" ");
        var numeroColumna=0;
        for (var i=0;i<vectorCadenas.length;i++){// aqui mira el caracter inicial para verificar puntualmente
            caracterInicial=verificarTipo(vectorCadenas[i]);
            // aqui es donde se llamaran a las distintas posibilidades de una cadena
            if(caracterInicial===PALABRA_LETRA){
                verificarIdentificador(j+1,vectorCadenas[i],numeroColumna);
            }// aqui es donde se diferencia un numero entero con un decimal
            if(caracterInicial===PALABRA_DIGITO){
                String(vectorCadenas[i]);// verifica si existe un punto
                var indice = String(vectorCadenas[i]).indexOf(".");
                if(indice===-1){// si no existe un punto significa que es un numero entero
                    verificarNumero(j+1,vectorCadenas[i],numeroColumna);
                }else{// si existe el punto verifica el decimal
                    verificarDecimal(j+1,vectorCadenas[i],numeroColumna);
                }
            }// si la cadena empieza con un signo puntuacion entra aqui y verifica
            if(caracterInicial===PALABRA_SIGNO_PUNTUACION){
                verificarTamañoCadena(j+1,vectorCadenas[i],1,numeroColumna);
            }// aqui verifica si cumple lo de un operador artmetico
            if(caracterInicial===PALABRA_OPERADOR_ARITMETICO){
                verificarTamañoCadena(j+1,vectorCadenas[i],2,numeroColumna);
            }// aqui verifica si cumple lo de un signo de agrupacion
            if(caracterInicial===PALABRA_SIGNO_AGRUPACION){
                verificarTamañoCadena(j+1,vectorCadenas[i],3,numeroColumna);
            }// si no es ningun simbolo definido termina aqui y muestra que no es un simbolo aceptado
            if(caracterInicial===undefined){
                insertarFilaTablaErrores(j+1,vectorCadenas[i],numeroColumna);
                banderaReporteTokens=false;
            }
            numeroColumna+=vectorCadenas[i].length+1;
        }
    }// si no hubieron errores significa que se puede mostrar los reportes de exito
    if(banderaReporteTokens===true){
        document.getElementById("etiquetaBotonTablaTokens").style.display='block';
        document.getElementById("etiquetaBotonErrores").style.display='none';
    }else{// si existio algun error muestra el reporte de errores
       document.getElementById("etiquetaBotonTablaTokens").style.display='none';
       document.getElementById("etiquetaBotonErrores").style.display='block';
    }
    // introduce datos a la tabla del lexema
    introducirDatosTablaLexema();
}

//funciona muy bien, verifica con que tipo de caracter inicia la cadena y la retorna
function verificarTipo(cadena){
    var caracterInicial;
    // ciclo que verifica si cumplen las cadenas con el alfabeto
    for(var i=0;i<LETRAS_MINUSCULAS.length;i++){// si cumple con letras mayusculas o minusculas
        if(cadena.charAt(0)===LETRAS_MINUSCULAS[i] || cadena.charAt(0)===LETRAS_MAYUSCULAS[i]){
            caracterInicial=PALABRA_LETRA;
            break;
        }// si cumple con ser un digito o no
        if(parseInt(cadena.charAt(0))===DIGITOS[i] && parseInt(DIGITOS[i])!==null){
            caracterInicial=PALABRA_DIGITO;
            break;
        }// si cuple con ser un signo de puntuacion
        if(cadena.charAt(0)===SIGNOS_PUNTUACION[i] && SIGNOS_PUNTUACION[i]!==null){
            caracterInicial=PALABRA_SIGNO_PUNTUACION;
            break;
        }// si cuple con ser un operador aritmetico
        if(cadena.charAt(0)===OPERADORES_ARITMETICOS[i] && OPERADORES_ARITMETICOS[i]!==null){
            caracterInicial=PALABRA_OPERADOR_ARITMETICO;
        }// si cuple con ser un signo agrupacoin
        if(cadena.charAt(0)===SIGNOS_AGRUPACION[i] && SIGNOS_AGRUPACION[i]!==null){
            caracterInicial=PALABRA_SIGNO_AGRUPACION;
            break;
        }// si es un salto de linea
        if(cadena.charAt(0)===ESPACIO_SALTO_LINEA[i] && ESPACIO_SALTO_LINEA[i]!==null){
            caracterInicial=PALABRA_ESPACIO_SALTO_LINEA;
        }
    }// devuelve el caracter inicial
    return caracterInicial;
}
// verifica si cumple con el token identificador
function verificarIdentificador(numeroFila, cadena,numeroColumna){
    var bandera=true;
    var columna=numeroColumna;
    for(var i=0;i<cadena.length;i++){
        var caracter = cadena.charAt(i);
        if(cicloLetra(caracter)===false){// si no cumple con ser un identificador manda el error
            if(cicloDigitos(caracter)===false){// lo inserta en la tabla
                columna+=i;
                insertarFilaTablaErrores(numeroFila,cadena,columna);
                bandera=false;
                banderaReporteTokens=false;
                break;
            }
        }// si cumple el token entocnes lo agrega a la tabla de tokens
    }if(bandera===true){
         insertarFilaTablaTokens(numeroFila,IDENTIFICADOR,cadena,columna);
         recuentoDeLexemas(cadena);
    }

}// verifica si cumple ser un numero la cadena
function verificarNumero(numeroFila, cadena,numeroColumna){
    var bandera = true;
    var columna=numeroColumna;
    for(var i=0;i<cadena.length;i++){
        var caracter = cadena.charAt(i);
        if(cicloDigitos(caracter)===false){// si no cumple manda el error 
            columna+=i;
            insertarFilaTablaErrores(numeroFila,cadena,columna);
            bandera=false;
            banderaReporteTokens=false;
            break;
        }
    }// si cumple manda el token bueno a la tabla tokens
    if(bandera===true){
         insertarFilaTablaTokens(numeroFila,NUMERO,cadena,columna);
         recuentoDeLexemas(cadena);
    }
    
}// la funcion verifica si cumple con ser un decimal, si cumple
function verificarDecimal(numeroFila, cadena,numeroColumna){
    var bandera = true;
    var columna=numeroColumna;
    for(var i=0;i<cadena.length;i++){
        var caracter = cadena.charAt(i);// verifica si es un punto si no entra
        if(caracter!=='.'){
            if(cicloDigitos(caracter)===false){// verifica si cumple ser un numero
                columna+=i;
                insertarFilaTablaErrores(numeroFila,cadena,columna);
                bandera=false;// reporta el error
                banderaReporteTokens=false;
                break;
            }
        }else{// luego si es el punto agarra la cadena y mira si cumple con eso
            var validacion=String(cadena).substring(i,cadena.length-1);
            if(validacion.length<1 || validacion===undefined){
                columna+=i;
                insertarFilaTablaErrores(numeroFila,cadena,columna);
                bandera=false;
                banderaReporteTokens=false;
                break;
            }
        }
    }// si la bandera es tru reporta en la tbala toknes
    if(bandera===true){
         insertarFilaTablaTokens(numeroFila,DECIMAL,cadena,columna);
         recuentoDeLexemas(cadena);
    }
}// verifica si es valido algun operador o signo especifico
function verificarTamañoCadena(numeroFila, cadena, tipo,numeroColumna){
    var bandera=true;
    var columna=numeroColumna;
    var tipoAuxiliar;
    if(cadena.length>1){// si la cadena tiene mas de un caracter manda el error ya que solo acepta 1
        columna+=1;
        insertarFilaTablaErrores(numeroFila,cadena,columna);
        bandera=false;
        banderaReporteTokens=false;
    }else{// si no es asi mira a que signo u operador hace referncia
        if(tipo===1){
            tipoAuxiliar=PUNTUACION;
        }if(tipo===2){
            tipoAuxiliar=OPERADOR;
        }if(tipo===3){
            tipoAuxiliar=AGRUPACION;
        }// inserta la tabla tokens la fila
        insertarFilaTablaTokens(numeroFila,tipoAuxiliar,cadena,columna);
        recuentoDeLexemas(cadena);
    }
}
// hace un ciclo para ver si el caracter esta en los caracteres pertinentes mayusculas o minusculas
function cicloLetra(caracter){
    for(var i=0;i<LETRAS_MINUSCULAS.length;i++){
        if(caracter===LETRAS_MINUSCULAS[i] || caracter===LETRAS_MAYUSCULAS[i]){
            return true;
        }   
    }
    return false;
}// hace un ciclo para ver si el caracter esta en los caracteres pertinentes digito
function cicloDigitos(caracter){
    for(var i=0;i<DIGITOS.length;i++){
        if(parseInt(caracter)===DIGITOS[i]){
            return true;
        }   
    }
    return false;
}// hace un ciclo para ver si el caracter esta en los caracteres pertinentes signo puntuacion
function cicloSignosPuntuacion(caracter){
    for(var i=0;i<SIGNOS_PUNTUACION.length;i++){
        if(caracter===SIGNOS_PUNTUACION[i]){
            return true;
        }   
    }
    return false;
}// hace un ciclo para ver si el caracter esta en los caracteres pertinentes operador aritmetico
function cicloOperadoresAritmeticos(caracter){
    for(var i=0;i<OPERADORES_ARITMETICOS.length;i++){
        if(caracter===OPERADORES_ARITMETICOS[i]){
            return true;
        }   
    }
    return false;
}
// hace un ciclo para ver si el caracter esta en los caracteres pertinentes signo agrupacion
function cicloSignoAgrupacion(caracter){
    for(var i=0;i<SIGNOS_AGRUPACION.length;i++){
        if(caracter===SIGNOS_AGRUPACION[i]){
            return true;
        }   
    }
    return false;
}// hace un ciclo para ver si el caracter esta en los caracteres pertinentes espacio o salto linea
function cicloEspacioSalto(caracter){
    for(var i=0;i<ESPACIO_SALTO_LINEA.length;i++){
        if(caracter===ESPACIO_SALTO_LINEA[i]){
            return true;
        }   
    }
    return false;
}
// muestra la tabla errores en una ventana emergente 
function mostrarTablaErrores(){
  var ventanaEmergente = window.open("", "", "width=640,height=480,resizeable,scrollbars"),
  tabla = document.getElementById("tablaErrores");
  ventanaEmergente.document.write(tabla.outerHTML);
  ventanaEmergente.document.close();

}
// muestra la tabla tokens en una ventana emergente
function mostrarTablaTokens(){
  var ventanaEmergente = window.open("", "", "width=640,height=480,resizeable,scrollbars"),
  tabla = document.getElementById("tablaTokens");
  ventanaEmergente.document.write(tabla.outerHTML);
  ventanaEmergente.document.close();
}

// inserta valores a la tabla errores
function insertarFilaTablaErrores(filaError,palabra,columnaError){
    var tabla=document.getElementById("tablaErrores");
    var fila = tabla.insertRow(1);// inserta siempre en la primera casilla y manda al resto uno abajo
    var primeraCasilla = fila.insertCell(0);
    var terceraCasilla = fila.insertCell(1);
    var segundaCasilla = fila.insertCell(2);
    
    // sirve para insertar en la columnas pertinentes
    primeraCasilla.outerHTML = '<td style="border:1px solid black" name="numero_f[]">'+filaError+'</td>';
    terceraCasilla.outerHTML = '<td style="border:1px solid black" name="codigo_p[]">'+columnaError+'</td>';
    segundaCasilla.outerHTML = '<td style="border:1px solid black" name="codigo_p[]">'+palabra+'</td>';

}
// esta funcion inserta valores a la tabla tokens
function insertarFilaTablaTokens(posicion,token, lexema,numeroColumna){
    var tabla=document.getElementById("tablaTokens");
    var fila = tabla.insertRow(1);// inserta siempre en la primera casilla y manda al resto uno abajo
    var primeraCasilla = fila.insertCell(0);
    var cuartaCasilla = fila.insertCell(1);
    var segundaCasilla = fila.insertCell(2);
    var terceraCasilla = fila.insertCell(3);// sirve para insertar en la columnas pertinentes
    primeraCasilla.outerHTML = '<td style="border:1px solid black" name="numero_f[]">'+posicion+'</td>';
    cuartaCasilla.outerHTML = '<td style="border:1px solid black" name="numero_f[]">'+numeroColumna+'</td>';
    segundaCasilla.outerHTML = '<td style="border:1px solid black" name="codigo_p[]">'+token+'</td>';
    terceraCasilla.outerHTML = '<td style="border:1px solid black" name="codigo_p[]">'+lexema+'</td>';
}

// aqui verifica cuantas veces se repite un lexema
function recuentoDeLexemas(cadena){
    var banderaEsPalabraNueva=true;
    console.log(lexema[0]);
    for (var i=0;i<lexema.length;i++){
        if(cadena.length===lexema[i].length){
            for(var j=0;j<lexema[i].length;j++){
                var banderaSiCumpleLexema=true;//verifica si el lexema se repite o no
                if(cadena.charAt(j)!==lexema[i].charAt(j)){
                    banderaSiCumpleLexema=false;
                    break;
                }
            }// si el lexema se repite solo agrega una unidad a las veces repetida
            if(banderaSiCumpleLexema===true){
                veces[i]=veces[i]+1;
                banderaEsPalabraNueva=false;
            }
        }
    }// si no existe se crea un elemento del vector para luego ya empezar a sumarle.
    if(banderaEsPalabraNueva===true){
        var numero=1;
        lexema.push(cadena);
        veces.push(numero);
    }
}
// introduce los datos a la tabla lexemas por medio de un ciclo
function introducirDatosTablaLexema(){
    for(var i=0;i<lexema.length;i++){
        insertarFilaTablaLexema(lexema[i],veces[i]);
    }
    
}// aqui inserta lexema por lexema es por eso necesario el ciclo anterior
function insertarFilaTablaLexema(lexema, vecesRepetido){
    var tabla=document.getElementById("tablaLexemas");
    var fila = tabla.insertRow(1);// inserta valor en la primera fila
    var primeraCasilla = fila.insertCell(0);
    var segundaCasilla = fila.insertCell(1);// inserta los valores en las columnas pertinentes
    primeraCasilla.outerHTML = '<td style="border:1px solid black" name="numero_f[]">'+lexema+'</td>';
    segundaCasilla.outerHTML = '<td style="border:1px solid black" name="codigo_p[]">'+vecesRepetido+'</td>';
}
// muestra la tabla lexemas, en una ventana emergente 
function mostrarTablaLexemas(){
  var ventanaEmergente2 = window.open("", "", "width=640,height=480,resizeable,scrollbars"),
  tabla = document.getElementById("tablaLexemas");
  ventanaEmergente2.document.write(tabla.outerHTML);
  ventanaEmergente2.document.close();

}
// elimina los datos del arreglo para hacer cada analisis independiente
function eliminarDatosLexema(){
    lexema.splice(0,lexema.length);
    veces.splice(0,veces.length);
}


// elimina los valores de la tabla segun su id para hacer cada analisis independiente
function eliminarFilasTablaErrores(id){
    var tabla = document.getElementById(id);
        for(var a=1;a<tabla.rows.length;a++){
            tabla.deleteRow(a);
            if(tabla.rows.length>1){
                eliminarFilasTablaErrores(id);
            }
        }    
}
// esta funcion es la encargada de buscar los patrones dentro del texto y colocarlas en un parrafo
function buscarPatrones(){
    var palabra = document.getElementById("textoPatron").value;
    if(palabra===""){// si no hay texto que evaluar dice que no se puede porque no hay nada
        alert("No hay texto que evaluar por favor introduce texto");
    }else{// de lo contrario entra
        var bandera;// agarra el parrafo y lo deja vacio por si ya existia informacion
        document.getElementById("zonaPatrones").innerHTML="";
        var datos= document.getElementById("zonaDatos").value;// agarra los datos que se analizaran
        var datosAColocar = document.getElementById("zonaPatrones");
        datosAColocar.innerHTML+='<p><h1>RECONOCIMIENTO DE PATRONES</h1></p>';// ingresa un titulo
        var vectorLineas = String(datos).split("\n");// divide el texto en vectores por medio de saltos de linea
        for(var j=0;j<vectorLineas.length;j++){       
            var vectorCadenas= String(vectorLineas[j]).split(" ");// divide los vectores en vectores por medio de espacios
            for (var i=0;i<vectorCadenas.length;i++){
                bandera=validarString(vectorCadenas[i],palabra);// valida el string si es el buscado o no
                if(bandera===true){// si es el caso lo subraya para indicar que se encontro un lexema igual
                    datosAColocar.innerHTML+='<u>'+vectorCadenas[i]+'</u>'+" ";
                }else{// si no solo agrega la palabra sin subrayar
                    datosAColocar.innerHTML+=vectorCadenas[i]+" ";
                }
            }// agrega un salto de linea
            datosAColocar.innerHTML+="<br>";
        }
    }
}
// valida el string que le mandan, si es igual al que se esta buscando manda la bandera que ese es
function validarString (cadenaAnalizar, cadenaSolicitada) {
    var bandera=true;
    var banderaTieneInicial=false;
// verifica si cumple aunque sea el caracter inicial
    var caracterInicial=cadenaSolicitada.charAt(0);
   var existePatron=true;//bandera para analizarla luego
   for (var i = 0; i<cadenaAnalizar.length; i++) {
       bandera=true;// verifica el caracter inicial
       if(caracterInicial===cadenaAnalizar.charAt(i)){
          banderaTieneInicial=true;// corta la cadena 
          var cadenaCortada = String(cadenaAnalizar).substring(i);
          // verifica la cadena cortada, es decir analiza solo la parte cortada
          for(var a=0;a<cadenaSolicitada.length;a++){
              if(cadenaSolicitada.charAt(a)!==cadenaCortada.charAt(a)){
                  bandera=false;
                  existePatron=false;
                  break;
              }else{// si el patron va correspondiendo sigue
                  existePatron=true;
              }// verifica que no sea null
              if(cadenaCortada.charAt(a)===-1){
                  bandera=false;
                  return false;
              }
          }// si existe el patron antes de terminar la cadena de una vez manda que si se puede
          if(existePatron===true){
              bandera=true;
              break;
          }
       }
    }// retorna la bandera
    if(banderaTieneInicial===false){
        return false;
    }// verifica si cumple las condiciones para mandar true
    if(bandera===true && banderaTieneInicial===true && existePatron===true){
        return true;
    }
}  
// descarga la informacion en un archivo de texto
function descargarArchivo(){
    // lo que hace es recuperar la informacion de la tabla
    var datos=document.getElementById("zonaDatos").value;
    var nombre=document.getElementById("nombreArchivo").value;
    var archivoACrear = document.createElement('a');// crea el elemento a utilizar
    archivoACrear.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(datos));
    archivoACrear.setAttribute('download', nombre);// ahora lo descarga
    archivoACrear.style.display = 'none';// crea el estilo que no se muestre
    document.body.appendChild(archivoACrear);
    archivoACrear.click();// llama al evento click y ejecuta la descarga
    document.body.removeChild(archivoACrear);
}