const uuid = require('uuid');
const fs = require('fs-extra');
const request = require('superagent');
const sleep = require('js-sleep/js-sleep');
const config = require('../config/index');

const {imagesPath, phoneDetailDataPath} = config.zlj;

let count = 0;
const downloadImages = async(productId, spuName, img) => {
    try {
        ++count;
        const imgs = img.split("、");
        console.info(`${productId} - ${spuName} 共 ${imgs.length} 张图片`);
        for(let url of imgs){
            await sleep(1000 * 3);
            const uuidStr = uuid();
            const fileName = `${productId} ${spuName}-${uuidStr}`;
            const path = `${imagesPath}/${fileName}.jpeg`;
            await request(url).pipe(fs.createWriteStream(path)).on('close', () =>{
                console.info(`[${count}]:[${productId} ${spuName}]: -> ${fileName}.jpeg Download Success!`);
            });
        }
    } catch (e) {
        console.error(e);
        return e;
    }
};

const saveAllImages = async() => {
    try {
        const phoneDetailData = JSON.parse(fs.readFileSync(phoneDetailDataPath));
        console.info(`共 ${phoneDetailData.length} 款成色机型、准备下载图片......`);
        for(let item of phoneDetailData){
            const {productId, spuName, img} = item;
            await downloadImages(productId, spuName, img);
        }
    } catch (e) {
        console.error(e);
        return e;
    }
};


exports.saveAllImages = saveAllImages;