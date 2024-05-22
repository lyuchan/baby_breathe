# 嬰兒呼吸偵測
## 軟體api規則
### 上傳圖片
post https://baby.lyuchan.com/uploadimg

use x-www-form-urlencoded

|key|value|
|-|-|
|img|img.base64|
|token|img.name|

js example
```js
var fs = require('fs');
var data = fs.readFileSync('./img/hi.png');
let base64 = data.toString('base64');
var request = require('request');
request.post({
    url: 'https://baby.lyuchan.com/uploadimg',
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
url = 'https://baby.lyuchan.com/uploadimg'
data = {'img': base64_data,'token':'hi'}
response = requests.post(url, data=data)
```
###