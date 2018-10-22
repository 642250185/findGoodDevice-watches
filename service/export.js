const _ = require('lodash');
const _path = require('path');
const fs = require('fs-extra');
const xlsx = require('node-xlsx').default;
const config = require('../config/index');
const {phoneSkuDataPath, phoneServerDataPath, phoneDetailDataPath, downloadPath, pricePath} = config.zlj;


const getData = async() =>{
    try {
        const phoneSkuData = JSON.parse(fs.readFileSync(phoneSkuDataPath));
        const phoneServerData = JSON.parse(fs.readFileSync(phoneServerDataPath));
        const phoneDetailData = JSON.parse(fs.readFileSync(phoneDetailDataPath));
        const priceData = JSON.parse(fs.readFileSync(pricePath));
        return {phoneSkuData, phoneServerData, phoneDetailData, priceData}
    } catch (e) {
        console.error(e);
    }
};

const exportExcel = async() => {
    try {
        const {phoneSkuData, phoneServerData, phoneDetailData, priceData} = await getData();
        const skuList = [['成色机型ID', '机型名称', 'pnId', 'pvId', '问题项', '答案项']];
        const serverList = [['成色机型ID', '服务ID', '服务名称', '服务名称2', '服务价格']];
        const baseInfoList = [['成色机型ID', 'SPU名称', '成色机型名称', '图片', '编号', '价格','原价', '版本', '网络', 'IMEI','使用情况','质检工程师', '级别', '激活时间', '保修到期时间', '质检结果', '质检报告详情']];
        const priceList = [['成色机型ID','SPU名称','网络','版本','原价','服务价']];

        for(let sku of phoneSkuData){
            const row = [];
            row.push(sku.productId);
            row.push(sku.productName);
            row.push(sku.pnId);
            row.push(sku.pvId);
            row.push(sku.key);
            row.push(sku.value);
            skuList.push(row);
        }

        for(let server of phoneServerData){
            const row = [];
            row.push(server.productId);
            row.push(server.serverId);
            row.push(server.serverName);
            row.push(server.serverName2);
            row.push(server.serverPrice);
            serverList.push(row);
        }

        for(let baseInfo of phoneDetailData){
            const row = [];
            row.push(baseInfo.productId);
            row.push(baseInfo.spuName);
            row.push(baseInfo.productName);
            row.push(baseInfo.img);
            row.push(baseInfo.tag);
            row.push(baseInfo.price);
            row.push(baseInfo.oriPrice);
            row.push(baseInfo.banben);
            row.push(baseInfo.netword);
            row.push(baseInfo.imei);
            row.push(baseInfo.useInfo);
            row.push(baseInfo.engineerName);
            row.push(baseInfo.professional);
            row.push(baseInfo.activationTime);
            row.push(baseInfo.guaranteeTime);
            row.push(baseInfo.checkRes);
            row.push(baseInfo.qualityTestReport);
            baseInfoList.push(row);
        }

        for(let price of priceData){
            const row = [];
            row.push(price.productId);
            row.push(price.spuName);
            row.push(price.netword);
            row.push(price.banben);
            row.push(price.originPrice);
            // row.push(price.serverPrice); // 暂时没有服务
            priceList.push(row);
        }

        const filename = `${downloadPath}/找靓机手表数据.xlsx`;
        fs.writeFileSync(filename, xlsx.build([
            {name: 'SKU', data: skuList},
            {name: '服务', data: serverList},
            {name: '基础信息', data: baseInfoList},
            {name: '价格信息', data: priceList},
        ]));
        console.log(`爬取结束, 成功导出文件: ${filename}`);
    } catch (e) {
        console.error(e);
        return e;
    }
};


exports.exportExcel = exportExcel;