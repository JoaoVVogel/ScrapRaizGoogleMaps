import * as cheerio from "cheerio";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

export async function searchGoogleMapsPage(URL, executablePath) {
    try {
        puppeteerExtra.use(stealthPlugin());
        const browser = await puppeteerExtra.launch({
            defaultViewport: { width: 1200, height: 800 },
            headless: false,
            devtools: true,
            executablePath: executablePath,
            timeout: 30000,
            ignoreHTTPSErrors: true,
            args: ['--disabled-setuid-sandbox', '--no-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process', '--disable-features=NetworkQualityEstimator'],
        });

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'image') {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(URL, {
            waitUntil: ['domcontentloaded', 'networkidle2'],
            timeout: 60000
        });
        await page.waitForSelector('.rogA2c .Io6YTe', { timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const html = await page.content();
        const $ = cheerio.load(html);
        const fullAddress = $('.rogA2c .Io6YTe').first().text() || "N/A";
        const photos = $('button.Dx2nRe div.YkuOqf').first().text() || "N/A";
        const numberPhotos = photos.replace(/\D/g, '') || "N/A";
        const redesSociais = $('.CIdPsb').first().text() || "N/A";

        console.log("redesSociais: " + redesSociais);
        console.log("photos: " + numberPhotos);
        console.log("fullAddress: " + fullAddress);
        await browser.close();
        return {
            address: fullAddress,
            photos: numberPhotos,
            redesSociais: redesSociais
        };

    } catch (error) {
        console.log("error at googleMaps", error.message);
        return {
            error: error.message
        };
    }
}

//URL = `https://www.google.com/maps/place/C%C3%A2mara+Municipal+de+Vereadores+de+Mariana+Pimentel/@-30.3543189,-51.5841828,17z/data=!3m1!4b1!4m6!3m5!1s0x951a30a413081c01:0xf9651bd63f6a730a!8m2!3d-30.3543189!4d-51.5841828!16s%2Fg%2F11fzf4dvmm?authuser=0&hl=pt-BR&entry=ttu`;
//searchGoogleMapsPage(URL);


// async function autoScroll(page) {
//     await page.evaluate(async () => {
//         const wrapper = document.querySelector('div[role="feed"]');

//         await new Promise((resolve, reject) => {
//             var totalHeight = 0;
//             var distance = 1000;
//             var scrollDelay = 3000;

//             var timer = setInterval(async () => {
//                 var scrollHeightBefore = wrapper.scrollHeight;
//                 wrapper.scrollBy(0, distance);
//                 totalHeight += distance;

//                 if (totalHeight >= scrollHeightBefore) {
//                     totalHeight = 0;

//                     // Adicione um tempo de espera entre as iterações
//                     await new Promise((resolve) => setTimeout(resolve, scrollDelay));

//                     // Calculate scrollHeight after waiting
//                     var scrollHeightAfter = wrapper.scrollHeight;

//                     if (scrollHeightAfter > scrollHeightBefore) {
//                         // More content loaded, keep scrolling
//                         return;
//                     } else {
//                         // No more content loaded, stop scrolling
//                         clearInterval(timer);
//                         resolve();
//                     }
//                 }
//             }, 500);
//         });
//     });
// }

