import request from "@/utils/request";

// 获取token
export function getToken(obj) {
  return request({
    url: "/yc-busi-basics/oauth/token",
    method: "post",
    data: obj
  });
}

// 获取 0代表手机端主页面，1代表手机端签收箱子信息，2代表手机端已签收箱子信息
export function getPurchaseShippingListArrivalSign(query) {
  return request({
    url: "/yc-busi-purchase/purchaseShippingList/arrivalSign",
    method: "get",
    params: query
  });
}

// 获取箱子明细信息 0代表未完成,1代表清单编号详细信息,
export function getshippingListWarehousingSummaryUnfinished(query) {
  return request({
    url: "/yc-busi-purchase/purchaseShippingList/unfinished",
    method: "get",
    params: query
  });
}
// 清单图片 上传
export function postPurchaseShippingListShippingPictureSave(query) {
  return request({
    url: "/yc-busi-purchase/purchaseShippingList/shippingPictureSave",
    method: "post",
    requestType: "upload",
    data: query
  });
}

// 签收
export function postShippingSignCreateOrUpdate(query) {
  return request({
    url: "/yc-busi-purchase/purchaseShippingList/shippingSignCreateOrUpdate",
    method: "post",
    types: "json",
    data: query
  });
}
