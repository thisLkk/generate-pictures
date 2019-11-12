const express = require("express");
const app = express();
const bodyParser = require('body-parser'); // 快速获取请求参数
const fs = require("fs");
const pathDist = "./dist"; // 文件夹
var isExist_ = true; // 判断是否有文件夹

app.use(express.static("www")); // 静态资源
// 使用中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 监听post请求
app.use('/writeHdl', (req, res) => {
    // req 包括图片的url及名称
    if (isExist_) {
        isExist(req.body, function () {
            res.send({ a: '1' });
        });
    } else {
        weiteHdl(req.body, function () {
            res.send({ a: '1' });
        });
    }
})
// 判断文件夹是否存在
function isExist(data, callbak) {
    fs.exists(pathDist, function (exist) {
        if (exist && isExist_) {
            unlinkHdl(data, callbak);
        } else {
            fs.mkdir(`${pathDist}`, function (err) {
                if (err) {
                    console.log("文件夹创建失败", err);
                } else {
                    console.log("文件夹创建成功");
                    weiteHdl(data, callbak);
                }
            })
        }
        isExist_ = false;
    });
}
// 删除文件：程序首次运行一次检查一次
function unlinkHdl(data, callbak) {
    var files = fs.readdirSync(pathDist);//读取该文件夹
    if (files.length > 0) {
        files.forEach(function (file) {
            var stats = fs.statSync(pathDist + '/' + file);
            if (stats.isDirectory()) {
                unlinkHdl(pathDist + '/' + file);
            } else {
                fs.unlinkSync(pathDist + '/' + file);
                console.log(`删除文件${pathDist}/${file}成功`);
            }
        });
        fs.rmdirSync(pathDist);
        console.log(`删除文件夹${pathDist}成功`);
        fs.mkdir(`${pathDist}`, function (err) {
            if (err) {
                console.log("文件夹创建失败", err);
            } else {
                console.log("文件夹创建成功");
                weiteHdl(data, callbak);
            }
        })
    } else {
        fs.rmdirSync(pathDist);
        console.log(`删除文件夹${pathDist}/${file}成功`);
        fs.mkdir(`${pathDist}`, function (err) {
            if (err) {
                console.log(`文件夹${pathDist}创建失败`, err);
            } else {
                console.log(`文件夹${pathDist}创建成功`);
                weiteHdl(data, callbak);
            }
        })
    }
}
// 写入文件
function weiteHdl(data, callbak) {
    //接收前台POST过来的base64
    var imgData = data.url;
    var name = data.name;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(`${pathDist}/${name}.png`, dataBuffer, function (err) {
        if (err) {
            console.log(`图片${name}写入失败`, err);
        } else {
            console.log(`图片${name}写入成功`);
            callbak();
        }
    })
}

app.listen(8888, () => {
    console.log("服务开启在8888端口");
})