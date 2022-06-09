class JSONFileManager {

  isJsonFile({ projectCompositeId, executeGet, executeCreate, isLoadContent }) {
    defaultAjaxRequest
      .setUrl(IS_FLOWCHART_FILE)
      .courseTreeOperation({ projectCompositeId, fileName: "flowchart.json" }, data => {
        if(data.error) {
          Dialog.noticeDialog({ title: "Message", text: data.message });
          Utils.stopLoader();
          return;
        }
        if (data) {
          if(isLoadContent) {
            this.getJsonFileContent({ projectCompositeId, executeGet });            
          } else {
            this.getJsonFileOk({ projectCompositeId, executeGet });
          }
        } else {
          this.createJsonFile({ projectCompositeId, executeCreate });
        }
      });
   }
  
  getJsonFileContent({ projectCompositeId, executeGet }) {
    const urlFile = `${projectCompositeId}/flowchart.json`;
    CompilerService.synchronizeProject(projectCompositeId, {
      callback: d => {
        CompilerService.getTreeNodeContents(urlFile, {
          callback: d => {
            executeGet(d);
          }
        });
      }
    });
  }
  
  getJsonFileOk({ projectCompositeId, executeGet }) {
    executeGet();
  }
  
  createJsonFile({ projectCompositeId, executeCreate }) {
    CompilerService.createTreeNode('file', `${projectCompositeId}`, 'flowchart.json', {
      callback: d => {
        executeCreate();
      }
    });
  }
  
  getFlowchartJsonContent(languageOutput) {
    return {
      "langOut": languageOutput,
      "wizardItems": [],
      "palette": {},
      "colors": {},
      "program": {
        "0": {
          "blocks": [],
          "blocksOutside": [],
          "tab": {
            "name": "main",
            "type": "main"
          }
        },
        "1": {
          "blocks": [],
          "blocksOutside": [],
          "tab": {
            "name": "functions",
            "type": "f_repo",
          }
        }
      }
    }
  }
  
  saveJsonFile({ projectCompositeId, content }, fn) {
    const className = "com.browxy.compiler.domain.api.dwr.CompilerService";  
    const methodName = "saveFileContents";
    const args = [{
      "java.lang.String": projectCompositeId+"/flowchart.json"
    }, 
    {
      "java.lang.String": content
    }];
    defaultAjaxRequest.compilerAjaxPost(className, methodName, JSON.stringify(args, null, 2), 
      () => { fn(); }, ErrorMessage.ajaxErrorHandler );
  }
  
  createDownloadLink(filename, data) {
    const dataUri = `data:application/octet-stream;charset=utf-8,${encodeURIComponent(data)}`;
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataUri);
    anchor.setAttribute('download', filename);
    return anchor;
  }
}