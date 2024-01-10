import request from "@/utils/request";

// 查询可替换箱号数据
export function selDemandBoxNo(params) {
    return request({
        url: '/yc-busi-warehouse/enchaseManager/selDemandBoxNo',
        method: 'get',
        params
    })
}


// 查询可替换箱号数据
export function updateCaseScanStatus(params) {
    return request({
        url: '/yc-busi-warehouse/enchaseManager/updateCaseScanStatus',
        method: 'get',
        params
    })
}



// 替换箱号
export function replaceBoxNo(data, params) {
    return request({
        url: '/yc-busi-warehouse/enchaseManager/replaceBoxNo',
        method: 'post',
        types: "json",
        data,
        params,
        isShowLoading: true
    })
}