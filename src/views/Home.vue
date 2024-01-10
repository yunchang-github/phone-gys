<template>
  <div class="homePage">
    <div class="content">
      <div class="contentTop">
        <div>
          <van-icon name="home-o" class="goHome"></van-icon
          ><span class="warehouse">默认仓库</span>
        </div>
        <div class="userName">{{ username }}</div>
      </div>
      <div class="stockSum">
        <div>入库待处理</div>
        <div>库存待处理</div>
      </div>
      <div class="btnBox">
        <div class="iconStyle">
          <span
            class="iconfont icon-ruku"
            @click="goToOtherPage('Factory')"
          ></span>
          <p class="iconTitle">入库</p>
        </div>
        <div>
          <span @click="goToOtherPage('StockPage')">
            <svg class="icon kucuntongji" aria-hidden="true">
              <use xlink:href="#icon-kucuntongji"></use>
            </svg>
          </span>
          <p class="iconTitle1">库存</p>
        </div>
        <div class="iconStyle">
          <span
            class="iconfont icon-chuku"
            @click="goToOtherPage('OutStockPage')"
          ></span>
          <p class="iconTitle">出库</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "", //用户名
    };
  },
  methods: {
    // 去其他页面
    goToOtherPage(pageName) {
      this.$router.push({ name: pageName });
    },
  },
  created() {
    this.username = sessionStorage.getItem("username");
    // this.languageType = localStorage.getItem("warehouseLanguage") || "Chinese";
    // this.confirmButtonText =
    //   this.languageType == "Chinese" ? "确认" : "confirm";
    // this.cancelButtonText = this.languageType == "Chinese" ? "取消" : "cancel";
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.homePage {
  position: relative;
  .content {
    padding: 20px;
    background-color: #409eff;
    height: 20vh;
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

    .stockSum {
      display: flex;
      font-size: 16px;
      justify-content: space-between;
      padding: 0 10%;
      text-align: center;
      color: #fff;
      margin-top: 20px;
    }
    .btnBox {
      position: absolute;
      bottom: -40px;
      width: 90%;
      left: 5%;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 10px;
      box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.2);
      display: flex;
      justify-content: space-between;
      padding: 10px 10%;
      box-sizing: border-box;
      .iconTitle {
        font-size: 20px;
        margin: 0;
      }
      .kucuntongji {
        margin-top: 0.365rem;
      }
      .iconTitle1 {
        font-size: 20px;
        margin: 0;
        color: #409eff;
        position: relative;
        top: -4px;
        text-align: center;
      }
      .iconStyle {
        margin-top: 16px;
        text-align: center;
        color: #409eff;
        span {
          font-size: 48px;
        }
      }
      svg {
        width: 48px;
        height: 48px;
      }
    }
    .ycphone-title {
      text-align: center;
      font-size: 24px;
    }
    .ycphone-p {
      text-align: center;
      font-size: 18px;
    }
  }
}
</style>
