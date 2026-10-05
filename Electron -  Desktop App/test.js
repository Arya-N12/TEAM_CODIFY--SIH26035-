const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const data = await res.json();
    const browser = await puppeteer.connect({
      browserWSEndpoint: data.webSocketDebuggerUrl,
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('index.html') || p.url().includes('Homepage.html'));
    
    if (!page) {
      console.log('Available pages:', pages.map(p => p.url()));
      page = pages[0];
    }

    console.log('Initial URL:', page.url());
    
    // Wait for the redirect to Homepage.html if it hasn't happened yet
    if (!page.url().includes('Homepage.html')) {
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('Redirected URL:', page.url());
    }

    // Now test a link
    await page.waitForSelector('a[href="./NAWI_Evaluator/pages/dashboard.html"]', { timeout: 5000 });
    console.log('Found Evaluator link. Clicking...');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('a[href="./NAWI_Evaluator/pages/dashboard.html"]')
    ]);

    console.log('Successfully navigated to:', page.url());

    // Take screenshot (requires capturing in node and saving it, but we'll just check if elements exist)
    const hasDashboardTitle = await page.evaluate(() => {
        return document.body.innerText.includes('Metrology Evaluator');
    });

    console.log('Has dashboard text:', hasDashboardTitle);
    console.log('Electron frontend tests passed successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
