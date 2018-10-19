const {saveSpu} = require('./service/spu');
const {saveSpuQuality} = require('./service/spuQuality');
const {saveSpuDetailData} = require('./service/spuDetail');
const {saveAllImages} = require('./service/downloadImg');
const {savePrice} = require('./service/price');
const {exportExcel} = require('./service/export');

const start = async() => {
    try {
        console.info('开始......');
        console.info('开始采集SPU数据......');
        await saveSpu();
        console.info('SPU数据采集完毕。');

        console.info('开始采集SPU成色机型......');
        await saveSpuQuality();
        console.info('SPU成色机型采集完成。');

        console.info('开始采集SPU成色机型详情数据......');
        await saveSpuDetailData();
        console.info('SPU成色机型详情数据采集完成。');

        console.info('开始下载成色机型的预览图片......');
        await saveAllImages();
        console.info('成色机型预览图片采集完成。');

        console.info('开始采集各成色机型的价格......');
        await savePrice();
        console.info('各成色机型的价格采集完成。');

        console.info('开始导出文件......');
        await exportExcel();
        console.info('文件导出完成。');

        console.info('结束。')

    } catch (e) {
        console.error(e);
        return e;
    }
};


start();