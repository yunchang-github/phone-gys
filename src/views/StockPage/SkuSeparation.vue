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
        <input
          type="text"
          placeholder="请扫描"
          :disabled="removeLocationDisabled"
          v-model.trim="removeLocation"
          @keydown.enter="queryRemoveLocation"
        />
      </div>
      <div class="removeLocationInput" v-if="removeLocation">
        库存SKU:
        <input
          type="text"
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
            @click="goDetail(item)"
          >
            <div style="display: flex; padding-bottom: 10px">
              <div style="width: 2.5rem">
                <img
                  :src="item.imageUrl"
                  style="width: 100%; height: 2.5rem"
                  alt=""
                />
              </div>
              <div>
                {{ item.sku }}<br />
                {{ item.skuName }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getInventoryDetailListByAllocationName } from "@/api/stockPage.js";
import { Toast, ImagePreview } from "vant";
export default {
  data() {
    return {
      warehouseId: process.env.VUE_APP_WAREHOUSEID,
      username: "", //用户名
      removeLocation: "",
      removeLocationId: "", // 对应的id 数据
      sku: "",
      skuList: [], // 数据
      removeLocationDisabled: false,
    };
  },
  methods: {
    goHome() {
      this.$router.push({ name: "Home" });
    },
    // 查询仓位id 和对应的数据
    async queryRemoveLocation() {
      let res = await getInventoryDetailListByAllocationName({
        allocationName: this.removeLocation,
        warehouseId: this.warehouseId,
        sku: this.sku,
      });
      if (res.data && res.data[0].skuList.length > 0) {
        this.skuList = res.data[0].skuList;
        if (this.skuList.length > 0) {
          this.removeLocationDisabled = true;
        } else {
          this.removeLocationDisabled = false;
        }
      } else {
        Toast("暂无数据!");
      }
    },
    // 进入详细页面
    goDetail(item) {
      sessionStorage.setItem("skuSeparation", JSON.stringify(item));
      this.$router.push({
        name: "skuSeparationDetail",
        query: {
          removeLocation: this.removeLocation,
          id: item.allocationId,
        },
      });
    },
  },
  created() {
    this.username = sessionStorage.getItem("username");
  },

  mounted() {},
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
      height: calc(100vh - 200px);
      overflow-y: scroll;
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
  }
}
</style>
