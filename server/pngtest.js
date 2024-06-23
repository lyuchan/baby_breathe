const puppeteer = require('puppeteer');
test()
async function test() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        defaultViewport: null,
        executablePath: '/usr/bin/chromium-browser'
    });

    const page = await browser.newPage()
    // 设置浏览器视窗
    page.setViewport({
        width: 1920,
        height: 1080,
    })

    await page.goto('https://medium.com/appxtech/puppeteer-%E9%81%8B%E7%94%A8-%E4%B8%80-%E7%B6%B2%E9%A0%81%E6%88%AA%E5%9C%96%E8%88%87pdf%E8%BC%B8%E5%87%BA-d9589588a3a8');
    
    await page.screenshot({ path: './web/img/baidu.png', fullPage: false });
    await browser.close();

}