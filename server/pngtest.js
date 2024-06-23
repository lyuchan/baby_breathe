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
        width: 850,
        height: 212,
    })

    await page.goto('https://db.lyuchan.com/pic');

    await page.screenshot({ path: './web/img/baidu.png', fullPage: false });
    await browser.close();

}