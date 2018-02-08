var path = require('path')
var tesseratc = require('tesseract.js')
var image = path.resolve(__dirname, 'test.png')

tesseratc.recognize(image)
    .progress(function(p) { console.log('progress', p) })
    .then(data => {
        console.log('then\n', data.text)
    })
    .catch(err => {
        console.log('catch\n', err)
    })
    .finally(e => {
        console.log('finally\n')
    })



//     var path = require('path')
// var tesseratc = require('node-tesseract')
// var image = path.resolve(__dirname, 'test.png')

// tesseratc.process(image,function(err, text){
//     if(err){
//         console.error(err)
//     }else{
//         console.log(text)
//     }
// })