<template>
  <div class="skuSeparationDetail">
    <div class="contentTop">
      <div>
        <van-icon name="home-o" class="goHome" @click="goHome"></van-icon
        ><span class="warehouse">默认仓库</span>
      </div>
      <div class="userName">{{ username }}</div>
    </div>
    <div class="content">
      <!-- 内容区 -->
      <div class="removeLocationInput">
        移出货位:
        {{ removeLocation }}
      </div>
      <div class="removeLocationInput">库存SKU:</div>
      <div>
        <ul class="skuContent">
          <li v-for="(item, index) in skuList" :key="index">
            <div style="display: flex; padding-bottom: 10px">
              <div style="width: 2.5rem">
                <img :src="item.imageUrl" style="width: 100%;height: 2.5rem" alt="" />
              </div>
              <div>
                {{ item.sku }}<br />
                {{ item.skuName }}
              </div>
            </div>
          </li>
        </ul>
        <div class="updateQty">
          <div>
            <span>SKU结存: </span>
            <input
              type="text"
              class="updateQtyInput"
              v-model="skuQty"
              disabled
            />
            <span
              @click="transferQuantity = skuQty"
              style="margin-left: 6px; color: #409eff"
              >全部</span
            >
          </div>
          <div style="margin: 15px 0">
            <span>转移数量: </span>
            <van-stepper class="updateQtyInput1" v-model="transferQuantity" />
            <span
              @click="isScan = true"
              style="margin-left: 6px; color: #409eff"
              >请扫描>>
            </span>
          </div>
          <div v-if="isScan">
            移入货位:
            <input type="text" class="updateQtyInput" v-model.trim="moveToStorageLocation" @keydown.enter="saveMoveToStorageLocation"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getInventoryDetailListByAllocationName,
  getList,
  postWarehouseFlowChartInsert,
} from "@/api/stockPage.js";
import { Toast, ImagePreview } from "vant";
export default {
  data() {
    return {
      warehouseId: process.env.VUE_APP_WAREHOUSEID,
      username: "", //用户名
      removeLocation: "",// 仓位
      skuList: [], // 数据
      skuQty: "", // 初始数量
      transferQuantity: 1, // 转移数量
      isScan: false,
      removeLocationId: "",// 仓位id
      moveToStorageLocation:"",// 移入的仓位
      allData:[]
    };
  },
  methods: {
    goHome() {
      this.$router.push({ name: "Home" });
    },
        // 获取本地仓库下的所有仓位
    async getListFun() {
      let res = await getList({
        pageNum: 1,
        pageSize: 9999,
        warehouseId: this.warehouseId,
      });
      let option = [];
      res.data.list.forEach((item) => {
        option.push({ id: item.id, allocationName: item.allocationName });
        if (item.children && item.children.length > 0) {
          item.children.forEach((innerItem) => {
            option.push({
              id: innerItem.id,
              allocationName: innerItem.allocationName,
            });
          });
        }
      });
      this.allData = option;
    },
     // 将选中的数据全部做移入新库位操作 成功之后页面删除数据刷新 弹窗提示
    async saveMoveToStorageLocation() {
      // 对数据处理
      // 获取仓位id 如果没有提示改 仓库下不存在对应的仓位
      let allocationIdData = "";
      let result = await getInventoryDetailListByAllocationName({
        allocationName: this.moveToStorageLocation,
        warehouseId: this.warehouseId,
      });
      if (result.data && result.data.length > 0) {
        allocationIdData = result.data[0].id;
      }
      if (!allocationIdData) {
        Toast("本地仓库下不存在该仓位");
        return false;
      }
      if (this.skuList[0].allocationId == allocationIdData) {
        Toast("不能转移给自己!");
        return false;
      }
      let options = [];
      this.skuList.forEach((item) => {
        options.push({
          skuId: item.skuId,
          warehouseId: this.warehouseId,
          allocationId: item.allocationId,
          quantity: -this.transferQuantity,
        });
        options.push({
          skuId: item.skuId,
          warehouseId: this.warehouseId,
          allocationId: allocationIdData,
          quantity: +this.transferQuantity,
        });
      });
      await postWarehouseFlowChartInsert(options);
      Toast.success("转移成功!");
      this.$router.push({ name: "skuSeparation" });
    },
  },
  created() {
    this.username = sessionStorage.getItem("username");
    this.skuList = [JSON.parse(sessionStorage.getItem("skuSeparation"))];
    this.skuQty = this.skuList[0].quantity;
    this.removeLocation = this.$route.query.removeLocation;
    this.removeLocationId = this.$route.query.id;
    this.getListFun()
  },

  mounted() {},
};
</script>

<style lang="scss">
.skuSeparationDetail {
  position: relative;
  height: 100vh;
  overflow: hidden;
  .contentTop {
    background-color: #409eff;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    padding: 12px;
    .userName {
      font-size: 16px;
      text-align: right;
    }
    .goHome {
      font-size: 24px;
      vertical-align: bottom;
    }
    .warehouse {
      margin-left: 6px;
    }
  }
  .content {
    padding: 0 10px;
    .removeLocationInput {
      font-size: 20px;
      margin-top: 15px;
      input {
        border: 1px solid rgb(110, 110, 110);
        height: 40px;
      }
    }
    .skuContent {
      font-size: 18px;
      margin: 10px 0;
      .updateLocation {
        width: calc(100vw - 20px);
        box-sizing: border-box;
        height: 100%;
        padding-top: 20px;
        padding-left: 20px;
        box-sizing: border-box;
        background-color: #409eff;
        input {
          height: 30px;
          line-height: 30px;
        }
      }
    }
    .updateQty {
      font-size: 18px;
      .updateQtyInput {
        width: 50%;
      }
      .updateQtyInput1 {
        width: 50%;
        display: inline-block;
        vertical-align: bottom;
        .van-stepper__input {
          width: 60% !important;
        }
      }
    }
  }
}
</style>
