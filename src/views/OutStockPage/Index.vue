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
      <van-row style="margin-top: 16px">
        <van-col span="8">
          <div>
            <div
              class="iconStyle"
              @click="goToOutStockPageOtherPage('FullBoxOutboundScan')"
            >
              <span
                class="iconfont icon-a-Productmanagementspecification"
              ></span>
            </div>
            <div class="textStyle">整箱出库<br />扫描</div>
          </div>
        </van-col>
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
    // 去其他页面
    goToOutStockPageOtherPage(pageName) {
      this.$router.push({ name: pageName });
    },
    goHome() {
      this.$router.push({ name: "Home" });
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