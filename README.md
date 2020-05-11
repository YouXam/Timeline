# 使用时间线显示截图

> 作者: [https://space.bilibili.com/368166294](https://space.bilibili.com/368166294)

> [演示视频](https://www.bilibili.com/video/BV12E41147HR)


## 注意
如果上传截图文件名不符合`Screenshot_YYYYmmdd_HHMMSS_应用包名.jpg`的格式,需要更改`index.js`的122,123行和`upload.py`的80行

## 服务器端

配置好node.js环境后,输入
```sh
npm install
npm start
```
即可启动服务

## 客户端

只支持安卓,下载[Termux](https://f-droid.org/repository/browse/?fdid=com.termux)和[Termux:API](https://f-droid.org/packages/com.termux.api/),并赋予Termux:API通知权限

在Termux中,输入:
```sh
pkg install python
pip install requests
```
安装环境

如果网络不佳,阅读[Termux 镜像使用帮助](https://mirror.tuna.tsinghua.edu.cn/help/termux/)和[pypi 镜像使用帮助](https://mirrors.tuna.tsinghua.edu.cn/help/pypi/)更换软件源和pypi源

`upload.py`文件的使用帮助:
```
usage: upload.py [-h] [-i ID] [-p PACKAGE] [-u URL] [-a PATH] [-d DELETE]
                 [-s] [-w]

上传截图并以时间轴的方式显示

optional arguments:
  -h, --help            show this help message and exit
  -i ID, --id ID        设置特定id的图片的信息,此项需和-p搭配
  -p PACKAGE, --package PACKAGE
                        包名,当有此项无-i项时进入设置包名标题模式
  -u URL, --url URL     临时指定url,无此项时使用硬编码的url
  -a PATH, --path PATH  临时指定path,无此项时使用硬编码的path
  -d DELETE, --delete DELETE
                        删除图片的id，有此项时，覆盖id项
  -s, --scan            先扫描路径下已有文件，可与watch选项配合使用
  -w, --watch           忽略已有文件，持续扫描，可和scan选项配合使用
```

配置`upload.py`文件的87,89行

在`upload.py`文件目录下,输入
```sh
python upload.py -w
```
启动程序
