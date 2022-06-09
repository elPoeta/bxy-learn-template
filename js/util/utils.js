class Utils {
  
  static loader() {
    if (document.querySelector('.loader')) {
      document.querySelector('.loader').style.display = 'block';
      setTimeout(() => {
        document.querySelector('.loader').style.display = 'none';
      }, 20000);
    }
  }
  
  static stopLoader() {
    if (document.querySelector('.loader')) {
      clearTimeout(Utils.loader);
      document.querySelector('.loader').style.display = 'none';
    }
  }
  
  static parseJsonObject(str) {
    try {
      const strParsed = JSON.parse(str);
      return strParsed;
    } catch (error) {
        console.log("Error :: ", error.message);
        return {};
      }
  } 
  
  static dispatchMouseEvent(props) {
    const { touch, type, element } = props;
    const options = !Utils.isEmpty(touch) ? { clientX: touch.clientX, clientY: touch.clientY } : touch;
    element.dispatchEvent(new MouseEvent(type, options));
  }
  
  static parseBlocksStateToString(variableState) {
    return JSON.stringify(variableState.state, (key, value) => {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: [...value],
        };
      } else if (value instanceof Set) {
        return {
          dataType: 'Set',
          value: [...value],
        };
      } else {
        return value;
      }
    });
  }

  static parseBlocksStateToJson(blockState) {
    return JSON.parse(blockState, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value);
        }
        if (value.dataType === 'Set') {
          return new Set(value.value);
        }
      }
      return value;
    });
  }
  
  static isEmpty(value) {
    return value === undefined ||
      value === null ||
      (typeof value === "object" && Object.keys(value).length === 0) ||
      (typeof value === "string" && value.trim().length === 0);
  }
  
  static endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
  
  static render(route) {
    if(document.querySelector(rightNavigation)){
      Bootstrap.loadRightNavigationContent(route);  
    } else {
      UpdateView.loadPhoneNavigationContent(route)
    }  
  }
  
  static responsiveTable(cssVarColNum) {
    const cssColNum = cssVarColNum || 2;
    if(document.querySelector(rightNavigation)) {
      if(ROOT_ID.offsetWidth > 600 || cssColNum >= 3) {
        document.querySelectorAll('.teacher-course-header li')
        .forEach(el=> el.classList.remove('cut-text'))
      }  
    }
  }
  
  static uuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  }
  
  static selecting(state) {
    if (!state) {
      document.getElementById('selecting').innerHTML = "body{-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}";
    } else {
        document.getElementById('selecting').innerHTML = "";
     }
   }
  
  static hasCssBackdrop() {
    return CSS.supports('backdrop-filter', 'blur(5px)');
  }
}