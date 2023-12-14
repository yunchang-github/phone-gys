import request from "@/utils/request";

//  移入移出操作
export function getInventoryDetailListByAllocationName(obj) {
  return request({
    url: "/yc-busi-warehouse/warehouseAllocation/getInventoryDetailListByAllocationName",
    method: "get",
    params: obj
  });
}
// 获取 货位调整
export function getInventoryDetailListBySku(obj) {
  return request({
    url: "/yc-busi-warehouse/warehouseAllocation/getInventoryDetailListBySku",
    method: "get",
    params: obj
  });
}

// 获取所有的数据
export function getList(obj) {
  return request({
    url: "/yc-busi-warehouse/warehouseAllocation/getList",
    method: "get",
    params: obj
  });
}

// 入库出库操作
export function postWarehouseFlowChartInsert(obj) {
  return request({
    url: "/yc-busi-warehouse/warehouseFlowChart/insert",
    method: "post",
    types:"json",
    data: obj
  });
}

// 根据fnsku 获取asin
export function selFnskuQueryAsin(query) {
  return request({
    url: "/yc-busi-logistics/phone/wl/selFnskuQueryAsin",
    method: "get",
    params: query
  });
}


// 上传图片
export function uploadPictures(data) {
  return request({
    url: "/yc-busi-logistics/phone/wl/uploadPictures",
    method: "post",
    data,
    isNotHandle:true
  });
}