// Products:
//     css: article.productCard__2nWxIKmi
//     multiple: true
//     type: Text
//     children:
//         Price:
//             css: span.price__1JvDDp_x
//             type: Text
//         Name:
//             css: 'h2.title__2RoYeYuO a'
//             type: Text
//         Size:
//             css: 'h2.title__2RoYeYuO span'
//             type: Text
//         InStock:
//             css: 'p:nth-of-type(1) span.message__IRMIwVd1'
//             type: Text
//         URL:
//             css: 'h2.title__2RoYeYuO a'
//             type: Link
//         DeliveryAvailable:
//             css: 'p:nth-of-type(2) span.message__IRMIwVd1'
//             type: Text

import { load as cheerio } from "cheerio";
import { getUrl } from "../scraper";

import { normalizeBottleName } from "@peated/shared/lib/normalize";

import { submitStorePrices } from "../api";

type Product = {
  name: string;
  price: number;
  priceUnit: "USD";
  url: string;
};

function absoluteUrl(url: string, baseUrl: string) {
  if (url.indexOf("/") !== 0) return url;
  const urlParts = new URL(baseUrl);
  return `${urlParts.origin}${url};`;
}

function removeBottleSize(name: string) {
  return name.replace(/\([^)]+\)$/, "");
}

function parsePrice(value: string) {
  // $XX.YY
  if (value.indexOf("$") !== 0)
    throw new Error(`Invalid price value: ${value}`);

  return parseInt(value.substring(1).split(".").join(""), 10);
}

async function scrapeProducts(
  url: string,
  cb: (product: Product) => Promise<void>,
) {
  const data = await getUrl(url);
  const $ = cheerio(data);
  $("li.fp-item").each(async (_, el) => {
    const name = $("div.fp-item-name > a", el).first().text();
    if (!name) throw new Error("Unable to identify Product Name");
    const productUrl = $("div.fp-item-name > a", el).first().attr("href");
    if (!productUrl) throw new Error("Unable to identify Product URL");
    const price = parsePrice($("div.fp-item-base-price", el).first().text());
    cb({
      name: normalizeBottleName(removeBottleSize(name)),
      price,
      priceUnit: "USD",
      url: absoluteUrl(productUrl, url),
    });
  });
}

export async function main() {
  // TODO: support pagination
  const products: Product[] = [];
  await scrapeProducts(
    "https://www.bevmo.com/shop/spirits/whiskey/d/897480#!/?limit=96",
    async (product: Product) => {
      products.push(product);
    },
  );

  if (process.env.ACCESS_TOKEN) {
    await submitStorePrices(2, products);
  } else {
    console.log("DRY RUN");
    console.log(`- ${products.length} products found`);
  }
}

if (typeof require !== "undefined" && require.main === module) {
  main();
}
