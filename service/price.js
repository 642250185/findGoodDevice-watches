const _ = require('lodash');
const _path = require('path');
const fs = require('fs-extra');
const request = require('superagent');
const config = require('../config/index');
const {p, v, username, password, domain, pricePath, phoneDetailDataPath} = config.zlj;

const login = async() => {
    try {
        const path = `${domain}/api/login`;
        let result = await request.post(path)
            .set({'Content-Type':'application/json'})
            .send({
                p: p,
                v: v,
                username: username,
                password: password
            });
        result = JSON.parse(result.text);
        const {data} = result;
        const userId = data.user_id;
        const token = data.token;
        return {userId, token};
    } catch (e) {
        console.error(e);
        return {};
    }
};

const sendRequest = async(userId, token, path, shoujiStr, serverStr) => {
    try {
        let result = await request.post(path)
            .set({'Content-Type':'application/json'})
            .send({
                p: p,
                v: v,
                token: token,
                user_id: userId,
                peijian_str: "",
                shouji_str: shoujiStr,
                server_str: serverStr,
                from_where: 1,
                sk: "2"
            });
        result = JSON.parse(result.text);
        const {data} = result;
        const orderList = data.order_list;
        return orderList[0].total_amount;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const getPrice = async(baseInfo) =>{
    try {
        const result = [];
        const {userId, token} = await login();
        // 原价
        const path = `${domain}/api/account/order/shop_cart_confirm_order`;
        const shoujiStr = `${baseInfo.productId}:1`;
        let serverStr = '3';
        const originPrice = await sendRequest(userId, token, path, shoujiStr, serverStr);
        // 服务价
        serverStr = `${serverStr}`;
        const serverPrice = await sendRequest(userId, token, path, shoujiStr, serverStr);
        let netword = baseInfo.netword, banben = baseInfo.banben;
        netword = netword.substring(netword.indexOf(':')+1, netword.length);
        banben = banben.substring(banben.indexOf(':')+1, banben.length);
        console.info(`${baseInfo.productId}、${baseInfo.spuName}、 ${netword} ${banben} ${originPrice} ${serverPrice}`);
        result.push({
            productId: baseInfo.productId,
            spuName: baseInfo.spuName,
            netword: netword,
            banben: banben,
            originPrice, serverPrice
        });
        return result;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const getAllPrice = async() =>{
    try {
        const phoneDetailData = JSON.parse(fs.readFileSync(phoneDetailDataPath));
        let final = [];
        for(let detail of phoneDetailData){
            const list = await getPrice(detail);
            final = final.concat(list);
        }
        return final;
    } catch (e) {
        console.error(e);
        return [];
    }
};

const savePrice = async() => {
    try {
        const result = await getAllPrice();
        await fs.ensureDir(_path.join(pricePath, '..'));
        fs.writeFileSync(pricePath, JSON.stringify(result, null, 4));
        return null;
    } catch (e) {
        console.error(e);
        return e;
    }
};

savePrice()
exports.savePrice = savePrice;