import * as cheerio from "cheerio";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import sendCampaignData  from "../generateCampaign/generateCampaign.js";


// import { searchGoogleMapsPage } from "../scrap/searchGoogleMapsPage.mjs";
import { searchGoogleMapsPage } from "../../../ScrapRaizGoogleMaps/src/scrap/searchGoogleMapsPage.mjs";

//passar para o parametro da função como primeira chamada.

// function formatTime
function formatTime(timestamp) {
    let date = new Date();
    let options = { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    let dateTimeFormat = new Intl.DateTimeFormat('pt-br', options);
    let [{ value: dia }, , { value: mes }, , { value: ano }, , { value: hora }, , { value: minuto }, , { value: segundo }] = dateTimeFormat.formatToParts(date);
    return `${dia}-${mes}-${ano} ${hora}:${minuto}:${segundo}`;
}

async function searchGoogleMapsLinks(query) {
    try {
        puppeteerExtra.use(stealthPlugin());
        const start = Date.now();
        // console.log(`Code Google MapsLinks Start at ${formatTime(start)}`);

        const browser = await puppeteerExtra.launch({
            defaultViewport: { width: 1200, height: 800 }, // Defina as dimensões desejadas da janela do navegador
            headless: false,
            //headless: 'new',
            //slowMo: 350,
            //devtools: true,
            executablePath: "", // your path here em caso de usar chromium
            timeout: 30000,
            ignoreHTTPSErrors: true,
            args: ['--disabled-setuid-sandbox', '--no-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process', '--disable-features=NetworkQualityEstimator'],
        });

        // const browser = await puppeteerExtra.launch({
        //   args: chromium.args,
        //   defaultViewport: chromium.defaultViewport,
        //   executablePath: await chromium.executablePath(),
        //   headless: "new",
        //   ignoreHTTPSErrors: true,
        // });

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'image') {
                request.abort();
            } else {
                request.continue();
            }
        });

        try {
            //page.on('console', message => console.log(`Console: ${message.text()}`)); // Se houver erro ao abrir a página, descomentar essa linha para ver o erro no console
            await new Promise(resolve => setTimeout(resolve, 1500));
            await page.goto(`https://www.google.com/maps/search/${query.split(" ").join("+")}`, {
                waitUntil: ['domcontentloaded', 'networkidle2']
            });
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Força o recarregamento da página
            await page.reload({ waitUntil: ['domcontentloaded', 'networkidle2'] });
            await page.waitForSelector('div[role="feed"]', { timeout: 12000 });
        } catch (error) {

            // console.log("error going to  Google MapsLinks", error.message);
            page.setDefaultTimeout(10000);
        }
        async function autoScroll(page) {
            await page.evaluate(async () => {
                const wrapper = document.querySelector('div[role="feed"]');

                await new Promise((resolve, reject) => {
                    var totalHeight = 0;
                    var distance = 1000;
                    var maxScrollAttempts = 10; // Defina o número máximo de tentativas de rolar

                    var timer = setInterval(async () => {
                        var scrollHeightBefore = wrapper.scrollHeight;
                        wrapper.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= scrollHeightBefore) {
                            totalHeight = 0;
                            maxScrollAttempts--;

                            if (maxScrollAttempts <= 0) {
                                clearInterval(timer);
                                resolve();
                            }

                            await new Promise((resolve) => setTimeout(resolve, 3000));

                            // Calculate scrollHeight after waiting
                            var scrollHeightAfter = wrapper.scrollHeight;

                            if (scrollHeightAfter > scrollHeightBefore) {
                                // More content loaded, keep scrolling
                                return;
                            } else {
                                // No more content loaded, stop scrolling
                                clearInterval(timer);
                                resolve();
                            }
                        }
                    }, 500);
                });
            });
        }

        await autoScroll(page);

        const html = await page.content();
        const pages = await browser.pages();
        await Promise.all(pages.map(async (page) => {
            if (!page.isClosed()) {
                await page.close();
            }
        }));

        await page.setRequestInterception(false);
        await browser.close();
        // console.log("browser closed");

        // get all a tag parent where a tag href includes /maps/place/
        const $ = cheerio.load(html);
        const aTags = $("a");
        const parents = [];
        aTags.each((i, el) => {
            const href = $(el).attr("href");
            if (!href) {
                return;
            }
            if (href.includes("/maps/place/")) {
                parents.push($(el).parent());
            }
        });

        const businesses = [];

        if (Array.isArray(parents)) {
            const promises = parents.map(async (parent) => {
                const url = parent.find("a").attr("href");
                const website = parent.find('a[data-value="Website"]').attr("href");
                const storeName = parent.find("div.fontHeadlineSmall").text();
                const ratingText = parent
                    .find("span.fontBodyMedium > span")
                    .attr("aria-label");

                // get the first div that includes the class fontBodyMedium
                const bodyDiv = parent.find("div.fontBodyMedium").first();
                const children = bodyDiv.children();
                const lastChild = children.last();
                const lastOfLast = lastChild.children().last();
                const starsAndReviews = ratingText?.split(" estrelas ");
                const starsMatch = starsAndReviews?.[0]?.match(/(\d+),(\d+)/);
                const numberOfReviewsString = starsAndReviews?.[1]?.replace("comentários", "")?.trim();
                const starsValue = starsMatch ? Number(`${starsMatch[1]}.${starsMatch[2]}`) : null;
                const numberOfReviewsValue = numberOfReviewsString ? Number(numberOfReviewsString) : null;
                const statusElement = parent.find('.eXlrNe');
                const statusValue = statusElement.length > 0 ? statusElement.text().trim() : "Aberto";
                const firstOfLast = lastChild.children().first();
                const category = firstOfLast?.text()?.split("·")?.[0]?.trim() || null;
                const fullText = lastChild.children().first().text().trim();

// -----------
                // async function urlPages(googleUrl) {
                //     let result = null;
                //     while (googleUrl > 0) {
                //         try {
                //             result = await searchGoogleMapsPage(url);
                //             return result;
                //         } catch (error) {
                //             console.log("error at urlPages", error.message);
                //         }
                //     }
                //     return result;
                // }

                // let result = await urlPages(googleUrl);
                // let address, photos, redesSociais;

                // if (result) {
                //     address = result.address;
                //     photos = result.photos;
                //     redesSociais = result.redesSociais;
                // } else {
                //     console.log('urlPages(url) returned null');
                // }
// ------------
                businesses.push({
                    placeId: `ChI${url?.split("?")?.[0]?.split("ChI")?.[1]}`,
                    status: statusValue,
                    category: category,
                    address: firstOfLast?.text()?.split("·")?.[1]?.trim(),
                    //address: address || null,
                    storeName: storeName ? storeName.toUpperCase() : null,
                    phone: lastOfLast?.text()?.split("·")?.[1]?.trim() || null,
                    bizWebsite: website || null,
                    ratingText: ratingText || null,
                    stars: starsValue || null,
                   // photos: photos || null,
                    numberOfReviews: numberOfReviewsValue || null,
                    googleUrl: url || null,
                });
            });
        }
        const end = Date.now();
        // console.log("Results businesses:", businesses.length);
        // console.log(`time in seconds ${Math.floor((end - start) / 1000)}`);
        // console.log(`Code links finished at ${formatTime(end)}\n\n`);

        return businesses;

    } catch (error) {
        // console.log("error at Google MapsLinks", error.message);
        return null;
    }
}

//searchGoogleMapsLinks(query);
export async function runSearch(query) {
    try {
        const results = await searchGoogleMapsLinks(query);

        if (results) {
            // excel(results, query);
            sendCampaignData(results, query)


            // Limpar o cache somente se a busca for bem-sucedida
            //limparCacheNpm();
        } else {
            console.error('Ocorreu um erro ao buscar no Google MapsLinks.');
        }
    } catch (error) {
        console.error('Erro durante a execução da busca Google runSearch:', error);
    }
}
// Chame a função runSearch passando a query desejada para testes descomentar as duas linha abaixo e executar o arquivo
// const query = `'Monitoramento' Cascavel - PR`;
// runSearch(query);

