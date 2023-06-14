import request from "@/utils/request";

//  移入移出操作
export function getInventoryList(obj) {
  return request({
    url: "/yc-busi-warehouse/warehouseFlowChart/check/inventory/list",
    method: "get",
    params: obj
  });
}


//  移入移出操作
export function getInventoryListBySku(obj) {
  return request({
    url: "/yc-busi-warehouse/warehouseFlowChart/check/inventory/BySku",
    method: "get",
    params: obj
  });
}


// 盘点
export function inventoryCheckAdd(obj, query) {
  return request({
    url: "/yc-busi-warehouse/warehouseFlowChart/inventory/add",
    method: "post",
    types: "json",
    data: obj,
    params: query
  });
}