// 这句的意思就是引入 `express` 模块，并将它赋予 `express` 这个变量等待使用。
var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require("fs");
var mkdirp = require('mkdirp');
var url = 'http://www.facets.la/'
// 调用 express 实例，它是一个函数，不带参数调用时，会返回一个 express 实例，将这个变量赋予 app 变量。
var app = express();
var dir = './images';
mkdirp(dir, function (err) {
    if (err) {
        console.log(err);
    }
});

superagent
    .get(url)
    // .set('Accept', 'application/json, text/plain, */*')
    // .set('Accept-Encoding', 'gzip, deflate, br')
    // .set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8')
    // .set('Authorization', `timestamp=1510647084;oauth2=0fd5995f3828776aee63f431e6a68c27;signature=f4ab366eb7ec27bcf7e093714c0dfc73;scene=2567a5ec9705eb7ac2c984033e06189d`)
    // .set('Connection', 'keep-alive')
    // .set('Host', 'api.zuber.im')
    // .set('Origin', 'http://www.zuber.im')
    // .set('Referer', 'http://www.zuber.im/')
    // .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
    .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
            return next(err);
        }
        var $ = cheerio.load(sres.text);
        var data = {
            body: sres
        }
        var urlArr = [];
        $('.thumb-image').find('img').each(function (index, el) {
            var subUrl = $(el).attr('src')
            subUrl = subUrl.replace('/thumbnail/T', '/wallpaper/W')
            urlArr.push(subUrl)
        })
        urlArr.map((el, index) => {
            download(el)
        })
    });
var download = function (url) {
    return new Promise(function (resolve, reject) {
        superagent.get(url).end((err, res) => {
            if (err) {
                reject(url + '下载失败')
            } else {
                console.log(url + '下载中')
                fs.writeFileSync(dir + "/" + Math.floor(Math.random() * 100000) + url.substr(-4, 4), res.body, null)
                resolve(url + '下载完成')
            }
        })
    })
}

// 定义好我们 app 的行为之后，让它监听本地的 5000 端口。这里的第二个函数是个回调函数，会在 listen 动作成功后执行，我们这里执行了一个命令行输出操作，告诉我们监听动作已完成。
app.listen(5000, function () {
    console.log('app is listening at port 5000');
});