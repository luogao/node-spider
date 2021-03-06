const express = require('express');
const app = express();
const superagent = require('superagent');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const { URL } = require('url');
const AV = require('leancloud-storage');
const cors = require('cors')

const appId = 'Luwn37983MFGl7WXp5Pc5GfR-gzGzoHsz';
const appKey = 'SnC2PpwJR5qJu1HQedf0m8QC';
const whitelist = ['http://localhost:8080', 'https://lglzy.cn']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

AV.init({ appId, appKey });

app.use(cors())// 设置跨域

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb' }));

const getInfo = async (url) => {
    const urlObj = new URL(url)
    const query = new AV.Query('Category')
    query.equalTo('name', urlObj.host)
    const result = await query.find().then(result => result)
    if (result.length > 0) {
        return new Promise((resolve, reject) => {
            superagent.get(url).end((err, sres) => {
                if (err) {
                    reject(err)
                } else {
                    const $ = cheerio.load(sres.text);
                    const read_title = $('title').text()
                    const data = {
                        read_title,
                        favicon: result[0].get('favicon'),
                        hostId: result[0].get('objectId'),
                        host_name: urlObj.host,
                        host_display_name: urlObj.host,
                        host_protocol: urlObj.protocol
                    }
                    resolve(data)
                }
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            superagent.get(url).end((err, sres) => {
                if (err) {
                    reject(err)
                } else {
                    const $ = cheerio.load(sres.text);
                    const read_title = $('title').text()
                    let favicon;
                    $('link').each(function (index, el) {
                        if ($(el).attr('rel').indexOf('shortcut icon') !== -1 || $(el).attr('rel').indexOf('shortcut') !== -1) {
                            favicon = $(el).attr('href')
                        }
                    })
                    const data = {
                        read_title,
                        favicon: favicon ? favicon : -1,
                        host_name: urlObj.host,
                        host_display_name: urlObj.host,
                        host_protocol: urlObj.protocol
                    }
                    resolve(data)
                }
            })
        })
    }
}

app.post('/api/getinfo', function (req, res) {
    const link = req.body.link
    if (link) {
        getInfo(link).then(data => {
            res.send(data)
        }).catch(err => {
            console.log(err)
        })
    }
});

app.get('/api/', function (req, res) {
    res.send('hello world!')
});

// 定义好我们 app 的行为之后，让它监听本地的 3000 端口。这里的第二个函数是个回调函数，会在 listen 动作成功后执行，我们这里执行了一个命令行输出操作，告诉我们监听动作已完成。
app.listen(3000, function () {
    console.log('app is listening at port 3000');
});
