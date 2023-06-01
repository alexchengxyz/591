import fs from 'fs';
import path from 'path';
import { Builder, By, until } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';

const url = 'https://rent.591.com.tw/';
const filterUrl = 'https://rent.591.com.tw/rent-detail-';
const dataPath = './public/data';
// 取得當前時間
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');
const seconds = String(currentDate.getSeconds()).padStart(2, '0');
const formatDate = year + month + day + hours + minutes + seconds;

const getData = async (url, firstRow, driver) => {
  await driver.get(`${url}?region=8&section=109&searchtype=1&multiPrice=10000_20000&multiRoom=2&order=posttime&orderType=desc&kind=1&firstRow=${firstRow}`);
  await driver.wait(until.elementLocated(By.css('.list-container-content')), 10000);   // 等待頁面載入完成
  await driver.sleep(2000); // 等待一段時間以確保資料加載完成

  // 抓取物件列表資料
  const objects = await driver.findElements(By.css('.vue-list-rent-item'));
  const data = [];

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const title = await object.findElement(By.css('.item-title'))?.getText(); // 標題
    const norm = await object.findElement(By.css('.item-style'))?.getText(); // 規格
    const area = await object.findElement(By.css('.item-area'))?.getText(); // 社區
    const oldMsg = await object.findElement(By.css('.item-msg'))?.getText(); // 更新時間和聯絡人
    const price = await object.findElement(By.css('.item-price-text'))?.getText(); // 價格
    const linkElement = await object.findElement(By.css('.vue-list-rent-item a'));
    const href = await linkElement?.getAttribute('href');
    const id = href.replace(filterUrl, '')?.replace('.html', '');

    const msgArr = oldMsg.split('/');
    const msg = msgArr[0] + msgArr[1];

    // 印出html await object.getAttribute('outerHTML');

    data.push({
      id,
      title,
      norm,
      area,
      msg,
      price,
      href
    });
  }

  return data;
};

// 爬取資料並關閉瀏覽器
const createData = async () => {
  const options = new firefox.Options()
    .addArguments('--headless'); // 啟用 headless 模式

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();

  try {
    let out = [];
    let pageTotal = 1;

    // 取得前三頁資料
    for (let page = 0; page < pageTotal; page++) {
      const currentPage = page * 30;

      const data = await getData(url, currentPage, driver);

      out = [...data];

      const firstPageElement = await driver.findElement(By.css('.pageNext'), 1000);

      if (firstPageElement) {
        firstPageElement.click();

        pageTotal++;
      }
    }

    // 存成 json
    fs.writeFileSync(
      `${dataPath}/${formatDate}.json`,
      JSON.stringify({
        createDate: `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`,
        data: out
      }, null, 2),
      'utf8',
    );
  } catch(err) {
    console.log('err=>', err);
  } finally {
    // 關閉瀏覽器
    await driver.quit();
  }
};

// 輸出合併的 json檔
const handleOutputData = async () => {
  const mergedData = [];

  await createData();

  // 合併檔案
  await fs.readdirSync(dataPath).forEach((file) => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dataPath, file);
      const jsonData = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(jsonData);
      const fileName = file.replace('.json', '');

      if (fileName !== 'data') {
        mergedData.push({
          date: fileName,
          data: parsedData.data
        });
      }
    }
  });

  // 產出 data.json
  await fs.writeFileSync(`${dataPath}/data.json`, JSON.stringify(mergedData, null, 2), 'utf8');
};

handleOutputData();
