const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');

const {p, v, domain, openRoute, phoneSpuPath, phoneSpuDataPath} = config.zlj;


const getSpu = async () => {
    try {
        const path = `${domain}${openRoute}${phoneSpuPath}?p=${p}&v=${v}`;
        let result = await request.get(path);
        result = JSON.parse(result.text);
        const {msg, data} = result;
        const spu = [];
        for(let item of data){
            const {type_id, info} = item;
            if(type_id === 9) {
                for (let spuItem of info) {
                    spu.push({
                        typeId      : type_id,
                        brandId     : spuItem.brand_id,
                        brandName   : spuItem.brand_name,
                        modelId     : spuItem.model_id,
                        modelName   : spuItem.model_name
                    });
                }
            }
        }
        return spu;
    } catch (e) {
        console.error(e);
        return [];
    }
};


const saveSpu = async() => {
    try {
        const spus = await getSpu();
        console.info(`size: ${spus.length}, spus: `, spus);
        await fs.ensureDir(_path.join(phoneSpuDataPath, '..'));
        fs.writeFileSync(phoneSpuDataPath, JSON.stringify(spus, null, 4));
        return spus;
    } catch (e) {
        console.error(e);
        return [];
    }
};


exports.saveSpu = saveSpu;