<template>
  <div class="page1">
    <div class="padding10">
      <div style="dispaly: flex">
        <van-icon name="home-o" class="goHome" @click="goHome" />
        <van-icon name="arrow-left" class="arrow" @click="goPrev" />
        <span class="ycphone-title">
          {{ languageType == "Chinese" ? "签收记录" : "Scan" }}
        </span>
      </div>
    </div>
    <div class="heightBox">
      <template v-if="tableData.length > 0">
        <div class="tableData" v-for="(item, index) in tableData" :key="index">
          <div class="mainBox">
            <span class="fontSize16">已到袋数/箱数: {{ item.totalNum }}</span>
            <span class="fontSize16" style="margin-left: 10px"
              >签收时间: {{ item.signedTime }}</span
            >
            <van-row class="padding10" style=" box-sizing: border-box">
              <van-col span="12" style="text-align: center">
                <van-image
                  width="100px"
                  height="100px"
                  fit="contain"
                  @click="imagePreview(item.faceSheetPicture)"
                  :src="item.faceSheetPicture"
                />
                <p class="M0P0 fontSize16">面单</p>
              </van-col>
              <van-col span="12" style="text-align: center">
                <van-image
                  width="100px"
                  height="100px"
                  fit="contain"
                  :src="item.shipmentPicture"
                  @click="imagePreview(item.shipmentPicture)"
                />
                <p class="M0P0 fontSize16">货件照片</p>
              </van-col>
            </van-row>
          </div>
          <table cellspacing="0" cellpadding="5">
            <tr>
              <th style="width: 12%">箱号</th>
              <th style="width: 25%">采购单号</th>
              <th style="width: 48%">
                图<br />
                SKU/SKU中文名
              </th>
              <th style="width: 14%">数量</th>
            </tr>
            <tbody>
              <tr v-for="(opt, optIndex) in item.children" :key="optIndex">
                <td>
                  <span>{{ opt.boxNo }}</span>
                </td>
                <td>
                  <span>{{ opt.groupId }}</span>
                </td>
                <td>
                  <div style="overflow: hidden">
                    <van-image
                      width="20%"
                      height="20%"
                      fit="contain"
                      style="float: left"
                      @click="imagePreview(opt.stockPicture)"
                      :src="opt.stockPicture"
                    />
                    <div style="float: left; width: 80%">
                      <p class="M0P0">{{ handleOnlyRow(opt.stockSku, 1) }}</p>
                      <p class="M0P0" @click="gtouchstart(opt)">
                        {{ handleOnlyRow(opt.stockSkuName) }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="textRight">
                  <span>{{ opt.shipmentQty }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-else>
        <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
        <p
          v-else
          class="fontSize16"
          style="text-align: center; margin-top: 16px;"
        >
          暂无数据!
        </p>
      </template>
    </div>
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
import { getshippingListWarehousingSummaryUnfinished } from "@/api/index.js";
import { ImagePreview } from "vant";
export default {
  data() {
    return {
      isShowSelect: false, // 是否显示下拉
      languageType: "",
      selectValue: "", // 输入的值
      selectType: "物流单号",
      key: "logisticsNo", // 对应的字段名
      selectBox: [
        // { value: "logisticsNo", label: "物流单号" },
        { value: "groupId", label: "采购单号" },
        // { value: "listingNumber", label: "清单编号" },
        { value: "stockSku", label: "SKU" },
        { value: "stockSkuName", label: "SKU中文" },
        { value: "providerName", label: "供应商" },
        { value: "skuLabel", label: "品类" }
      ],
      stockPicture: "",
      stockPicture1: "",
      tableData: [],
      totalNum: 0,
      mainTableData: {},
      detailShow: false,
      detailInfo: "", // 长按显示明细
      timeOutEvent: 0
    };
  },
  methods: {
    //长按事件（起始）
    gtouchstart(item) {
      this.detailShow = true;
      this.detailInfo = `${item.stockSku} <br/> ${item.stockSkuName}`;
    },
    imagePreview(url) {
      return ImagePreview([url]);
    },
    // 处理一行显示超出隐藏
    handleOnlyRow(name, type = 0) {
      if (type === 0) {
        if (name.length > 10) {
          return name.slice(0, 10) + "...";
        } else {
          return name;
        }
      } else {
        if (name.length > 20) {
          return name.slice(0, 7) + "..." + name.slice(-9);
        } else {
          return name;
        }
      }
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
    goPrev() {
      //返回上一页
      // this.$router.push({ name: "FactoryDetail" });
      this.$router.go(-1);
    },
    // 处理类型
    selectLang(value) {
      this.selectType = value.label;
      this.selectBox.forEach(item => {
        if (item.label === this.selectType) {
          this.key = item.value;
        }
      });
      setTimeout(() => {
        this.isShowSelect = false;
      }, 300);
    },
    // 获取数据
    getTableData() {
      let _data = {
        listingNumber: this.mainTableData.listingNumber,
        variable: 4
      };
      this.tableData = [];
      this.loading = true;
      getshippingListWarehousingSummaryUnfinished(_data)
        .then(res => {
          if (res.data.length > 0) {
            this.tableData = this.groupFun(res.data[1], "faceSheetPicture");
            this.tableData.forEach(item => {
              let boxNoArr = [];
              item.children.forEach(opt => {
                if (boxNoArr.indexOf(opt.boxNo) === -1) {
                  boxNoArr.push(opt.boxNo);
                }
              });
              item.totalNum = boxNoArr.length;
            });
            console.log(this.tableData);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 跳到下一个页面
    goDetail(item) {
      sessionStorage.setItem("ycFactoryDetail", JSON.stringify(item));
      this.$router.push({ name: "FactoryDetail" });
    },
    // 分组
    groupFun(arr, key) {
      let map = {},
        dest = [];
      for (var i = 0; i < arr.length; i++) {
        var ai = arr[i];
        if (!map[ai[key]]) {
          dest.push({
            // 可以加自己需要的其他数据
            faceSheetPicture: ai.faceSheetPicture,
            shipmentPicture: ai.shipmentPicture,
            signedTime: ai.signedTime,
            [key]: ai[key], //  一定要写 用于下面判断是否push到data中
            children: [ai]
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
    }
    // play() {
    //   let audioNum = document.getElementsByClassName("audio");
    //   if (audioNum.length == 1) {
    //     let audio = document.getElementsByClassName("audio")[0];
    //     audio.play();
    //   } else {
    //     let audio = document.createElement("audio");
    //     audio.src = this.myMp3;
    //     audio.style.display = "none";
    //     audio.controls = true;
    //     document.body.append(audio);
    //     audio.play();
    //   }
    // }
  },
  created() {
    this.languageType = localStorage.getItem("factoryLanguage") || "Chinese";
    this.mainTableData = JSON.parse(sessionStorage.getItem("ycFactoryDetail"));
    this.getTableData();
  },

  mounted() {
    if (document.querySelector("#input")) {
      document.querySelector("#input").focus();
    }
  }
};
</script>

<style lang="scss" scoped>
.page1 {
  padding: 0 10px;
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
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 10px;
    // overflow: hidden;
  }

  .M0P0 {
    margin: 0;
    padding: 0;
  }
}
.heightBox {
  height: calc(100vh - 42px);
  overflow-y: scroll;
}
.tableData {
  // height: 56vh;
  width: 100%;
  // overflow-x: auto;
  margin-bottom: 16px;
  background-color: #fff;
  // border: 1px solid #ccc;
  .tableData-ul {
    background-color: #fff;
  }
}
table {
  border-collapse: collapse;
  // border-top: 1px solid #eaf2fc;
  // border-bottom: 1px solid #eaf2fc;
  th,
  td {
    padding: 5px;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    padding: 9px 14px 8px;
    border-bottom: 1px solid #eaf2fc;
    border-right: 1px solid #eaf2fc;
  }
  th {
    background-color: #eaf2fc;
    // position: sticky;
    top: 0px;
    font-size: 14px;
    font-weight: 600;
  }
  td {
    background-color: #fff;
  }
}
</style>
