<template>
  <div class="skuSeparationDetail">
    <div class="contentTop">
      <div>
        <van-icon name="home-o" class="goHome" @click="goHome"></van-icon
        ><span class="warehouse">默认仓库</span>
      </div>
      <div>{{ skuOld }}</div>
      <div class="userName">{{ username }}</div>
    </div>
    <div class="content">
      <div class="removeLocationInput">
        库存SKU:
        <input
          type="text"
          ref="skuInput"
          v-model.trim="sku"
          placeholder="请扫描"
          @keydown.enter="queryRemoveLocation"
        />
      </div>
      <div>
        <ul class="skuContent">
          <li
            v-for="(item, index) in skuList"
            :key="index"
            class="skuContentItem"
          >
            <div style="display: flex; padding-bottom: 10px">
              <div style="width: 2.5rem; margin-right: 6px">
                <van-image
                  width="2.5rem"
                  height="2.5rem"
                  fit="contain"
                  @click="imagePreview(item.imageUrl)"
                  :src="item.imageUrl"
                />
              </div>
              <div>
                {{ item.sku }}<br />
                {{ item.skuName }}
              </div>
            </div>
          </li>
        </ul>
        <div class="warehouseList" v-if="skuList.length > 0">
          <div
            :class="[item.isSelected ? 'activeItem' : '']"
            v-for="(item, index) in warehouseList"
            :key="index"
            @click="changeItem(item, index)"
          >
            <span>货位: {{ item.allocationName }}</span>
            <span>库存量: {{ item.quantity }}</span>
          </div>
        </div>

        <div v-if="isShowSkuListBottom" class="skuListBottom">
          <p>
            移出货位:
            <input
              type="text"
              disabled
              v-model.trim="isSelectedAllocationName"
              placeholder=""
            />
          </p>
          移入货位:
          <input
            type="text"
            ref="removeInLocationInput"
            v-model.trim="removeInLocation"
            placeholder="请扫描"
            @keydown.enter="moveIn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getInventoryDetailListBySku,
  postWarehouseFlowChartInsert,
  getInventoryDetailListByAllocationName,
} from "@/api/stockPage.js";
import { Toast, ImagePreview } from "vant";
export default {
  data() {
    return {
      warehouseId: process.env.VUE_APP_WAREHOUSEID,
      username: "", //用户名
      removeLocation: "",
      removeLocationId: "", // 对应的id 数据
      sku: "",
      skuOld: "",
      skuList: [], // 数据
      isShowSkuListBottom: false, // 是否显示sku
      warehouseList: [], // 可以选择的数据
      isSelectedAllocationName: "",
      removeInLocation: "",
      selectedAllocationId: "",
    };
  },
  methods: {
    imagePreview(url) {
      return ImagePreview([url]);
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
    // 查询仓位id 和对应的数据
    async queryRemoveLocation() {
      if (this.sku && this.sku.trim()) {
        this.skuOld = this.sku;
        let res = await getInventoryDetailListBySku({
          warehouseId: this.warehouseId,
          sku: this.sku.trim(),
        });
        this.sku = "";
        if (res.data && res.data.length > 0) {
          this.skuList = [res.data[0]];
          this.isSelectedAllocationName = res.data[0].allocationName;
          this.selectedAllocationId = res.data[0].allocationId;
          this.warehouseList = res.data.map((item, index) => {
            return {
              allocationName: item.allocationName,
              quantity: item.quantity,
              skuId: item.skuId,
              allocationId: item.allocationId,
              isSelected: index == 0,
            };
          });
          if (this.skuList.length > 0) {
            this.isShowSkuListBottom = true;
          } else {
            this.isShowSkuListBottom = false;
          }
          this.$nextTick(() => {
            this.$refs.removeInLocationInput.focus();
          });
        } else {
          this.initData();
          Toast("暂无数据!");
        }
      } else {
        Toast("请输入或扫描!");
      }
    },
    // 修改移入货位
    changeItem(item) {
      this.warehouseList.forEach((opt) => {
        if (opt.allocationName == item.allocationName) {
          opt.isSelected = true;
          this.isSelectedAllocationName = opt.allocationName;
          this.selectedAllocationId = opt.allocationId;
        } else {
          opt.isSelected = false;
        }
      });
    },
    // 处理移入接口
    async moveIn() {
      // 对数据处理
      // 获取仓位id 如果没有提示改 仓库下不存在对应的仓位
      let allocationIdData = "";
      let result = await getInventoryDetailListByAllocationName({
        allocationName: this.removeInLocation,
        warehouseId: this.warehouseId,
      });
      if (result.data && result.data.length > 0) {
        allocationIdData = result.data[0].id;
      }
      if (!allocationIdData) {
        Toast("本地仓库下不存在该仓位");
        return false;
      }
      if (this.selectedAllocationId == allocationIdData) {
        Toast("不能转移给自己!");
        return false;
      }
      let options = [];
      this.warehouseList.forEach((item) => {
        if (item.isSelected) {
          options.push({
            skuId: item.skuId,
            warehouseId: this.warehouseId,
            allocationId: item.allocationId,
            quantity: -item.quantity,
            documentType: 5,
          });
          options.push({
            skuId: item.skuId,
            warehouseId: this.warehouseId,
            allocationId: allocationIdData,
            quantity: +item.quantity,
            documentType: 3,
          });
        }
      });
      await postWarehouseFlowChartInsert(options);
      this.initData();
      this.$nextTick(() => {
        this.$refs.skuInput.focus();
      });
      Toast.success("转移成功!");
      //
    },
    // 清空数据
    initData() {
      this.removeLocation = "";
      this.removeLocationId = ""; // 对应的id 数据
      this.sku = "";
      this.skuList = []; // 数据
      this.isShowSkuListBottom = false; // 是否显示sku
      this.warehouseList = []; // 可以选择的数据
      this.isSelectedAllocationName = "";
      this.selectedAllocationId = "";
      this.removeInLocation = "";
    },
    // 进入详细页面
    // goDetail(item) {
    //   sessionStorage.setItem("skuSeparation", JSON.stringify(item));
    //   this.$router.push({
    //     name: "skuSeparationDetail",
    //     query: {
    //       removeLocation: this.removeLocation,
    //       id: item.allocationId,
    //     },
    //   });
    // },
  },
  created() {
    this.username = sessionStorage.getItem("username");
  },

  mounted() {
    this.$refs.skuInput.focus();
  },
};
</script>

<style lang="scss" scoped>
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
      margin-top: 10px;
      .skuContentItem {
        border: 1px solid #eee;
        padding: 6px;
      }
    }
  }
  .warehouseList {
    font-size: 16px;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    > div {
      padding: 4px 20px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
    }
    .activeItem {
      background-color: #079bef37;
    }
  }
  .skuListBottom {
    font-size: 18px;
  }
}
</style>
