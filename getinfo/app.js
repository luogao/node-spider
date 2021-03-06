const path = require('path')
const express = require('express');
const app = express();
const superagent = require('superagent');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const { URL } = require('url');
const AV = require('leancloud-storage');
const appId = 'Luwn37983MFGl7WXp5Pc5GfR-gzGzoHsz';
const appKey = 'SnC2PpwJR5qJu1HQedf0m8QC';

AV.init({ appId, appKey });
app.set('views', path.join(__dirname, 'views'))// 设置存放模板文件的目录
app.set('view engine', 'ejs')// 设置模板引擎为 ejs
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb' }));

const getInfo = async (url) => {
    const urlObj = new URL(url)
    const query = new AV.Query('Category')
    query.equalTo('name', urlObj.host)
    const result = await query.find().then(result => result)
    if (result.length > 0) {
        console.log('has')
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
                        host_name: urlObj.host,
                        host_display_name: urlObj.host,
                        host_protocol: urlObj.protocol
                    }
                    resolve(data)
                }
            })
        })
    } else {
        console.log('no')
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
                        favicon,
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

app.get('/', function (req, res) {
    const query = new AV.Query('Category');
    // 按时间，升序排列
    query.ascending('createdAt');
    query.find().then(data => {
        const category = data.map(el => {
            return {
                favicon: el.get('favicon'),
                name: el.get('name'),
                display_name: el.get('display_name'),
                protocol: el.get('protocol')
            }
        })
        console.log(category)
        res.render('index', {
            category: category
        })
    }).catch(err => {
        console.log(err)
        res.render('index', {
            category: []
        })
    })
})

app.get('/getinfo', function (req, res) {
    const link = 'https://juejin.im/post/5aab40bef265da23826dba61?utm_medium=fe&utm_source=weixinqun'
    if (link) {
        getInfo(link).then(data => {
            console.log(data)
            res.send(data)
        }).catch(err => {
            console.log(err)
            res.send(err)
        })
    }
});



// 定义好我们 app 的行为之后，让它监听本地的 3000 端口。这里的第二个函数是个回调函数，会在 listen 动作成功后执行，我们这里执行了一个命令行输出操作，告诉我们监听动作已完成。
app.listen(3000, function () {
    console.log('app is listening at port 3000');
});