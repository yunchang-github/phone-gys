<template>
  <div class="page1">
    <div style="dispaly: felx">
      <van-icon name="home-o" class="goHome" @click="goHome" />
      <van-icon name="arrow-left" class="arrow" @click="goPrev" />
      <span class="ycphone-title">
        透明标图片上传
        <!-- {{
          languageType == "Chinese"
            ? "透明标回收"
            : "Transparent label recycling"
        }} -->
      </span>
    </div>
    <input
      id="input"
      type="text"
      placeholder="FNSKU"
      class="inputStyle"
      v-model="fnsku"
      clearable
      @keyup.enter="getAsin"
      style="margin-top: 30px"
    />
    <div v-if="info.asin" style="margin-top: 10px">
      <p style="font-size: 0.5rem">
        <span style="color: #5b5a5a;"><b>GTIN:</b></span> {{ info.gtin }} <br />
        <span style="color: #5b5a5a;"><b>SKU:</b></span> {{ info.sku }}<br />
        <span style="color: #5b5a5a;"><b>ASIN:</b></span> {{ info.asin }}<br />
        <span style="color: #5b5a5a;"><b>PRODUCT:</b></span> {{ info.product }}
      </p>
      <div>
        <span style="font-size: 0.5rem; margin-right: 10px">
          {{ languageType == "Chinese" ? "图1" : "First image" }}:
        </span>
        <van-uploader
          style="vertical-align: middle"
          v-model="fileList"
          multiple
          :max-count="1"
          :after-read="afterRead"
        />
      </div>
      <div>
        <span style="font-size: 0.5rem; margin-right: 10px"
          >{{ languageType == "Chinese" ? "图2" : "Second image" }}:
        </span>
        <van-uploader
          style="vertical-align: middle"
          v-model="fileList1"
          multiple
          :max-count="1"
          :after-read="afterRead1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { selFnskuQueryAsin, uploadPictures } from "@/api/stockPage.js";
import { Toast } from "vant";
export default {
  data() {
    return {
      warehouse: "",
      languageType: "",
      fnsku: "",
      info: {
        asin: "",
        gtin: "",
        sku: "",
        product: "", // 产品
      },
      fileList: [],
      fileList1: [],
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
    // 根据fnsku 获取对应的asin
    getAsin() {
      // 清除页面缓存
      this.fileList = [];
      this.fileList1 = [];
      selFnskuQueryAsin({
        fnsku: this.fnsku,
      }).then((res) => {
        this.fnsku=""
        if (res.data) {
          this.info = res.data;
        } else {
          Toast("无数据(No Data)!");
        }
      });
    },
    afterRead(file) {
      // 文件读取完成后的回调函数
      // 可以在这里进行文件上传的操作
      // 创建FormData对象，用于存储文件数据
      const formData = new FormData();
      formData.append("file", file.file); // 将文件添加到FormData中，'file'为后端接口接收文件的字段名
      formData.append("asin", this.info.asin);
      formData.append("imgType", 1);
      uploadPictures(formData).then((res) => {
        let tip =
          this.languageType == "Chinese" ? res.data : "Upload successful";
        Toast(tip);
      });
    },
    afterRead1(file) {
      const formData = new FormData();
      formData.append("file", file.file);
      formData.append("asin", this.info.asin);
      formData.append("imgType", 2);
      uploadPictures(formData).then((res) => {
        let tip =
          this.languageType == "Chinese" ? res.data : "Upload successful";
        Toast(tip);
      });
    },
  },
  created() {
    this.warehouse = this.$route.query.warehouse;
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
