const express = require('express');
const ejs = require('ejs');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require("fs");
const upload = multer({ dest: 'upload/' });
app.set('view engine', 'ejs');
app.use('/static', express.static('static'));
app.use('/upload', express.static('upload'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", function (req, res) {
    fs.readFile('data.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        const info = JSON.parse(data.toString());
        res.render("index.ejs", { info: info });
    });
});
app.get("/timeline/:bag", function (req, res) {
    fs.readFile('data.json', function (err, data) {
        if (err) {
            return console.error(err);
        }
        const info = JSON.parse(data.toString())[req.params.bag];
        if (info) {
            res.render("timeline.ejs", { data: info.data, title: info.title, bag: info.bag });
        } else {
            res.status(404).send("404 Not Found");
        }
    });
});
app.post("/set_bag_title", function (req, res) {
    if (!req.body.bag || !req.body.title) {
        res.status(400).json({ msg: "缺少参数" });
        return;
    }
    const bag = req.body.bag;
    fs.readFile("data.json", function (err, data) {
        if (err) {
            res.status(500).json({ msg: "error" });
            return;
        }
        let info = JSON.parse(data.toString());
        info[bag].title = req.body.title;
        fs.writeFile("data.json", JSON.stringify(info), () => {
            res.status(200).json({ msg: "ok" });
        });
    });
});
app.post("/delete", function (req, res) {
    if (!req.body.bag || !req.body.filename) {
        res.status(400).json({ msg: "缺少参数" });
        return;
    }
    const bag = req.body.bag;
    fs.readFile("data.json", function (err, data) {
        if (err) {
            res.status(500).json({ msg: "error" });
            return;
        }
        let info = JSON.parse(data.toString());
        for (let i = 0; i < info[bag].data.length; i++) {
            if (req.body.filename == info[bag].data[i].img) {
                info[bag].data.splice(i, 1);
                fs.unlink("upload/" + req.body.filename + ".jpg", () => {
                    res.status(200).json({ msg: "ok" });
                    fs.writeFile("data.json", JSON.stringify(info), () => { });
                });
                return;
            }
        }
        res.status(404).json({ msg: "没有找到文件" });
    });
});
app.post("/set_info", function (req, res) {
    if (!req.body.filename || !req.body.bag) {
        res.status(400).json({ msg: "缺少参数" });
        return;
    }
    const bag = req.body.bag;
    fs.readFile("data.json", function (err, data) {
        if (err) {
            res.status(500).json({ msg: "打开文件错误(" + err + ")" });
            return;
        }
        let info = JSON.parse(data.toString());
        if (!info[bag]) {
            res.status(500).json({ msg: "不存在此应用包名" });
            return;
        }
        let flag = true;
        for (let i = 0; i < info[bag].data.length; i++) {
            if (req.body.filename == info[bag].data[i].img) {
                info[bag].data[i].title = req.body.title;
                info[bag].data[i].text = req.body.text;
                flag = false;
                break;
            }
        }
        fs.writeFile("data.json", JSON.stringify(info), () => {
            if (flag) {
                res.status(404).json({ msg: "找不到此图片,无法设置信息" });
            } else {
                res.status(200).json({ msg: "ok" });
            }
        });
    });
});
app.post("/upload_img", upload.single('image'), function (req, res) {
    fs.readFile("data.json", function (err, data) {
        if (err) {
            res.status(500).json({ msg: "打开文件错误(" + err + ")" });
            return;
        }
        fs.rename(req.file.path, req.file.path + ".jpg", () => {
            let flag = false;
            let fn = req.file.originalname;
            let info = JSON.parse(data.toString());
            let bag = fn.slice(27, fn.length - 4);
            let time = fn.slice(11, 15) + "-" + fn.slice(15, 17) + "-" + fn.slice(17, 19) + " " + fn.slice(20, 22) + ":" + fn.slice(22, 24) + ":" + fn.slice(24, 26);
            if (!info[bag]) {
                info[bag] = { bag: bag, data: [] };
                flag = true;
            }
            for (let i = 0; i < info[bag].data.length; i++) {
                if (fn == info[bag].data[i].originalname) {
                    res.status(200).json({ msg: "文件已上传", ifnew: "-1" });
                    return;
                }
            }
            fs.unlink(req.file.path, () => {
                info[bag].data.push({ originalname: req.file.originalname, img: req.file.filename, time: time });
                info[bag].data.sort((a, b) => (a.time < b.time ? 1 : -1));
                fs.writeFile("data.json", JSON.stringify(info), () => {
                    res.status(200).json({ filename: req.file.filename, bag: bag, ifnew: flag });
                });
            });
        });
    });
});
app.listen(3000, () => {
    console.log("Listening on port 3000.");
});