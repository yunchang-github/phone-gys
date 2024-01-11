<template>
  <div class="page1">
    <div style="dispaly: felx">
      <van-icon name="home-o" class="goHome" @click="goHome" />
      <van-icon name="arrow-left" class="arrow" @click="goPrev" />
      <span class="ycphone-title"> 透明标回退 </span>
    </div>
    <input
      id="input"
      type="text"
      placeholder="请扫描透明标"
      class="inputStyle"
      v-model="coding"
      @keyup.enter="handleCoding"
      style="margin-top: 30px"
    />
    <div style="margin-top: 10px"></div>
  </div>
</template>

<script>
import {
  pdaTransparentLabelSendBack,
} from "@/api/stockPage.js";
import { Toast } from "vant";
export default {
  data() {
    return {
      languageType: "",
      coding: "",
    };
  },
  methods: {
    goHome() {
      this.$router.push({ name: "Home" });
    },
    goPrev() {
      //返回上一页
      this.$router.push({ name: "Home" });
    },
    handleCoding() {
      if (this.coding) {
        pdaTransparentLabelSendBack({
          coding: this.coding,
        }).then((res) => {
          this.coding = "";
          if (res.data) {
            Toast(res.data);
          } else {
            Toast("无数据(No Data)!");
          }
        }).catch(e=>{
          this.coding = "";
        });
      } else {
        Toast("请扫描或输入!");
      }
    },
  },
  created() {
    this.languageType = localStorage.getItem("warehouseLanguage") || "Chinese";
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.page1 {
  padding: 5% 5% 0;
  .goHome {
    margin-right: 2%;
    font-size: 20px;
    line-height: 30px;
    color: rgb(85, 85, 87);
  }
  .arrow {
    margin-right: 5%;
    font-size: 18px;
  }
  .inputStyle {
    height: 30px;
    font-size: 20px;
    width: calc(100vw - 12%);
  }
  .ycphone-title {
    text-align: center;
    font-size: 24px;
  }
}
</style>
