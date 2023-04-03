<template>
  <div class="homePage">
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
        <input
          type="text"
          v-model.trim="removeLocation"
          placeholder="请扫描"
          @keydown.enter="queryRemoveLocation"
        />
      </div>
      <div class="removeLocationInput">
        库存SKU:
        <input
          type="text"
          v-model.trim="sku"
          placeholder="请扫描"
          :disabled="!removeLocation"
          @keydown.enter="queryRemoveLocation"
        />
      </div>
      <div>
        <ul class="skuContent">
          <li
            v-for="(item, index) in skuList"
            :style="{
              backgroundColor: item.isChecked ? 'rgba(64,158,255,0.3)' : '',
            }"
            :key="index"
            @click="handleSlectedItem(item)"
          >
            <van-swipe-cell
              :stop-propagation="true"
              :before-close="beforeClose"
            >
              <div style="display: flex; padding: 5px 0">
                <div style="width: 2.5rem">
                  <img
                    :src="item.imageUrl"
                    style="width: 100%; height: 2.5rem"
                    alt=""
                  />
                </div>
                <div style="display: inline-block">
                  {{ item.sku }}<br />
                  {{ item.skuName }}
                </div>
              </div>

              <template #right>
                <div class="updateLocation">
                  <div>
                    移入货位:
                    <input
                      type="text"
                      v-model.trim="moveToStorageLocation"
                      placeholder="请扫描"
                      @keydown.enter="saveMoveToStorageLocation"
                    />
                  </div>
                </div>
              </template>
            </van-swipe-cell>
          </li>
        </ul>
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
      removeLocation: "",
      sku: "",
      allData: [], // 仓库下的所有仓位
      skuList: [], // 数据
      moveToStorageLocation: "", // 移入货位
    };
  },
  methods: {
    beforeClose({ position, instance }) {
      switch (position) {
        case "left":
        case "cell":
        case "outside":
          instance.close();
          break;
        case "right":
          // Dialog.confirm({
          //   message: '确定删除吗？',
          // }).then(() => {
          //   instance.close();
          // });
          break;
      }
    },
    // 获取本地仓库下的所有仓位
    // 点击选中 再次点击取消
    handleSlectedItem(row) {
      this.skuList.forEach((item) => {
        if (item.sku == row.sku) {
          item.isChecked = !row.isChecked;
        }
      });
    },
    // 查询仓位id 和对应的数据
    async queryRemoveLocation() {
      let res = await getInventoryDetailListByAllocationName({
        allocationName: this.removeLocation,
        warehouseId: this.warehouseId,
        sku: this.sku,
      });
      if (res.data[0] && res.data[0].skuList.length > 0) {
        res.data[0].skuList.forEach((item) => {
          item.isChecked = false;
        });
        this.skuList = res.data[0].skuList;
      } else {
        this.skuList = [];
        Toast("暂无数据!");
      }
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
      let tempData = this.skuList.filter((item) => item.isChecked);
      if (tempData.length === 0) {
        Toast("请先选择数据!");
        return false;
      }
      if (tempData[0].allocationId == allocationIdData) {
        Toast("不能转移给自己!");
        return false;
      }
      let options = [];
      tempData.forEach((item) => {
        options.push({
          skuId: item.skuId,
          warehouseId: this.warehouseId,
          allocationId: item.allocationId,
          quantity: -item.quantity,
        });
        options.push({
          skuId: item.skuId,
          warehouseId: this.warehouseId,
          allocationId: allocationIdData,
          quantity: +item.quantity,
        });
      });
      await postWarehouseFlowChartInsert(options);
      Toast.success("转移成功!");
      this.moveToStorageLocation = "";
      this.sku=''
      this.queryRemoveLocation();
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
  },
  created() {
    this.username = sessionStorage.getItem("username");
    // this.getListFun();
  },

  mounted() {},
};
</script>

<style lang="scss" scoped>
.homePage {
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
      margin-top: 10px;
      height: calc(100vh - 200px);
      overflow-y: scroll;
      .updateLocation {
        width: calc(100vw - 20px);
        height: 100%;
        background-color: #409eff;
        > div {
          padding-top: 20px;
          padding-left: 20px;
          box-ssizing: border-box;
        }
        input {
          height: 30px;
          line-height: 30px;
        }
      }
    }
  }
}
</style>
