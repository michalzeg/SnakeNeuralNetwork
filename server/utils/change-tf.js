const replace = require('replace-in-file');
const options = {
  files: ['../training/learning/**'],
  from: /@tensorflow\/tfjs/g,
  to: '@tensorflow/tfjs-node',
};
try {
const result = replace.sync(options);
console.log('Replacement results:', result);
}
catch (error) {
  console.error('Error occurred:', error);
}