<template>
  <div class="InventoryDisk">
    <div class="contentTop">
      <div>
        <van-icon name="home-o" class="goHome" @click="goHome"></van-icon
        ><span class="warehouse">默认仓库</span>
      </div>
      <div v-if="skuList.length > 0">{{ allocationNameSuccess }}</div>
      <div class="userName">{{ username }}</div>
    </div>
    <div class="content">
      <div class="removeLocationInput">
        <div style="margin-bottom: 10px">
          <span class="labelClass"
            >{{ type === "1" ? "货位" : "盘点单" }}:</span
          >
          <input
            type="text"
            ref="allocationNameInput"
            v-model.trim="allocationName"
            placeholder="请扫描"
            @keydown.enter="searchMainListByAllocationName"
          />
        </div>
        <div>
          <span class="labelClass">SKU:</span>
          <input
            type="text"
            ref="skuInput"
            v-model.trim="sku"
            placeholder="请扫描"
            @keydown.enter="searchMainListBySku"
          />
        </div>
      </div>
      <div ref="searchContainerRef">
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
                {{ item.sku }}
                <span
                  class="isCheckedClass"
                  v-if="
                    item.checkActuallyAccounts ||
                    item.checkActuallyAccounts === 0
                  "
                  >（已盘点）</span
                ><br />
                <span v-if="type === '2'">{{ item.allocationName }} <br /></span>
                {{ item.skuName }}
              </div>
            </div>
            <van-row class="vanRow">
              <van-col span="9"
                ><div>
                  货位库存量:
                  <span
                    :style="{
                      color: item.isAllchecked ? 'red' : 'black',
                    }"
                    >{{ item.quantity }}</span
                  >
                </div>
              </van-col>
              <van-col span="9"
                ><div>仓库库存量: {{ item.totalQuantity }}</div>
              </van-col>
              <van-col span="6">
                <span
                  :class="{ otherSkuBtnDisable: !item.isAllchecked }"
                  class="otherSkuBtn"
                  @click="getOtherSkuList(item)"
                  >其他货位</span
                >
              </van-col>
            </van-row>
            <div class="divClass">
              <div>
                盘点数量:
                <input
                  type="text"
                  v-model.trim="item.adjustQty"
                  placeholder="请输入盘点数量"
                  style="width: 180px"
                />
              </div>
              <div>
                <van-button
                  size="small"
                  type="primary"
                  @click="checkBtn([item], 'one')"
                  >盘点</van-button
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 其他sku弹窗 -->
    <van-popup v-model="otherSkuShow" class="otherSkuShowPopup">
      <div class="otherSkuShowPopupContainer">
        <div class="skuTitle">SKU:{{ currentRow.sku }}</div>
        <ul class="otherSkuShowPopupUl">
          <li class="otherSkuShowPopupLi">
            <div style="width: 60%">货位</div>
            <div style="width: 40%">库存量</div>
          </li>
          <li
            class="otherSkuShowPopupLi"
            v-for="(item, index) in otherSkuList"
            :key="index"
          >
            <div :class="index === 0 ? 'firstList' : ''" style="width: 60%">
              {{ item.allocationName ? item.allocationName : "-" }}
            </div>
            <div :class="index === 0 ? 'firstList' : ''" style="width: 40%">
              {{ item.quantity }}
            </div>
          </li>
        </ul>
        <div class="otherConfirmContainer">
          <div>
            总盘点量：<input
              type="text"
              v-model.trim="currentRow.totalQuantityNew"
              placeholder="请输入总盘点量"
              style="width: 100px"
            />
          </div>
          <div>
            <van-button
              size="small"
              type="primary"
              @click="checkBtn(otherSkuList, 'many')"
              >盘点</van-button
            >
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import {
  getInventoryList,
  getInventoryListBySku,
  inventoryCheckAdd,
} from "@/api/InventoryDisk.js";
import { Toast, ImagePreview } from "vant";
export default {
  data() {
    return {
      type: this.$route.query.type,
      warehouseId: process.env.VUE_APP_WAREHOUSEID,
      otherSkuShow: false,
      username: "", //用户名
      sku: "",
      allocationName: "",
      allocationNameSuccess: "",
      skuList: [], // 数据
      currentRow: {},
      otherSkuList: [],
    };
  },
  created() {
    this.username = sessionStorage.getItem("username");
    console.log(this.type);
  },
  methods: {
    // 盘点操作
    async checkBtn(list, flag) {
      if (flag === "many") {
        list.forEach((item, i) => {
          if (i == 0) {
            item.adjustQty = this.currentRow.totalQuantityNew;
          } else {
            item.adjustQty = 0;
          }
        });
      }
      try {
        let query = {};
        if (this.type === "2") {
          query["type"] = 1;
        }
        await inventoryCheckAdd(list, query);
        Toast.success("盘点成功");
        if (flag === "many") {
          this.otherSkuShow = false;
        }
        this.renderTable();
      } catch (e) {
        console.log(e);
      }
    },
    // 查询其他skuList
    async getOtherSkuList(row) {
      this.otherSkuShow = true;
      // this.currentRow = {
      //   ...row,
      //   totalQuantityNew: row.totalQuantity,
      // };
      this.currentRow = JSON.parse(JSON.stringify(row));
      this.$set(this.currentRow, "totalQuantityNew", row.totalQuantity);
      const data = {
        warehouseId: row.warehouseId,
        sku: row.sku,
        allocationId: row.allocationId,
      };
      const res = await getInventoryListBySku(data);
      res.data.sort((a, b) => {
        if (a.allocationName === row.allocationName) return -1;
        if (b.allocationName === row.allocationName) return 1;
        return 0;
      });
      this.otherSkuList = res.data;
    },
    async renderTable() {
      try {
        Toast.loading({
          message: "加载中...",
          forbidClick: true,
          loadingType: "spinner",
          selector: this.$refs.searchContainerRef, // 或者直接传入 DOM 对象：selector: document.querySelector('#elementId')
        });
        const data = {
          warehouseId: this.warehouseId,
          sku: this.sku.trim(),
          status: 1,
        };
        if (this.type === "1") {
          // 货位查询
          data["allocationName"] = this.allocationNameSuccess.trim();
        } else {
          // 盘点单查询
          data["checkCode"] = this.allocationNameSuccess.trim();
          data["type"] = 1;
        }
        let res = await getInventoryList(data);
        if (res.data && res.data.length > 0) {
          res.data.forEach((item) => {
            item.isAllchecked = item.quantity !== item.totalQuantity;
            item.adjustQty = item.quantity;
          });
          this.skuList = res.data;
          this.$nextTick(() => {
            Toast.clear();
          });
        } else {
          this.initData();
          Toast("暂无数据!");
        }
      } catch (e) {
        console.log(e);
        this.$nextTick(() => {
          Toast.clear();
        });
      }
    },
    // 通过货位查询列表
    async searchMainListByAllocationName() {
      if (this.allocationName && this.allocationName.trim()) {
        try {
          Toast.loading({
            message: "加载中...",
            forbidClick: true,
            loadingType: "spinner",
            selector: this.$refs.searchContainerRef, // 或者直接传入 DOM 对象：selector: document.querySelector('#elementId')
          });
          const data = {
            warehouseId: this.warehouseId,
            sku: this.sku.trim(),
            status: 1,
          };
          if (this.type === "1") {
            // 货位查询
            data["allocationName"] = this.allocationName.trim();
          } else {
            // 盘点单查询
            data["checkCode"] = this.allocationName.trim();
            data["type"] = 1;
          }
          let res = await getInventoryList(data);
          if (res.data && res.data.length > 0) {
            res.data.forEach((item) => {
              item.isAllchecked = item.quantity !== item.totalQuantity;
              item.adjustQty = item.quantity;
            });
            this.skuList = res.data;
            this.allocationNameSuccess = this.allocationName.trim();
            this.allocationName = "";
            this.$nextTick(() => {
              Toast.clear();
            });
          } else {
            this.initData();
            Toast("暂无数据!");
          }
        } catch (e) {
          console.log(e);
          this.$nextTick(() => {
            Toast.clear();
          });
        }
      } else {
        Toast("请输入或扫描!");
      }
    },
    // 通过sku查询列表
    async searchMainListBySku() {
      if (this.allocationNameSuccess || this.allocationName.trim()) {
        try {
          Toast.loading({
            message: "加载中...",
            forbidClick: true,
            loadingType: "spinner",
            selector: this.$refs.searchContainerRef, // 或者直接传入 DOM 对象：selector: document.querySelector('#elementId')
          });
          const data = {
            warehouseId: this.warehouseId,
            sku: this.sku.trim(),
            status: 1,
          };
          if (this.type === "1") {
            // 货位查询
            data["allocationName"] =
              this.allocationNameSuccess || this.allocationName.trim();
          } else {
            // 盘点单查询
            data["checkCode"] =
              this.allocationNameSuccess || this.allocationName.trim();
            data["type"] = 1;
          }
          let res = await getInventoryList(data);
          if (res.data && res.data.length > 0) {
            res.data.forEach((item) => {
              item.isAllchecked = item.quantity !== item.totalQuantity;
              item.adjustQty = item.quantity;
            });
            this.skuList = res.data;
            this.sku = "";
            this.allocationName = "";
            this.$nextTick(() => {
              Toast.clear();
            });
          } else {
            this.initData();
            Toast("暂无数据!");
          }
        } catch (e) {
          console.log(e);
          this.$nextTick(() => {
            Toast.clear();
          });
        }
      } else {
        Toast("请输入货位或者先查询货位!");
      }
    },
    // 清空数据
    initData() {
      this.allocationName = "";
      this.skuList = []; // 数据
    },
    imagePreview(url) {
      return ImagePreview([url]);
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
  },
  mounted() {
    this.$refs.allocationNameInput.focus();
  },
};
</script>

<style lang="scss" scoped>
.InventoryDisk {
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
      padding: 10px 0;
      border-bottom: 1px solid #333;
      .labelClass {
        display: inline-block;
        width: 80px;
      }
      input {
        border: 1px solid rgb(110, 110, 110);
        height: 30px;
      }
    }
    .skuContent {
      font-size: 18px;
      margin-top: 10px;
      overflow: scroll;
      height: 78vh;
      .skuContentItem {
        border: 1px solid #eee;
        padding: 6px;
        margin-bottom: 10px;
        .isCheckedClass {
          font-size: 12px;
          color: red;
        }
      }
      .vanRow {
        text-align: center;
        background-color: #079bef37;
        padding: 5px;
        font-size: 16px;
        .otherSkuBtn {
          font-size: 14px;
          color: #006eff;
          text-decoration: underline;
        }
        .otherSkuBtnDisable {
          color: #c8c9cc;
          pointer-events: none;
          text-decoration: none;
        }
      }
      .divClass {
        margin: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        input {
          border: 1px solid rgb(110, 110, 110);
        }
      }
    }
  }
  .otherSkuShowPopup {
    padding: 10px;
    width: 80%;
    height: 60%;
    .otherSkuShowPopupContainer {
      height: 89%;
      padding: 20px;
      .skuTitle {
        font-size: 20px;
        text-align: center;
        background-color: #079bef37;
      }
      .otherSkuShowPopupUl {
        border: 1px solid #ccc;
        height: 79%;
        overflow: scroll;
        .otherSkuShowPopupLi {
          display: flex;
          text-align: center;
          font-size: 16px;
          div {
            border: 1px solid #eee;
          }
          .firstList {
            color: red;
          }
        }
      }
      .otherConfirmContainer {
        font-size: 18px;
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style>
