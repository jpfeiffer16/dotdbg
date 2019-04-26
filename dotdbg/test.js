const blessed = require('blessed');
// const contrib = require('blessed-contrib');
const tree = require('./client/tree.js');
const uuidv4 = require('uuid/v4');

const screen = blessed.screen({
  smartCSR: true
});

screen.key('q', () => {
  process.exit(0);
});


let expressionList = tree({fg: 'green'});
// expressionList.setData({
//   extended: true,
//   children: {
//     'Test': {
//       children: {
//         'Test1': {},
//         'Test2': {}
//       }
//     }
//   }
// });
screen.append(expressionList);
expressionList.focus();
screen.render();

function setData(name, variablesReference) {
  expressionList.setData({
    extended: true,
    name,
    variablesReference,
    children: resolve
  });
  screen.render();
}

let num = 0;
function resolve(self, resolvedCb) {
  if (!self.childrenContent) {
    // if (num++ < 300) {
      const data = {};
      for (let i = 0; i < 5; i++) {
        data[uuidv4()] = {
          extended: false,
          children: resolve
        };
      }
      resolvedCb(data);
    // }
    screen.render();
  }
}

setInterval(() => screen.render(), 300);

setData('test', 123);

// const box = blessed.box({
//   width: '100%',
//   height: '100%',
//   border: 'line',
//   draggable: 'true'
// });
// screen.append(box);
//
// const text = blessed.textbox({
//   left: 1,
//   right: 1,
//   width: '100%',
//   // height: '1',
//   border: 'line',
//   value: 'test',
//   inputOnFocus: true
// });
// // setInterval(() => text.focus(), 300);
// box.append(text);
// text.readEditor();
//
// screen.render();
//
// text.readInput();

// const testList =
// blessed.list({
//   parent: screen,
//   label: ' {bold}{cyan-fg}Art List{/cyan-fg}{/bold} (Drag Me) ',
//   tags: true,
//   draggable: true,
//   top: 0,
//   right: 0,
//   width: '100%',
//   height: '50%',
//   keys: true,
//   vi: true,
//   mouse: true,
//   border: 'line',
//   scrollbar: {
//     ch: ' ',
//     track: {
//       bg: 'cyan'
//     },
//     style: {
//       inverse: true
//     }
//   },
//   style: {
//     item: {
//       hover: {
//         bg: 'blue'
//       }
//     },
//     selected: {
//       bg: 'blue',
//       bold: true
//     }
//   },
//   search: function(callback) {
//     prompt.input('Search:', '', function(err, value) {
//       if (err) return;
//       return callback(null, value);
//     });
//   }
// });
//

