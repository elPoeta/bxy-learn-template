class WizardItems {
   
  static getAllItems() {
    return ['define', 'code', 'input', 'output', 'doWhile', 'while', 'for', 'if', 'wrap']
            .map(str => { 
              return { type: `${str}Block`, items: WizardItems.getDefaultItems()
            }}); 
  }
  
  static getItemsByTypeBlock(items, typeBlock) {
    return (typeBlock === 'startBlock' || typeBlock === 'endBlock') ? [] 
      : items.filter(item => item.type === typeBlock)[0]
          .items.map(subItem => {
            return {
              ...subItem,  
              items: subItem.items.filter(item => {
                if(typeBlock !== 'codeBlock')
                  return item.name !== 'return';
                return item;
              }).sort((a,b) => a.pos - b.pos)
            }
          }).sort((a,b) => a.pos - b.pos);
  }
  
  static getDefaultItems() {
    return [
      {
        group: "arithmetics",
        pos: 0,
        items: [
          {
            type: 'arithmetic',
            name: 'addition',
            displayValue: '+',
            value: '+',
            userValue: '+',
            enable: true,
            isNew: false,
            color: {
              bg: "#FFECB3",
              font: "#000000"  
            },
            pos: 0
          },
          {
            type: 'arithmetic',
            name: 'subtraction',
            displayValue: '-',
            value: '-',
            userValue: '-',
            enable: true,
            isNew: false,
            color: {
              bg: "#FFCC80",
              font: "#000000"  
            },
            pos: 1
          },
          {
            type: 'arithmetic',
            name: 'multiplication',
            displayValue: '*',
            value: '*',
            userValue: '*',
            enable: true,
            isNew: false,
            color: {
              bg: "#CE93D8",
              font: "#000000"  
            },
            pos: 2
          },
          {
            type: 'arithmetic',
            name: 'division',
            displayValue: '/',
            value: '/',
            userValue: '/',
            enable: true,
            isNew: false,
            color: {
              bg: "#80DEEA",
              font: "#000000"  
            },
            pos: 3
          },
          {
            type: 'arithmetic',
            name: 'module',
            displayValue: '%',
            value: '%',
            userValue: '%',
            enable: true,
            isNew: false,
            color: {
              bg: "#FFE082",
              font: "#000000"  
            },
            pos: 4
          },
        ]
      },
      {
        group: "conditions",
        pos: 1,
        items:  [
          {
            type: 'condition',
            name: 'equal',
            displayValue: '==',
            value: '==',
            userValue: '==',
            enable: true,
            isNew: false,
            color: {
              bg: "#A5D6A7",
              font: "#000000"  
            },
            pos: 0
          },
          {
            type: 'condition',
            name: 'greater-than',
            displayValue: '>',
            value: '>',
            userValue: '>',
            enable: true,
            isNew: false,
            color: {
              bg: "#E6EE9C",
              font: "#000000"  
            },
            pos: 1
          },
          {
            type: 'condition',
            name: 'less-than',
            displayValue: '<',
            value: '<',
            userValue: '<',
            enable: true,
            isNew: false,
            color: {
              bg: "#FFD54F",
              font: "#000000"  
            },
            pos: 2
          },
          {
            type: 'condition',
            name: 'greater-than-equal',
            displayValue: '>=',
            value: '>=',
            userValue: '>=',
            enable: true,
            isNew: false,
            color: {
              bg: "#FF9100",
              font: "#000000"  
            },
            pos: 3
          },
          {
            type: 'condition',
            name: 'less-than-equal',
            displayValue: '<=',
            value: '<=',
            userValue: '<=',
            enable: true,
            isNew: false,
            color: {
              bg: "#E1BEE7",
              font: "#000000"  
            },
            pos: 4
          },
          {
            type: 'condition',
            name: 'not-equal',
            displayValue: '!=',
            value: '!=',
            userValue: '!=',
            enable: true,
            isNew: false,
            color: {
              bg: "#FFCDD2",
              font: "#000000"  
            },
            pos: 5
          }, 
        ]
      },
      {
        group: "logicals",
        pos: 2,
        items: [
          {
            type: 'logical',
            name: 'and',
            displayValue: 'AND',
            value: 'AND',
            userValue: '&&',
            enable: true,
            isNew: false,
            color: {
              bg: "#F48FB1",
              font: "#000000"  
            },
            pos: 0
          },
          {
            type: 'logical',
            name: 'or',
            displayValue: 'OR',
            value: 'OR',
            userValue: '||',
            enable: true,
            isNew: false,
            color: {
              bg: "#BCAAA4",
              font: "#000000"  
            },
            pos: 1
          },
          {
            type: 'logical',
            name: 'not',
            displayValue: 'NOT',
            value: 'NOT',
            userValue: '!',
            enable: true,
            isNew: false,
            color: {
              bg: "#FFAB91",
              font: "#000000"  
            },
            pos: 2
          }
        ]
      },
      {
        group: "helpers",
        pos: 3,
        items: [
          {
            type: 'helper',
            name: 'assign',
            displayValue: 'Assign', 
            value: 'Assign',
            userValue: '=',
            enable: true,
            isNew: false,
            color: {
              bg: "#1DE9B6",
              font: "#000000"  
            },
            pos: 0
          },
          {
            type: 'helper',
            name: 'open-parenthesis',
            displayValue: '(',
            value: '(',
            userValue: '(',
            enable: true,
            isNew: false,
            color: {
              bg: "#B0BEC5",
              font: "#000000"  
            },
            pos: 1
          },
          {
            type: 'helper',
            name: 'close-parenthesis',
            displayValue: ')',
            value: ')',
            userValue: ')',
            enable: true,
            isNew: false,
            color: {
              bg: "#BDBDBD",
              font: "#000000"  
            },
            pos: 2
          },
          {
            type: 'helper',
            name: 'wildcard',
            displayValue: 'wildcard',
            value: 'wildcard',
            userValue: '',
            enable: true,
            isNew: false,
            color: {
              bg: "#37474F",
              font: "#FFFFFF"  
            },
            pos: 3
          },
          {
            type: 'helper',
            name: 'return',
            displayValue: 'return',
            value: 'return',
            userValue: 'return',
            enable: true,
            isNew: false,
            color: {
              bg: "#64DD17",
              font: "#000000"  
            },
            pos: 4
          }
        ]
      },
      {
        group: "inputs",
        pos: 4,
        items: [
          {
            type: 'input',
            name: 'number',
            displayValue: 'Number',
            value: 'Number',
            userValue: 0,
            enable: true,
            isNew: false,
            color: {
              bg: "#4DB6AC",
              font: "#000000"  
            },
            pos: 0
          },
          {
            type: 'input',
            name: 'text',
            displayValue: 'Text',
            value: 'Text',
            userValue: '""',
            enable: true,
            isNew: false,
            color: {
              bg: "#64B5F6",
              font: "#000000"  
            },
            pos: 1
          },
          {
            type: 'input',
            name: 'bool',
            displayValue: 'Bool',
            value: 'Bool',
            userValue: false,
            enable: true,
            isNew: false,
            color: {
              bg: "#D7CCC8",
              font: "#000000"  
            },
            pos: 2          
          },
          {
            type: 'input',
            name: 'variable',
            displayValue: 'Variable',
            value: 'Variable',
            userValue: '',
            enable: true,
            isNew: false,
            color: {
              bg: "#E57373",
              font: "#000000"  
            },
            pos: 3
          },
          {
            type: 'input',
            name: 'function',
            displayValue: 'Function',
            value: 'Function',
            userValue: '',
            enable: true,
            isNew: false,
            color: {
              bg: "#AFB42B",
              font: "#000000"  
            },
            pos: 4
          }
        ]
      }
    ] 
  }
}