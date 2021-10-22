
/*
express （使用express来搭建一个简单的Http服务器。当然，你也可以使用node中自带的http模块）
superagent （superagent是node里一个非常方便的、轻量的、渐进式的第三方客户端请求代理模块，用他来请求目标页面）
cheerio （cheerio相当于node版的jQuery，用过jQuery的同学会非常容易上手。它主要是用来获取抓取到的页面元素和其中的数据信息）
*/
import { areaList } from './area.js'
import express from 'express'
import SuperAgent from 'superagent';
import Cheerio from 'cheerio';
import Nightmare from 'nightmare';
const nightmare = Nightmare({ show: true }); 
const app = express()
let server = app.listen(8000, '0.0.0.0', () => {

})
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.post('/area', (req, res) => {
  //console.log(JSON.stringify(req.body) === JSON.stringify({}))
  if (JSON.stringify(req.body) === JSON.stringify({})) {
    console.log('1')
  } else {
    console.log(req.body)
  }
  //console.log(req.body)
  //res.send('hello')
})
let data = []
let getList = (htmlStr) => {
  let $ = Cheerio.load(htmlStr);
  $('li.list-item').each((idx, ele) => {
    let msg = {
      area: $(ele).children('a').children('.district').text().toString().replace(/\[|]|\s|(本级)/g,""),
      time: $(ele).children('span.date').text(),
      title: $(ele).children('a').attr('title'),
      href: `http://www.ccgp-guangxi.gov.cn${$(ele).children('a').attr('href')}`
    }
    data.push(msg)
  })
}
nightmare
.goto(areaList[0].url)
.wait("div.list-container ul")
.evaluate(() => document.querySelector("div.list-container ul").innerHTML)
.then(htmlStr => {
  getList(htmlStr)
  //console.log(data)
})
.catch(error => {
  console.log(error);
})