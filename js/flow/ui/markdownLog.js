class MarkdownLog {
  constructor(canvas) {
    this.c = canvas;
    this.body = document.querySelector("body");
    this.description = `### Examen IFTS-16-DL2020 - Tema 1
    ___
    
    #### Completar las funciones para cada punto de manera que cada función cumpla con lo pedido. 
    En algunos de los casos las funciones se encuentran parcialmente implementadas.
    
    * Notas
     * Corré el test una vez para ver cual debe ser la salida esperada.
     * La salida debe ser exactamente igual a lo que espera el test.
     * Por simplicidad y para evitar posibles errores por ahora no usar acentos ni la letra ñ
     
    
    1) static void punto1() { }
    
        Un tambo necesita un sistema que le facilite administrar su producción.
        De cada vaca se sabe la cantidad de leche producida en un día y el total de vacas que hay en el tambo. 
        Se desea saber cuál es la producción total en un día y cuántas vacas producen por debajo 
        de los 10 litros diarios.
    
        ** Ejemplo de salida del programa **
        
        Examen DL2020 - Ingrese el punto a probar (1 a 4)
        1
        El Tambo
        Ingresar la cantidad de vacas
        2
        Vaca: 1
        Ingresar cantidad de leche producida
        5
        Vaca: 2
        Ingresar cantidad de leche producida
        6
        Produccion total: 11.0 litros
        Cantidad de vacas que produjeron menos de 10 litros: 2
    
    
    2) static void punto2() { }
    
        Una empresa que organiza carreras de 100 metros nos pide un sistema para automatizar la información de sus carreras.
        Para ello de cada corredor se sabe el nombre y el tiempo que tardo en terminar la carrera en segundos.
        Se desea hacer un sistema que permita ingresar estos datos y nos diga quien salió primero y quien salió 
        último junto con el tiempo que tardó.
    
        ** Ejemplo de salida del programa **
        
        Examen DL2020 - Ingrese el punto a probar (1 a 4)
        2
        La carrera
        nombre
        Pedro
        tiempo
        11.3
        Ingresar nuevo corredor? (S o N)
        S
        nombre
        Andres
        tiempo
        10.5
        Ingresar nuevo corredor? (S o N)
        N
        Salio primero: Andres con un tiempo de: 10.5 segundos
        Salio ultimo: Pedro con un tiempo de: 11.3 segundos
    
    
    3) static void punto3() { }
    
        Una profesora necesita un programa que dado un texto cuente la cantidad de vocales que hay en el texto
    
        ** Ejemplo de salida del programa **
        
        Examen DL2020 - Ingrese el punto a probar (1 a 4)
        3
        Contador de vocales
        Ingresar texto
        hola
        La cantidad de vocales es de: 2
        
    
    4) static void punto4() { }
        
        Se pide hacer un programa en el cual el usuario ingrese un texto y una letra y el programa nos diga cual es la
        primera posición en el texto donde se encuentra la letra. La primera posición del texto será la número 0.
        Si el programa no encuentra la letra en el texto debera decir: "No se encontro la letra en el texto"
        
        ** Ejemplo de salida del programa **
        
        Examen DL2020 - Ingrese el punto a probar (1 a 4)
        4
        Buscador de la primer letra en un texto
        Ingresar texto
        casa
        Ingresar letra
        s
        Se encontro la letra en la posicion: 2`;
  }

  render() {
    this.container = document.createElement("div");
    this.container.setAttribute("class", "overlay");
    this.container.innerHTML = this.template();
    this.body.appendChild(this.container);
    this.addListener();
  }

  template() {
    return `
		  <section class="markdown-log-container">
		    <span id="closeMD">X</span>
		    <hr class="hr-center-ball">
		    <div id="innerMarkDownDesc" class="markdown-body markdown-body-custom custom-gray-scroll">
		      ${marked(this.description)}
		    </div>
		  </section>`;
  }

  checkMDFile(compositeId) {
    //load spinner
    //  	if(!compositeId) {
    this.render();
    return;
    //  	}
    defaultAjaxRequest
      .setUrl(IS_FLOWCHART_FILE)
      .courseTreeOperation(
        { projectCompositeId: compositeId, fileName: "description.md" },
        (data) => {
          if (data.error) {
            browxyStartUp.toast.show({
              type: "error",
              title: "Message",
              message: data.message,
              icon: FlowIcons.getIcon({
                icon: "error",
                title: "Error",
                id: "Utils.uuid()",
                className: "iconsvg-error",
                timeout: 3000,
              }),
            });
            Utils.stopLoader();
            return;
          }
          if (data) {
            this.loadMDFileContent(compositeId);
          } else {
            this.render();
          }
        }
      );
  }

  loadMDFileContent(compositeId) {
    const urlFile = `${compositeId}/description.md`;
    CompilerService.getTreeNodeContents(urlFile, {
      callback: (d) => {
        const content = JSON.parse(d).content;
        this.c.mdDescriptionContent = content;
        this.description = content;
        this.render();
      },
    });
  }

  addListener() {
    this.close = document.querySelector("#closeMD");
    this.close.addEventListener("click", this.handleClose.bind(this));
  }

  handleClose() {
    this.container.remove();
  }
}
