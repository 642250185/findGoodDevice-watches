const path = require('path');

const config = {
    zlj: {
        p: 'xcx',
        v: '1.0.0',
        username:'18721370816',
        password: 'admin123',
        domain: 'https://panda.huodao.hk',
        openRoute: '/api/product',
        phoneSpuPath: '/new_get_product_cate_v1',
        phoneQualityPath: '/new_search_list',
        phoneDetailPath: '/detail',
        phoneKeypropDetail: '/keyprop_detail',
        productCheckPath: '/product_check',
        phoneServerInfoPath: '/server_info',

        phoneSpuDataPath: path.join(__dirname, '..', 'data/phoneSpu.json'),
        phoneQualityDataPath: path.join(__dirname, '..', 'data/phoneQuality.json'),
        phoneSkuDataPath: path.join(__dirname, '..', 'data/phoneSku.json'),
        phoneServerDataPath: path.join(__dirname, '..', 'data/phoneServer.json'),
        phoneDetailDataPath: path.join(__dirname, '..', 'data/phoneDetail.json'),
        pricePath: path.join(__dirname, '..', 'data/price.json'),

        imagesPath: path.join(__dirname, '..', 'download/images'),
        downloadPath: path.join(__dirname, '..', 'download'),
    },
    /**
     * 返回或设置当前环镜
     */
    env: function () {
        global.$config = this;
        return global.$config;
    }
};

module.exports = config.env();






