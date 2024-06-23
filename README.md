# 嬰兒呼吸偵測
## 軟體api規則
### upload data
GET https://db.lyuchan.com/api/?freq=data1&up=data2&token=data3
|key|valuetype|note|
|-|-|-|
|freq|int|每分鐘呼吸頻率|
|up|boolean|是否翻身|
|token|string|就是token|
---
### upload img.
POST https://db.lyuchan.com/uploadimg

use body x-www-form-urlencoded

|key|valuetype|note|
|-|-|-|
|img|string|圖片base64的文字們|
|token|string|就是token|

js example
```js
var fs = require('fs');
var data = fs.readFileSync('./img/hi.png');
let base64 = data.toString('base64');
var request = require('request');
request.post({
    url: 'https://db.lyuchan.com/uploadimg',
    form: {
    img: encodeURI(base64),
    token:'hi'
    }
}, function (error, response, body) {
    console.log(body);
});
```
python example
```python
import requests
import base64
with open('./img/hi.png', 'rb') as file:
    base64_data = base64.b64encode(file.read()).decode('utf-8')
url = 'https://db.lyuchan.com/uploadimg'
data = {'img': base64_data,'token':'hi'}
response = requests.post(url, data=data)
```
## autopull
自動更新