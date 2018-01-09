// 这句的意思就是引入 `express` 模块，并将它赋予 `express` 这个变量等待使用。
var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var fs = require("fs");
var mkdirp = require('mkdirp');
var url = 'http://www.facets.la'
// 调用 express 实例，它是一个函数，不带参数调用时，会返回一个 express 实例，将这个变量赋予 app 变量。
var app = express();
var dir = './images';
var subUrlArr = [];
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
        let requestArr = []
        // 常规的错误处理
        if (err) {
            console.log(err)
        }
        var $ = cheerio.load(sres.text);
        $('.thumb-image').find('a').each(function (index, el) {
            var subUrl = $(el).attr('href')
            subUrlArr.push(subUrl)
        })
        console.log('获取链接中......')
        subUrlArr.forEach((mainURl, index, arr) => {
            requestArr.push(getDownloadUrl(mainURl, index, arr.length))
        })
        Promise.all(requestArr).then(res => {
            let counter = 0
            let length = res.length
            console.log('链接获取成功！准备开始下载......')

            function downloadLoop(index) {
                download(res[index].url).then((_res) => {
                    console.log(_res)
                    if (index + 1 !== length) {
                        counter++
                        downloadLoop(counter)
                    } else {
                        console.log("图片下载全部完成")
                    }
                })
            }
            downloadLoop(0)

        })
    });

function download(downloadUrl) {
    console.log('开始下载' + downloadUrl)
    return new Promise((resolve, reject) => {
        superagent.get(downloadUrl).end((err, res) => {
            if (res.ok) {
                fs.writeFile(dir + "/" + Math.floor(Math.random() * 100000) + downloadUrl.substr(-4, 4), res.body, function () {
                    resolve('下载成功')
                })
            } else {
                reject(err)
                console.log(downloadUrl + '下载失败！')
            }
        })
    })
}

function getDownloadUrl(url, cur, total) {
    let imgUrl = '';
    let _cur = cur;
    let _total = total;
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end(function (err, res) {
                if (res.ok) {
                    let $ = cheerio.load(res.text);
                    let condition = ($('div.size13').find("a").text() == "Download Wallpaper")
                    let data = {};
                    if (condition) {
                        imgUrl = $('div.size13').find("a").attr("href")
                    } else {
                        imgUrl = $('#facet-image > img').attr('src')
                    }
                    data = {
                        url: imgUrl,
                        cur: _cur,
                        total: _total
                    }
                    console.log("已获取第" + (_cur + 1) + "个链接\r");
                    resolve(data)
                } else {
                    // resolve('请手动下载' + url)
                }
            })
    })

}



// 定义好我们 app 的行为之后，让它监听本地的 5000 端口。这里的第二个函数是个回调函数，会在 listen 动作成功后执行，我们这里执行了一个命令行输出操作，告诉我们监听动作已完成。
app.listen(5000, function () {
    console.log('app is listening at port 5000');
});