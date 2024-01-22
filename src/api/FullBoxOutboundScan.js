import request from "@/utils/request";

// 查询可替换箱号数据
export function selDemandBoxNo(params) {
    return request({
        url: '/yc-busi-warehouse/boxReplace/pdaList',
        method: 'get',
        params
    })
}


// 扫描箱子
export function updateCaseScanStatus(data) {
    return request({
        url: '/yc-busi-warehouse/boxReplace/scanBox',
        method: 'post',
        types: 'json',
        data
    })
}


// 获取最新的箱号
export function getNewBoxNo(params) {
    return request({
        url: '/yc-busi-warehouse/boxReplace/selScanBox',
        method: 'get',
        params
    })
}



// 替换箱号
export function replaceBoxNo(params) {
    return request({
        url: '/yc-busi-warehouse/boxReplace/replaceBox',
        method: 'get',
        params,
        isShowLoading: true
    })
}