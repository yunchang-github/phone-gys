import request from "@/utils/request";

// 根据库位查询信息
export function selDListByLocation(params) {
    return request({
        url: '/yc-busi-logistics/palletLocationRelation/byLocation',
        method: 'get',
        params
    })
}


// 根据托盘号查询信息
export function selDListByPalletNo(params) {
    return request({
        url: '/yc-busi-logistics/palletLocationRelation/byPalletNo',
        method: 'get',
        params
    })
}


// 完成盘点
export function completeInventory(data) {
    return request({
        url: '/yc-busi-logistics/palletLocationRelation/completeInventory',
        method: 'post',
        types: 'json',
        data,
        isShowLoading: true
    })
}