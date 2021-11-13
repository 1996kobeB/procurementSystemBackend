/*
express （使用express来搭建一个简单的Http服务器。当然，你也可以使用node中自带的http模块）
superagent （superagent是node里一个非常方便的、轻量的、渐进式的第三方客户端请求代理模块，用他来请求目标页面）
cheerio （cheerio相当于node版的jQuery，用过jQuery的同学会非常容易上手。它主要是用来获取抓取到的页面元素和其中的数据信息）
*/
import { areaList } from "./area.js";
import express from "express";
import SuperAgent from "superagent";
import Cheerio from "cheerio";
import Nightmare from "nightmare";
import fs from "fs";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
dayjs.extend(isSameOrBefore);
const nightmare = Nightmare({ show: false });
const app = express();
let server = app.listen(8000, "0.0.0.0", () => {});
//响应请求;
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.post("/area", (req, res) => {
	if (JSON.stringify(req.body) === JSON.stringify({})) {
		let dataSheet = [];
		for (let i in jsonData) {
			dataSheet.push(...jsonData[i]);
		}
		res.end(JSON.stringify(dataSheet));
	} else {
		if (req.body.areaName && !req.body.address && !req.body.startTime) {
			res.end(JSON.stringify(jsonData[req.body.areaName]));
		}
		if (req.body.areaName && req.body.address && !req.body.startTime) {
			let dataSheet = [];
			for (let i in jsonData[req.body.areaName]) {
				if (jsonData[req.body.areaName][i].address === req.body.address) {
					dataSheet.push(jsonData[req.body.areaName][i]);
				}
			}
			res.end(JSON.stringify(dataSheet));
		}
		if (req.body.startTime && !req.body.areaName && !req.body.address) {
			let dataSheet = [];
			for (let i in jsonData) {
				for (let j in jsonData[i]) {
					if (!dayjs(jsonData[i][j].time).isSameOrBefore(req.body.startTime)) {
						dataSheet.push(jsonData[i][j]);
					}
				}
			}
			res.end(JSON.stringify(dataSheet));
		}
		if (req.body.startTime && req.body.areaName && !req.body.address) {
			let dataSheet = [];
			for (let i in jsonData) {
				for (let j in jsonData[i]) {
					if (
						!dayjs(jsonData[i][j].time).isSameOrBefore(req.body.startTime) &&
						jsonData[i][j].areaName === req.body.areaName
					) {
						dataSheet.push(jsonData[i][j]);
					}
				}
			}
			res.end(JSON.stringify(dataSheet));
		}
		if (req.body.startTime && req.body.areaName && req.body.address) {
			let dataSheet = [];
			for (let i in jsonData) {
				for (let j in jsonData[i]) {
					if (
						!dayjs(jsonData[i][j].time).isSameOrBefore(req.body.startTime) &&
						jsonData[i][j].areaName === req.body.areaName &&
						jsonData[i][j].address === req.body.address
					) {
						dataSheet.push(jsonData[i][j]);
					}
				}
			}
			res.end(JSON.stringify(dataSheet));
		}
	}
});

// 数据整理
let getList = (htmlStr, box, area, time, title, href, name) => {
	let data = [];
	let $ = Cheerio.load(htmlStr);
	$(box).each((idx, ele) => {
		let msg = {
			areaName: name,
			address: $(ele)
				.children(`${area[0]}:first`)
				.children(area[1])
				.text()
				.toString()
				.replace(/\[|]|\s|(本级)/g, ""),
			time: $(ele).find(time[0]).text(),
			projectTitle:
				name === "海南"
					? $(ele).find(title[0]).text()
					: $(ele).find(title[0]).attr(title[1]),
			//$(ele).find(title[0]).attr(title[1]),
			projectUrl: `${href[0]}${$(ele).find(`${href[1]}:first`).attr(href[2])}`,
		};
		data.push(msg);
	});
	return data;
};

// 爬取数据
var i = 0;
let spider = async (obj) => {
	let ul = obj.ul;
	await nightmare
		.goto(obj.url)
		.wait(obj.ul)
		.evaluate((ul) => {
			return document.querySelector(ul).innerHTML;
		}, ul)
		.then((htmlStr) => {
			let data = getList(
				htmlStr,
				obj.box,
				obj.area,
				obj.time,
				obj.title,
				obj.href,
				obj.name
			);
			jsonData[obj.name].push(...data);
			saveJson(jsonData);
		})
		.catch((error) => {
			console.log(error);
		});
};
const loop = async (arr) => {
	if (i < arr.length && arr[i]) {
		await spider(arr[i]);
		++i;
		await loop(arr);
	} else {
		console.log("finish");
	}
};
loop(areaList);
setInterval(() => {
	loop(areaList);
}, 43200000);
// 存入json
let saveJson = (data) => {
	let dataStr = JSON.stringify(data);
	if (dataStr) {
		try {
			fs.writeFileSync("./data.json", dataStr);
		} catch (err) {
			console.log(err);
		}
	}
};
// 读json
let jsonData = {};
let loadJson = () => {
	let json = fs.readFileSync("./data.json");
	jsonData = JSON.parse(json);
};
loadJson();
