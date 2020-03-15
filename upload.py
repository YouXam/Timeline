#!/data/data/com.termux/files/usr/bin/python
import requests
import json
import os
import argparse
import sys
import re
import time


def tinput(p):
    p = os.popen(f'termux-dialog text -t "{p}"')
    result = json.loads(p.read())
    if result['code'] != -1:
        sys.exit(1)
    return result['text']


def tdialog(p):
    os.system(                                                           f'termux-notification -t "注意" -c "{p}" --priority min')


def tnotification(img_path, title, text, action, priority=None, button1=None, button1_action=None):
    if priority:
        p=f'--priority {priority}'
    else:
        p=''
    if button1 and button1_action:
        b=f"--button1 '{button1}' --button1-action '{button1_action}'"
    else:
        b=''
    os.system(
        f'termux-notification -t "{title}" -c "{text}" --image-path "{img_path}" --action "{action}" {p} {b}')


def set_bag_title(url, bag):
    title = tinput("设置应用标题")
    r = requests.post(f"{url}/set_bag_title",
                      data={"bag": bag, "title": title})
    if r.status_code != 200:
        tdialog(f"设置应用名称时出现错误:{r.text}")

def del_img(url, bag, filename):
    r = requests.post(f"{url}/delete", data={"bag": bag,"filename": filename})
    if r.status_code != 200:
        tdialog(f"删除图片时出现错误:{r.text}")
    else:
        os.system(                                                           f'termux-notification -t "删除成功" -c "已删除图片"')


def set_info(url, bag, filename):
    title = tinput("设置图片标题")
    text = tinput("设置图片备注")
    r = requests.post(f"{url}/set_info", data={"bag": bag,
                                               "title": title, "filename": filename, "text": text})
    if r.status_code != 200:
        tdialog(f"设置图片信息时出现错误:{r.text}")


def upload(path, url):
    f = open(path, "rb")
    file = {'image': (path.split("/")[-1], f, "image/jpeg")}
    r = requests.post(f"{url}/upload_img", files=file)
    if r.status_code != 200:
        tdialog(f"上传图片时出现错误:{r.text}")
        return
    result = json.loads(r.text)
    if result['ifnew'] == '-1':
        return
    if result['ifnew']:
        tnotification(path, "设置应用标题", "您添加了一个新应用到时间线中,单击此处来设置该应用在时间线中的标题",
                      'python3 {} -p "{}" '.format('/data/data/com.termux/files/home/.shortcuts/upload.py', result['bag']),priority='max')
    tnotification(path, "设置图片信息", "您有一张新截图,图片已上传,单击此处来设置该图片在时间线中的信息",
                  'python3 {} -i "{}" -p "{}" '.format('/data/data/com.termux/files/home/.shortcuts/upload.py', result['filename'], result['bag']),button1='删除',button1_action='python3 {} -d "{}" -p "{}" '.format('/data/data/com.termux/files/home/.shortcuts/upload.py', result['filename'], result['bag']))


def get_screenshot_list(path):
    for filename in os.listdir(path):
        if re.fullmatch("Screenshot_\d{8}_\d{6}_.*?\.jpg", filename):
            for i in package:
                if filename.endswith(i+'.jpg'):
                    yield os.path.join(path, filename)
                    break

os.system('termux-wake-lock')

url = "http://192.168.31.211:3000"
path = "/storage/emulated/0/Pictures/Screenshots"
package=['com.bilibili.azurlane']

parser = argparse.ArgumentParser(description="上传截图并以时间轴的方式显示")
parser.add_argument('-i', '--id', help='设置特定id的图片的信息,此项需和-p搭配')
parser.add_argument('-p', '--package', help='包名,当有此项无-i项时进入设置包名标题模式')
parser.add_argument('-u', '--url', help='临时指定url,无此项时使用硬编码的url')
parser.add_argument('-a', '--path', help='临时指定path,无此项时使用硬编码的path')
parser.add_argument('-d', '--delete', help='删除图片的id，有此项时，覆盖id项')
parser.add_argument('-s', '--scan', action='store_true',help='先扫描路径下已有文件，可与watch选项配合使用')
parser.add_argument('-w', '--watch', action='store_true',help='忽略已有文件，持续扫描，可和scan选项配合使用')
args = parser.parse_args()
if args.url:
    url = args.url
if args.path:
    path = args.path
if args.delete and args.package:
    del_img(url, args.package, args.delete)
    exit(0)
elif args.id and args.package:
    set_info(url, args.package, args.id)
    sys.exit(0)
elif args.package:
    set_bag_title(url, args.package)
    sys.exit(0)
if args.scan:
    for img in get_screenshot_list(path):
         upload(img, url)
if args.watch:
    print(f"开始在'{path}'下扫描图片...")
    last = set(get_screenshot_list(path))
    while True:
        try:
            now = set(get_screenshot_list(path))
            new_imgs = now - last
            for new_img in new_imgs:
                print(f"扫描到新截图'{new_img}',开始上传...")
                upload(new_img, url)
            last = now
            time.sleep(0.5)
        except KeyboardInterrupt:
            print('停止扫描...')
            break
