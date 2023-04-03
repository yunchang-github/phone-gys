<template>
  <div class="page1">
    <div style="dispaly: flex">
      <van-icon name="home-o" class="goHome" @click="goHome" />
      <van-icon name="arrow-left" class="arrow" @click="goPrev" />
      <span class="ycphone-title">
        {{ languageType == "Chinese" ? "供应商发货清单" : "Scan" }}
      </span>
    </div>
    <div class="contentBox">
      <div class="inputStyle">
        <div
          :class="[
            'language',
            isShowSelect ? 'selectBoxStyle' : 'commonBoxStyle'
          ]"
        >
          <!-- 选择类型下拉 -->
          <template v-if="isShowSelect">
            <p v-for="item in selectBox" :key="item.value" class="lineHeight24">
              <span
                @click="selectLang(item)"
                :style="{ color: selectType === item.label ? '#409eff' : '' }"
                >{{ item.label }}</span
              >
            </p>
          </template>
          <template v-else>
            <p @click="isShowSelect = true" class="lineHeight22">
              <span>{{ selectType }}</span>
            </p>
          </template>
        </div>
        <input
          id="input"
          type="text"
          :placeholder="languageType == 'Chinese' ? '模糊查询' : 'Scan'"
          v-model="selectValue"
          @keyup.enter="getFirstTableData"
          @focus="showHistroy"
        />
      </div>
    </div>

    <div class="mainBox">
      <template v-if="tableData.length > 0">
        <div
          v-for="(item, index) in tableData"
          :key="index"
          style="overflow: hidden; border: 1px solid #ccc; margin-bottom: 10px"
          @click="goDetail(item)"
        >
          <p style="font-weight: 600" class="M0P0 fontSize14">
            <span :style="handleColor('listingNumber')">{{
              item.listingNumber
            }}</span>
            -
            <span :style="handleColor('providerName')">
              {{ item.providerName }}
            </span>
            -
            <span :style="handleColor('skuLabel')">
              {{ item.skuLabel }}
            </span>
          </p>
          <p class="M0P0 fontSize14" style="font-weight: 600">
            <span :style="handleColor('logisticsNo')">
              {{ item.logisticsNo }}
            </span>
            -{{ item.arrivedBag || 0 }}-{{ item.totalBag || 0 }}
          </p>
          <ul class="wrapUl">
            <li
              v-for="(option, index) in item.purchaseArrivalSigns"
              :key="index"
              class="fontSize14"
              style="width: 33vw"
            >
              <van-image
                width="2rem"
                height="2rem"
                fit="contain"
                :src="option.stockPicture"
              />
              <br />
              <p class="M0P0 onlyOneLine" @click.stop="gtouchstart(option)">
                <span :style="handleColor('stockSku')">{{
                  option.stockSku
                }}</span>
                <br />
                <span :style="handleColor('groupId')">
                  {{ option.groupId }}
                </span>
              </p>
            </li>
          </ul>
        </div>
        <van-loading size="24px" v-if="loading">加载中...</van-loading>
        <div style="text-align: center" v-if="!loading">
          <template v-if="isError">
            <span @click="getTableData" class="fontSize18"
              >请求失败 请点击重新加载</span
            >
          </template>
          <template v-else>
            <span class="fontSize18">
              {{ tableData.length == 0 ? "暂无数据" : "没有更多了" }}</span
            >
          </template>
        </div>
      </template>
      <template v-else>
        <p class="fontSize16" style="text-align: center; margin-top: 15px">
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
import { getPurchaseShippingListArrivalSign } from "@/api/index.js";
import { Toast, ImagePreview } from "vant";
export default {
  data() {
    return {
      loading: false,
      isError: false, // 请求失败
      isBottom: 0, // 判断距离底部的距离
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
        // { value: "stockSkuName", label: "SKU中文" },
        { value: "providerName", label: "供应商" },
        { value: "skuLabel", label: "品类" }
      ],
      tableData: [],
      mainPageInfo: {
        pageSize: 5,
        pageNum: 1,
        total: 0
      },
      detailShow: false,
      detailInfo: "", // 长按显示明细
      timeOutEvent: 0
    };
  },
  mounted() {
    if (document.querySelector("#input")) {
      document.querySelector("#input").focus();
    }
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleColor(label) {
      return { color: this.key === label && this.selectValue ? "red" : "#333" };
    },
    //长按事件（起始）
    gtouchstart(item) {
      this.detailShow = true;
      this.detailInfo = `${item.stockSku} <br/> ${item.stockSkuName} <br/>${item.groupId}`;
    },
    imagePreview(url) {
      return ImagePreview([url]);
    },
    // 处理历史记录
    showHistroy() {
      this.histroyList = localStorage.getItem("searchHistory");
    },
    // 处理滚动高度
    handleScroll() {
      let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      let clientHeight = document.documentElement.clientHeight;
      let scrollHeight = document.documentElement.scrollHeight;
      if (scrollTop + clientHeight >= scrollHeight) {
        // 如果滚动到接近底部，自动加载下一页
        //事件处理
        if (!this.loading) {
          if (
            this.mainPageInfo.total >
            this.mainPageInfo.pageSize * this.mainPageInfo.pageNum
          ) {
            this.mainPageInfo.pageNum++;
            this.getTableData();
          }
        }
      }
    },
    goHome() {
      this.$router.push({ name: "Home" });
    },
    goPrev() {
      //返回上一页
      this.$router.push({ name: "Home" });
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
    getFirstTableData() {
      this.mainPageInfo.pageNum = 1;
      this.tableData = [];
      this.getTableData();
    },
    // 获取数据
    getTableData() {
      let _data = {
        variable: 0,
        pageSize: this.mainPageInfo.pageSize,
        pageNum: this.mainPageInfo.pageNum
      };
      if (this.selectValue.trim().length > 0) {
        this.selectBox.forEach(item => {
          if (item.value === this.key) {
            _data[this.key] = this.selectValue.trim();
          } else {
            _data[item.value] = "";
          }
        });
      }
      this.loading = true;
      getPurchaseShippingListArrivalSign(_data)
        .then(data => {
          if (data.data[1].list.length > 0) {
            this.tableData = [...this.tableData, ...data.data[1].list];
            this.mainPageInfo.total = data.data[1].total;
          }
          this.loading = false;
          this.isError = false;
        })
        .catch(error => {
          this.loading = false;
          this.isError = true;
        });
    },
    // 跳到下一个页面
    goDetail(item) {
      sessionStorage.setItem("ycFactoryDetail", JSON.stringify(item));
      this.$router.push({
        name: "FactoryDetail",
        query: { type: this.selectType, value: this.selectValue }
      });
    },
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
    groupFun(arr, key) {
      let map = {},
        dest = [];
      for (var i = 0; i < arr.length; i++) {
        var ai = arr[i];
        if (!map[ai[key]]) {
          dest.push({
            // 可以加自己需要的其他数据
            providerName: ai.providerName,
            totalBag: ai.totalBag,
            arrivedBag: ai.arrivedBag,
            logisticsNo: ai.logisticsNo,
            skuLabel: ai.skuLabel,
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
  },
  created() {
    this.languageType = localStorage.getItem("factoryLanguage") || "Chinese";
    if (this.$route.query.type || this.$route.query.value) {
      this.selectType = this.$route.query.type;
      this.selectValue = this.$route.query.value;
      this.selectBox.forEach(item => {
        if (item.label === this.selectType) {
          this.key = item.value;
        }
      });
    }
    this.getFirstTableData();
  }
};
</script>

<style lang="scss">
.page1 {
  padding: 10px;
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
      height: 32px;
      width: 70%;
      padding: 0;
      margin-left: 32%;
      padding-left: 2%;
      box-sizing: border-box;
      border: 1px solid #ccc;
    }
    .language {
      position: absolute;
      z-index: 2;
      width: 26%;
      color: #fff;
      padding: 5px;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 6px;
      // height: 24px;
      // line-height: 24px;
      box-sizing: border-box;
      font-size: 14px;
      p {
        padding: 0;
        margin: 0;
        // height: 32px;
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
  .commonBoxStyle {
    height: 32px;
    line-height: 22px;
  }
  .selectBoxStyle {
    height: 192px;
    line-height: 30px;
  }
  .contentBox {
    margin-bottom: 16px;
    margin-top: 4px;
  }
  .ycphone-title {
    text-align: center;
    font-size: 24px;
  }
  .mainBox {
    border-radius: 4px;
    overflow: hidden;
    .lineHeight24 {
      height: 24px;
      line-height: 24px;
    }
    .lineHeight22 {
      line-height: 22px;
    }
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
</style>
