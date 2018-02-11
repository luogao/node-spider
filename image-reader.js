var path = require('path')
var tesseratc = require('node-tesseract')
var image = path.resolve(__dirname, 'test.png')

function imageReader(image, options) {
    let _options = Object.assign({
        psm: 7
    }, options)
    return new Promise((resolve, reject) => {
        tesseratc.process(image, _options, (err, text) => {
            if (err) {
                return reject(err)
            } else {
                resolve(text)
            }
        })
    })
}

imageReader(image).then(text => {
    console.log(text)
}).catch(err => {
    console.log(err)
})