const _ = require('lodash');
const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');

const {p, v, domain, openRoute, phoneDetailPath, phoneQualityDataPath, phoneKeypropDetail, productCheckPath, phoneServerInfoPath, phoneSkuDataPath, phoneServerDataPath, phoneDetailDataPath} = config.zlj;

const getSku = async(phoneQuality) => {
    try {
        const list = [];
        const keyprop_detail_path = `${domain}${openRoute}${phoneKeypropDetail}?p=${p}&product_id=${phoneQuality.productId}`;
        let result_keyprop_detail = await request.get(keyprop_detail_path);
        result_keyprop_detail = JSON.parse(result_keyprop_detail.text);
        const {key_prop_rs} = result_keyprop_detail.data;
        for(let propRs of key_prop_rs){
            for(let propRsItem of propRs){
                console.info(phoneQuality.productId, phoneQuality.productName, propRsItem.pn_name, propRsItem.pv_name, propRsItem.pn_id, propRsItem.pv_id);
                list.push({
                    productId   : phoneQuality.productId,
                    productName : phoneQuality.productName,
                    pnId        : propRsItem.pn_id,
                    pvId        : propRsItem.pv_id,
                    key         : propRsItem.pn_name,
                    value       : propRsItem.pv_name
                });
            }
        }
        return list;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getSpuUseInfo = async(data) => {
    try {
        const list = [];
        const {param_value} = data;
        for(let value of param_value){
            list.push(`${value.p_name}: ${value.p_value}`);
        }
        return list;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getQualityTestingReport = async(data, phoneQuality) =>{
    try {
        const path = `${domain}${openRoute}${productCheckPath}?p=${p}&v=${v}&product_id=${phoneQuality.productId}`;
        let result = await request.get(path);
        result = JSON.parse(result.text);
        const {check_function_rs} = result.data;
        const final = [];
        for(let functionRs of check_function_rs){
            const optionName = functionRs.option_name;
            const status = functionRs.check_rs == 1 ? "正常" : "异常";
            final.push(`${optionName}: ${status}`);
        }
        return final;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getServerInfo = async(phoneQuality) => {
    try {
        const path = `${domain}${openRoute}${phoneServerInfoPath}?p=${p}&v=${v}&product_id=${phoneQuality.productId}`;
        let result = await request.get(path);
        result = JSON.parse(result.text);
        const final = [];
        const {data} = result;
        for(let item of data) {
            final.push({
                productId: phoneQuality.productId,
                serverId: item.server_id,
                serverName: item.server_name,
                serverName2: item.server_name2,
                serverPrice: item.server_price
            });
        }
        return final;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const getSpuDetail = async(phoneQuality) => {
    try {
        // 获取基本信息
        const detail_path = `${domain}${openRoute}${phoneDetailPath}?p=${p}&product_id=${phoneQuality.productId}`;
        let result_detail = await request.get(detail_path);
        result_detail = JSON.parse(result_detail.text);
        const {code, msg, data} = result_detail;

        // 商品使用情况
        const spuUseInfo = await getSpuUseInfo(data);

        // 质检报告
        const qualityTestReport = await getQualityTestingReport(data, phoneQuality);

        // 获取图片
        const imgList = []; const spusDetailList = [];
        data.imgs.map((item) => {imgList.push(item.url)});
        spusDetailList.push({
            productId: data.product_id,
            spuName: phoneQuality.brandName,
            productName: data.product_name,
            img: imgList.join("、"),
            tag: data.tag,
            price: data.price,
            oriPrice: data.ori_price,
            banben: data.banben_string,
            netword: data.netword_string,
            imei: data.imei,
            useInfo : spuUseInfo.join('、'),
            engineerName: data.engineer_name,
            professional: data.professional,
            activationTime: data.activation_time,
            guaranteeTime: data.guarantee_time,
            checkRes: data.check_res,
            qualityTestReport: qualityTestReport.join('、'),
        });
        return spusDetailList;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getAllSpuDetail = async() => {
    try {
        const phoneQuality = JSON.parse(fs.readFileSync(phoneQualityDataPath));
        console.info(`phoneQuality.size: ${phoneQuality.length}`);
        let number = 0, skuList = [], baseInfoList = [], serverInfoList = [];
        for(let item of phoneQuality){
            ++number;
            console.info('number : %d', number);
            // SKU和机况
            const sku = await getSku(item);
            skuList = skuList.concat(sku);
            // 基本信息
            const baseInfo = await getSpuDetail(item);
            baseInfoList = baseInfoList.concat(baseInfo);
            // 服务
            const serverInfo = await getServerInfo(item);
            serverInfoList = serverInfoList.concat(serverInfo);
            // 测试使用
            // if(number === 3){
            //     break;
            // }
        }
        return {skuList, serverInfoList, baseInfoList}
    } catch (e) {
        console.error(e);
        return [];
    }
};


const saveSpuDetailData = async() => {
    try {
        const {skuList, serverInfoList, baseInfoList} = await getAllSpuDetail();

        await fs.ensureDir(_path.join(phoneSkuDataPath, '..'));
        fs.writeFileSync(phoneSkuDataPath, JSON.stringify(skuList, null, 4));

        await fs.ensureDir(_path.join(phoneServerDataPath, '..'));
        fs.writeFileSync(phoneServerDataPath, JSON.stringify(serverInfoList, null, 4));

        await fs.ensureDir(_path.join(phoneDetailDataPath, '..'));
        fs.writeFileSync(phoneDetailDataPath, JSON.stringify(baseInfoList, null, 4));

        return null;
    } catch (e) {
        console.error(e);
        return e;
    }
};


exports.saveSpuDetailData = saveSpuDetailData;