<template>
  <div class="page2">
    <div style="dispaly: flex">
      <van-icon name="home-o" class="goHome" @click="goHome" />
      <van-icon name="arrow-left" class="arrow" @click="goPrev" />
      <span class="ycphone-title">
        {{
          languageType == "Chinese"
            ? "清单信息/" + mainTableData.listingNumber
            : "Scan"
        }}
      </span>
    </div>
    <div class="mainBox">
      <template v-if="tableData.length > 0">
        <div
          v-for="item in tableData"
          :key="item.boxNo"
          class="itemStyle2"
          :style="{
            backgroundColor: item.state === '已签收' ? '#eee' : '#fff',
          }"
        >
          <p
            class="M0P0 fontSize16"
            style="font-weight: bold; margin: 10px 0 0 10px"
          >
            {{ item.boxNo }}
          </p>
          <ul class="wrapUl">
            <li
              v-for="(option, index) in item.children"
              :key="index"
              class="itemStyle1"
            >
              <p style="text-align: center">
                <van-image
                  width="4rem"
                  height="4rem"
                  fit="contain"
                  @click="imagePreview(option.stockPicture)"
                  :src="option.stockPicture"
                />
              </p>

              <div class="M0P0" @click="gtouchstart(option)">
                {{ option.stockSku }}<br />
                {{ option.shipmentQty || 0 }}<br />
                {{ option.groupId }}
              </div>
            </li>
          </ul>
        </div>
      </template>
      <template v-else>
        <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
        <p v-else style="text-align: center; margin-top: 30px">暂无数据!</p>
      </template>
    </div>
    <div class="positionBtn">
      <!-- 添加 已签收的按钮 -->
      <van-icon name="plus" @click="signForArrival" style="font-size: 30px" />
      <br />
      <van-icon
        @click="signInRecord"
        name="underway-o"
        style="font-size: 30px"
      />
    </div>
    <!-- 显示弹窗 -->
    <van-popup
      v-model="dialogShow"
      position="bottom"
      :style="{ height: '74%' }"
    >
      <!-- 箱子数量位置 -->
      <div style="overflow: hidden">
        <ul style="width: 100%">
          <li
            class="itemStyle"
            v-for="(item, index) in boxNoList"
            :key="index"
            :style="handleColor(item)"
            @click="handleSelect(item)"
          >
            {{ item.boxNo }}
          </li>
        </ul>
        <!-- tableData -->
      </div>
      <van-row
        class="padding10"
        style="border: 1px solid #ccc; box-sizing: border-box"
      >
        <van-col span="12" style="text-align: center">
          <van-uploader
            :before-read="beforeRead"
            :after-read="afterRead"
            v-model="fileList"
            :max-size="5 * 1024 * 1024"
            @oversize="onOversize"
            :max-count="1"
          />
          <p class="MOPO fontSize16">上传面单</p>
        </van-col>
        <van-col span="12" style="text-align: center">
          <van-uploader
            v-model="fileList1"
            :before-read="beforeRead"
            :after-read="afterRead1"
            :max-size="5 * 1024 * 1024"
            @oversize="onOversize"
            :max-count="1"
          />
          <p class="MOPO fontSize16">上传货件照片</p>
        </van-col>
      </van-row>
      <div style="border: 1px solid #ccc; margin-top: 8px">
        <p class="MOPO fontSize16" style="text-align: center">选择签收时间</p>
        <van-datetime-picker
          v-model="currentDate"
          type="datetime"
          :show-toolbar="false"
          title="选择签收时间"
          :min-date="minDate"
          :max-date="maxDate"
          :formatter="formatter"
        />
      </div>
      <div class="fixedBottomStyle" style="">
        <!-- 已选择袋数2/已签收袋数3/总袋数12 -->
        <span class="fontSize16" style="width: 60%; display: inline-block"
          >已选择:{{ boxNoInfo.selectBoxNum }}/已签收:{{
            boxNoInfo.signNum
          }}/共:{{ boxNoInfo.totalNum }}</span
        >
        <p
          class="M0P0"
          style="width: 40%; display: inline-block; text-align: right"
        >
          <van-button type="default" @click="clearData" size="normal"
            >清空</van-button
          >
          <van-button
            type="info"
            @click="saveData"
            style="margin: 0 10px"
            size="normal"
            :disabled="disabledSaveBtn"
            >保存</van-button
          >
        </p>
      </div>
    </van-popup>
    <van-popup
      v-model="detailShow"
      position="bottom"
      :style="{ height: '30%' }"
    >
      <p class="fontSize16 padding10" v-html="detailInfo"></p>
    </van-popup>
  </div>
</template>

<script>
import {
  getshippingListWarehousingSummaryUnfinished,
  postPurchaseShippingListShippingPictureSave,
  postShippingSignCreateOrUpdate,
} from "@/api/index.js";
import { Toast, ImagePreview } from "vant";
import { formatDate } from "@/utils/validate.js";
export default {
  data() {
    return {
      loading: false, // 主表loading
      disabledSaveBtn: false, // 是否禁用保存按钮
      isShowSelect: false, // 是否显示下拉
      languageType: "",
      selectValue: "", // 输入的值
      selectType: "物流单号",
      key: "logisticsNo", // 对应的字段名
      selectBox: [
        { value: "logisticsNo", label: "物流单号" },
        { value: "groupId", label: "采购单号" },
        { value: "listingNumber", label: "清单编号" },
        { value: "stockSku", label: "SKU" },
        { value: "stockSkuName", label: "SKU中文" },
        { value: "providerName", label: "供应商" },
        { value: "skuLabel", label: "品类" },
      ],
      tableData: [],
      boxNoList: [], // 同上
      boxNoInfo: {
        selectBoxNum: 0,
        signNum: 0,
        totalNum: 0,
      },
      mainTableData: {}, // 主页面的数据
      dialogShow: false,
      fileList: [], // 上传面单的区域
      fileList1: [], // 上传货件
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(),
      currentDate: new Date(),
      shipmentPicture: "", // 货件地址
      faceSheetPicture: "", // 面单地址
      detailShow: false,
      detailInfo: "", // 长按显示明细
      timeOutEvent: 0,
    };
  },
  watch: {
    boxNoList: {
      handler(newV) {
        this.disabledSaveBtn = newV.every((item) => item.state === "已签收");
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    //长按事件（起始）
    gtouchstart(item) {
      this.detailShow = true;
      this.detailInfo = `${item.stockSku} <br/> ${item.stockSkuName} <br/>${item.groupId}`;
    },
    imagePreview(url) {
      return ImagePreview([url]);
    },
    formatter(type, val) {
      if (type === "year") {
        return val + "年";
      }
      if (type === "month") {
        return val + "月";
      }
      if (type === "day") {
        return val + "日";
      }
      if (type === "hour") {
        return val + "时";
      }
      if (type === "minute") {
        return val + "分";
      }
      return val;
    },
    // 上传前回调
    beforeRead(file) {
      // 先选择箱子
      if (this.boxNoList.some((item) => item.isSelcted)) {
        // 验证尺寸 格式等  格式：jpg、jpeg、png
        let accept = "image/jpeg,image/png,.jpg,.jpeg,.png,.JPG,.JPEG";
        if (accept.indexOf(file.type) === -1) {
          Toast("文件格式不正确!");
          return false;
        }
        return true;
      } else {
        Toast("请先选择箱子!");
        return false;
      }
    },
    onOversize() {
      Toast("文件大小不能超过 5M");
    },
    // 读取结束
    afterRead(file) {
      let formData = new FormData();
      // 通过append方法添加需要的file
      // 这里需要注意 append(key, value)来添加数据，如果指定的key不存在则会新增一条数据，如果key存在，则添加到数据的末尾
      let boxNos = this.boxNoList.filter((item) => item.isSelcted);
      formData.append("face", file.file);
      formData.append("listingNumber", this.mainTableData.listingNumber);
      formData.append("boxNos", boxNos.map((item) => item.boxNo).join(","));
      postPurchaseShippingListShippingPictureSave(formData)
        .then((res) => {
          this.faceSheetPicture = res.data.faceUrl;
          Toast("上传成功!");
        })
        .catch((error) => {
          Toast("上传失败!");
        });
    },
    afterRead1(file) {
      let formData = new FormData();
      // 通过append方法添加需要的file
      // 这里需要注意 append(key, value)来添加数据，如果指定的key不存在则会新增一条数据，如果key存在，则添加到数据的末尾
      let boxNos = this.boxNoList.filter((item) => item.isSelcted);
      formData.append("shipment", file.file);
      formData.append("listingNumber", this.mainTableData.listingNumber);
      formData.append("boxNos", boxNos.map((item) => item.boxNo).join(","));
      postPurchaseShippingListShippingPictureSave(formData)
        .then((res) => {
          this.shipmentPicture = res.data.shipmentUrl;
          Toast("上传成功!");
        })
        .catch((error) => {
          Toast("上传失败!");
        });
    },
    // 清空数据
    clearData() {
      // 还原选中的效果
      this.boxNoList.forEach((item) => (item.isSelcted = false));
      this.boxNoInfo.selectBoxNum = 0;
      this.fileList = [];
      this.fileList1 = [];
      this.shipmentPicture = "";
      this.faceSheetPicture = "";
      this.currentDate = new Date();
    },
    // 保存数据
    saveData() {
      let lastData = this.boxNoList.filter((item) => item.isSelcted);
      if (lastData.length > 0) {
        if (this.shipmentPicture && this.faceSheetPicture) {
          let options = [];
          lastData.forEach((item) => {
            let obj = {
              ...item.children[0],
              isReturn: 0,
              signedEquipment: 1,
              signedTime: formatDate("y-m-d h:i:s", this.currentDate),
              shipmentPicture: this.shipmentPicture,
              faceSheetPicture: this.faceSheetPicture,
            };
            options = [...options, obj];
          });
          postShippingSignCreateOrUpdate(options).then((data) => {
            this.dialogShow = false;
            Toast("签收成功!");
            // 刷新页面数据
            this.boxNoList = [];
            this.initData();
            this.clearData();
          });
        } else {
          Toast("请先上传图片!");
        }
      } else {
        Toast("请先选择箱子!");
      }
    },
    // 处理选中
    handleSelect(item) {
      if (!(item.state === "已签收" || item.state === "已退货")) {
        item.isSelcted = !item.isSelcted;
      }
      // 处理选中的数量
      this.boxNoInfo.selectBoxNum = this.boxNoList.filter(
        (item) => item.isSelcted
      ).length;
    },
    // 处理颜色
    handleColor(item) {
      let bgColor = "#FFF";
      let borderColor = "#353535";
      let color = "#333";
      if (item.isSelcted) {
        color = "#fff";
        bgColor = "#3280fc";
        borderColor = "#FFF";
      } else {
        if (item.state === "已签收" || item.state === "已退货") {
          borderColor = "#f5f5f5";
          color = "#c7c2c2";
        }
      }
      return {
        borderColor: borderColor,
        backgroundColor: bgColor,
        color,
      };
    },
    // 回到首页
    goHome() {
      this.$router.push({ name: "Home" });
    },
    //返回上一页
    goPrev() {
      // 携带参数
      this.$router.push({ name: "Factory", query: this.$route.query });
    },
    // 到货签收
    signForArrival() {
      this.clearData();
      this.currentDate = new Date();
      this.dialogShow = true;
    },
    // 签收记录
    signInRecord() {
      this.$router.push({ name: "SignInRecordPage" });
    },
    // 处理类型
    selectLang(value) {
      this.selectType = value.label;
      this.selectBox.forEach((item) => {
        if (item.label === this.selectType) {
          this.key = item.value;
        }
      });
      setTimeout(() => {
        this.isShowSelect = false;
      }, 300);
    },
    groupFun(arr, key) {
      let map = {},
        dest = [];
      for (var i = 0; i < arr.length; i++) {
        var ai = arr[i];
        if (!map[ai[key]]) {
          dest.push({
            // 可以加自己需要的其他数据
            state: ai.state,
            isSelcted: false,
            [key]: ai[key], //  一定要写 用于下面判断是否push到data中
            children: [ai],
          });
          map[ai[key]] = ai;
        } else {
          for (var j = 0; j < dest.length; j++) {
            var dj = dest[j];
            if (dj[key] == ai[key]) {
              dj.children.push(ai);
              break;
            }
          }
        }
      }
      return dest;
    },
    // 初始获取最大的数据值
    initData() {
      this.loading = true;
      this.tableData = [];
      if (this.mainTableData.listingNumber) {
        let _data = {
          listingNumber: this.mainTableData.listingNumber,
          variable: 1,
          state: "",
        };
        _data["sku"] = this.$route.query.sku || "";
        getshippingListWarehousingSummaryUnfinished(_data)
          .then((data) => {
            // 根据箱号分组
            if (data.data[1].length > 0) {
              // stockPictureBig
              this.tableData = this.groupFun(data.data[1], "boxNo");
              this.boxNoList = JSON.parse(JSON.stringify(this.tableData));
              this.boxNoInfo.signNum = this.boxNoList.filter(
                (item) => item.state === "已签收"
              ).length;
              this.boxNoInfo.totalNum = this.boxNoList.length;
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
  },
  created() {
    this.languageType = localStorage.getItem("factoryLanguage") || "Chinese";
    this.mainTableData = JSON.parse(sessionStorage.getItem("ycFactoryDetail"));
    // 查看路径上是否有参数如果有则 加sku的数据
    this.initData();
  },
  mounted() {
    if (document.querySelector("#input")) {
      document.querySelector("#input").focus();
    }
  },
};
</script>

<style lang="scss">
.page2 {
  padding: 10px;
  .fixedBottomStyle {
    padding: 5px 10px 10px;
    width: 100%;
    position: fixed;
    bottom: 0;
    background-color: #fff;
    z-index: 99;
    box-shadow: -1px -1px 3px #eee;
    box-sizing: border-box;
  }
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
    position: relative;
    input {
      height: 30px;
    }
    #language {
      position: absolute;
      // right: -15px;
      // top: -30px;
      z-index: 2;
      width: 20%;
      color: #fff;
      padding: 5px;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 6px;
      height: 24px;
      overflow: hidden;
      font-size: 14px;
      p {
        padding: 0;
        margin: 0;
        padding-top: 3px;
        text-align: center;
        span {
          cursor: pointer;
          &:hover {
            color: orange;
          }
        }
      }
    }
  }
  .ycphone-title {
    text-align: center;
    font-size: 24px;
  }
  .mainBox {
    // border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
    .itemStyle1 {
      font-size: 14px;
      width: 50%;
    }
  }
  .itemStyle2 {
    border: 1px solid #ccc;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .M0P0 {
    margin: 0;
    padding: 0;
  }
  .positionBtn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 10;
    background-color: #fff;
    padding: 5px;
    .plusStyle {
      border: 2px solid #424242;
      border-radius: 4px;
      height: 24px;
    }
  }
  .itemStyle {
    width: 18%;
    height: 18%;
    float: left;
    text-align: center;
    border: 1px solid #ccc;
    border-style: solid;
    box-sizing: border-box;
    margin: 1%;
  }
  .wrapUl {
    width: calc(100% -20px);
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    li {
      display: inline-block;
    }
  }
}
[v-cloak] {
  display: none;
}
</style>
