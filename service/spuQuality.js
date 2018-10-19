const _ = require('lodash');
const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');

const {p, domain, openRoute, phoneSpuDataPath, phoneQualityPath, phoneQualityDataPath} = config.zlj;


const getSpuQuality = async(spu, pageIndex, pqlist) => {
    try {
        const pageSize = 10;
        if(_.isEmpty(pqlist)){
            pqlist = [];
            pageIndex = 1;
        }
        const path = `${domain}${openRoute}${phoneQualityPath}?p=${p}&page=${pageIndex}&type_id=${spu.typeId}&brand_id=${spu.brandId}&model_id=${spu.modelId}`;
        let result = await request.get(path);
        result = JSON.parse(result.text);
        const {data} = result;
        const spuQualityList = [];
        for(let item of data){
            spuQualityList.push({
                brandId     : spu.brandId,
                brandName   : spu.brandName,
                productId   : item.product_id,
                productName : item.product_name
            });
            console.info(`pageIndex: ${pageIndex}, modelName: ${spu.brandName}, productId: ${item.product_id}, productName: ${item.product_name}`);
        }
        pqlist = pqlist.concat(spuQualityList);
        if(data.length === pageSize){
            pageIndex++;
            return await getSpuQuality(spu, pageIndex, pqlist);
        } else {
            return pqlist;
        }
    } catch (e) {
        console.error(e);
        return [];
    }
};


const getAllSpuQuality = async() => {
    try {
        const spus = JSON.parse(fs.readFileSync(phoneSpuDataPath));
        console.info(`spus.size: ${spus.length}`);
        let result = [];
        for(let spu of spus){
            const pqs = await getSpuQuality(spu);
            result = result.concat(pqs);
            console.info('=========================================');
            // break;
        }
        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
};


const saveSpuQuality = async() => {
    try {
        const allSpuQuality = await getAllSpuQuality();
        console.info(`allSpuQuality.size: ${allSpuQuality.length}`);
        await fs.ensureDir(_path.join(phoneQualityDataPath, '..'));
        fs.writeFileSync(phoneQualityDataPath, JSON.stringify(allSpuQuality, null, 4));
        return allSpuQuality;
    } catch (e) {
        console.error(e);
        return [];
    }
};


exports.saveSpuQuality = saveSpuQuality;