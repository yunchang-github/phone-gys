<template>
  <div class="stockPage">
    <div class="content">
      <div class="contentTop">
        <div>
          <van-icon name="home-o" class="goHome" @click="goHome"></van-icon
          ><span class="warehouse">默认仓库</span>
        </div>
        <!-- <div class="userName">{{ username }}</div> -->
      </div>
      <p class="adjustLocation">调整货位</p>
      <!-- <div style="margin-right:40px;" @click="locationSeparation">
          <div class="iconStyle">
            <span class="iconfont icon-drawer"></span>
          </div>
          货位分理
        </div> -->
      <van-row style="margin-top: 16px">
        <van-col span="8">
          <div>
            <div class="iconStyle" @click="skuSeparation">
              <span class="iconfont icon-021chouti"></span>
            </div>
            <div class="textStyle">货位调整</div>
          </div>
        </van-col>
        <van-col
          span="8"
          @click="toDiskInventory('1')"
          style="position: relative; z-index: 9999"
        >
          <div>
            <div class="iconStyle">
              <span class="iconfont icon-panku"></span>
            </div>
            <div class="textStyle">货位盘库</div>
          </div></van-col
        >
        <van-col
          span="8"
          @click="toDiskInventory('2')"
          style="position: relative; z-index: 9999"
        >
          <div>
            <div class="iconStyle">
              <span class="iconfont icon-panku"></span>
            </div>
            <div class="textStyle">盘点单盘库</div>
          </div></van-col
        >
      </van-row>
      <van-row style="margin-top: 16px">
        <van-col
          span="8"
          @click="transparentLabel"
          style="position: relative; z-index: 9999"
        >
          <div>
            <div class="iconStyle">
              <span class="iconfont icon-shangchuan_huaban"></span>
            </div>
            <div class="textStyle">透明标图片上传</div>
          </div></van-col
        >
      </van-row>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    goHome() {
      this.$router.push({ name: "Home" });
    },
    locationSeparation() {
      this.$router.push({ name: "locationSeparation" });
    },
    skuSeparation() {
      this.$router.push({ name: "SkuSeparationNew" });
    },
    toDiskInventory(type) {
      this.$router.push({ name: "InventoryDisk", query: { type } });
    },
    // 透明标回收页面
    transparentLabel() {
      this.$router.push({ name: "TransparentLabel" });
    },
  },
  created() {},

  mounted() {},
};
</script>

<style lang='scss' scoped>
.stockPage {
  height: 100vh;
  background-color: #409eff;
  .content {
    padding: 20px;
    height: 20vh;
    .adjustLocation {
      font-size: 16px;
      color: #fff;
      border-left: 2px solid #fff;
      padding-left: 10px;
    }
    .contentTop {
      font-size: 16px;
      display: flex;
      justify-content: space-between;
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
    .iconStyle {
      text-align: center;
      color: #fff;
      span {
        font-size: 48px;
      }
    }
    .textStyle {
      text-align: center;
      color: #fff;
      font-size: 20px;
    }
  }
}
</style>