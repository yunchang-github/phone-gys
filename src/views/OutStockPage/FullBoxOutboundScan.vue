<template>
  <div id="OutStockPage">
    <div class="headerClass">
      <div>
        <van-icon name="arrow-left" class="goBack" @click="goBack"></van-icon>
        <span class="warehouse">默认仓库</span>
      </div>
      <div>整箱出库扫描</div>
      <div class="userNameClass">{{ username }}</div>
    </div>
    <div class="contentclass">
      <div class="inputsClass">
        <div class="inputItemClass" style="margin-bottom: 10px">
          <span class="labelClass">ShipmentId:</span>
          <input
            type="text"
            ref="input1Ref"
            v-model.trim="shipmentId"
            placeholder="请扫描ShipmentId"
            @keydown.enter="input1Enter"
            @focus="stopKeyborad"
            :readonly="readonly"
          />
          <!-- :disabled="shipmentIdSuccess" -->
        </div>
        <div class="inputItemClass">
          <span class="labelClass">箱子编号:</span>
          <input
            type="text"
            ref="input2Ref"
            v-model.trim="boxNo"
            :disabled="input2Disabled"
            placeholder="请扫描箱子编号"
            @keydown.enter="input2Enter"
            @focus="stopKeyborad"
            :readonly="readonly"
          />
        </div>
      </div>
    </div>
    <div class="tableContainer" :style="{ height: tableHeight + 'px' }">
      <template v-if="loading">
        <div class="loadingContainer" :style="{ height: tableHeight + 'px' }">
          <van-loading color="#0094ff" vertical> Loading </van-loading>
        </div>
      </template>
      <template v-else>
        <div class="tableClass tableHeadClass">
          <table rules="cols" style="width: 100%">
            <thead>
              <template v-for="(option, index) in tableColumns">
                <th :width="option.width" align="center" :key="index">
                  {{ option.label }}
                </th>
              </template>
            </thead>
          </table>
        </div>
        <div class="scrollbarClass">
          <div class="tableClass" style="border-top: none">
            <table rules="cols" style="width: 100%">
              <tbody>
                <template v-if="tableData.length === 0 && !loading">
                  <tr :style="{ height: tableHeight }">
                    <td :colspan="tableColumns.length" align="center">
                      暂无数据
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr
                    v-for="(row, index) in tableData"
                    :style="{
                      backgroundColor: row.status === '已扫描' ? '#52c41a' : '',
                      color: row.status === '已扫描' ? '#fff' : '',
                    }"
                    :key="index"
                  >
                    <template v-for="(option, i) in tableColumns">
                      <td :width="option.width" align="center" :key="i">
                        <span @click="tableClickBtn(row, option.prop)">{{
                          row[option.prop]
                        }}</span>
                      </td>
                    </template>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
    <!-- 自定义提示层 -->
    <van-popup
      v-model="dialogShow"
      class="dialogClass"
      :close-on-click-overlay="clickCloseFlag"
    >
      <div class="tipIconClass">
        <span
          :style="{
            color:
              currentDialogObj.icon === 'icon-warn'
                ? '#f5a300'
                : currentDialogObj.icon === 'icon-danger'
                ? '#fa5555'
                : '#67c23a',
          }"
          :class="{ iconfont: true, [currentDialogObj.icon]: true }"
        ></span>
      </div>
      <div class="tipMsgClass">
        <span v-html="currentDialogObj.message"></span>
      </div>
      <!-- 说明已经全部扫描完成 -->
      <template v-if="!clickCloseFlag">
        <div style="text-align: center">
          <van-button type="info" size="small" @click="replaceSuccessBtn"
            >完成</van-button
          >
        </div>
      </template>
    </van-popup>
  </div>
</template>
  
  <script>
import {
  selDemandBoxNo,
  updateCaseScanStatus,
  replaceBoxNo,
} from "@/api/FullBoxOutboundScan.js";
import Speech from "speak-tts"; // es6
import { Toast } from "vant";
export default {
  data() {
    return {
      speech: {},
      readonly: false,
      autoFocus: false,
      shipmentId: undefined,
      shipmentIdSuccess: undefined,
      boxNo: undefined,
      boxNoSuccess: undefined,
      loading: false,
      tableHeight: 400,
      tableData: [],
      tableDataOrg: [],
      tableColumns: [
        {
          label: "序号",
          prop: "index",
          width: 40,
        },
        {
          label: "箱子编号",
          prop: "boxNo",
        },
        {
          label: "状态",
          prop: "status",
          width: 60,
        },
      ],
      deliveryType: 1, //fba
      dialogShow: false,
      clickCloseFlag: true,
      currentDialogObj: {},
    };
  },
  computed: {
    input2Disabled() {
      return !(this.shipmentIdSuccess && this.tableData.length > 0);
    },
  },
  created() {
    this.username = sessionStorage.getItem("username");
  },
  methods: {
    stopKeyborad() {
      if (this.autoFocus) {
        this.readonly = true;
        setTimeout(() => {
          this.readonly = false;
        }, 200);
        this.autoFocus = false;
      }
    },
    //自定义提示弹窗
    customTipDialog(data, delay = 1200) {
      this.currentDialogObj = data;
      this.dialogShow = true;
      if (delay !== 0) {
        let timer = setTimeout(() => {
          this.dialogShow = false;
          clearTimeout(timer);
        }, delay);
      }
    },
    // data相关数据清空
    dataClear(prop, ref) {
      this[prop] = undefined;
      this[prop + "Success"] = undefined;
      if (ref) {
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs[ref] && this.$refs[ref].focus();
        });
      }
    },
    // 回车先执行事件
    inputEnter(prop, label, ref) {
      document.activeElement.blur();
      if (!this[prop]) {
        if (ref) {
          this.autoFocus = true;
          this.$nextTick(() => {
            this.$refs[ref] && this.$refs[ref].focus();
          });
        }
        Toast.fail({
          message: `${label}为空`,
          position: "center",
        });
        return true;
      }
      return false;
    },
    // shipmentId
    input1Enter() {
      if (this.inputEnter("shipmentId", "ShipmentId", "input1Ref")) return;
      this.getMainTable();
    },
    // boxNo
    async input2Enter() {
      if (this.inputEnter("boxNo", "箱子编号", "input2Ref")) return;
      let currentItem = this.tableData.find(
        (item) => item.boxNo === this.boxNo
      );
      if (!currentItem) {
        this.dataClear("boxNo", "input2Ref");
        // 语言播报
        this.webSpeakFun(`错误`);
        return this.customTipDialog({
          icon: "icon-danger",
          message: `此箱子，不属于该发货计划<br>请重新扫描`, //查询条件为空
        });
      }
      if (currentItem.status === "已扫描") {
        // 语言播报
        this.webSpeakFun(`重复`);
        this.dataClear("boxNo", "input2Ref");
        return this.customTipDialog({
          icon: "icon-warn",
          message: `此箱子已扫描<br>请扫描其他箱子`, //查询条件为空
        });
      }
      try {
        const data = {
          //   shipmentId: this.shipmentId,
          boxNo: this.boxNo,
        };
        await updateCaseScanStatus(data);
        currentItem.status = "已扫描";
        // 语言播报
        this.webSpeakFun(`成功`);
        this.allScanSuccessFun(); //置底加是否全部扫描
        this.boxNoSuccess = this.boxNo;
      } catch (e) {
        // 语言播报
        this.webSpeakFun(`失败`);
        this.boxNoSuccess = undefined;
        console.log(e);
      } finally {
        this.dataClear("boxNo", "input2Ref");
        // this.boxNo = undefined;
        // this.getMainTable();
      }
    },
    // 完成替换按钮点击
    async replaceSuccessBtn() {
      let newBoxNo = "";
      this.tableDataOrg.forEach((item, i) => {
        if (i === 0) {
          newBoxNo = this.shipmentIdSuccess + "U000001";
        } else {
          newBoxNo = this.getBoxNoByStr(newBoxNo);
        }
        item.newBoxNo = newBoxNo;
      });
      this.dialogShow = false;
      this.clickCloseFlag = true;
      await replaceBoxNo(this.tableDataOrg, {
        shipmentId: this.shipmentIdSuccess,
      });
      // 语言播报
      this.webSpeakFun(`替换成功`);
      this.tableData = [];
      this.customTipDialog(
        {
          icon: "icon-success",
          message: `全部替换成功`, //查询条件为空
        },
        1000
      );
      return this.dataClear("shipmentId", "input1Ref");
    },
    // 全部扫描完成动作
    allScanSuccessFun() {
      // 置底
      this.tableData.sort(function (a, b) {
        if (a.status === "已扫描" && b.status !== "已扫描") {
          return 1; // a排在b后面
        } else if (a.status !== "已扫描" && b.status === "已扫描") {
          return -1; // a排在b前面
        } else {
          return a.index - b.index; // 根据index正序排序
        }
      });
      let isAllSuccessFlag = this.tableData.every(
        (item) => item.status === "已扫描"
      );
      if (isAllSuccessFlag) {
        this.clickCloseFlag = false;
        this.customTipDialog(
          {
            icon: "icon-success",
            message: `已全部扫描完成`, //查询条件为空
          },
          0
        );
      } else {
        this.clickCloseFlag = true;
      }
    },
    async getMainTable() {
      try {
        this.loading = true;
        this.tableData = [];
        const params = {
          shipmentId: this.shipmentId,
        };
        //   let scanCountSum = 0,
        //     boxCountSum = 0;
        const { data: res } = await selDemandBoxNo(params);
        // 存一份原始数据的顺序
        this.tableDataOrg = res.map((item) => {
          return { oldBoxNo: item.boxNo };
        });
        res.forEach((item, i) => {
          item.index = i + 1;
          item.status = item.scanStatus === 1 ? "已扫描" : "未扫描";
        });
        this.tableData = res;
        this.allScanSuccessFun(); //置底加是否全部扫描
        this.shipmentIdSuccess = this.shipmentId;
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs["input2Ref"] && this.$refs["input2Ref"].focus();
        });
        this.loading = false;
      } catch (e) {
        this.dataClear("shipmentId", "input1Ref");
        this.loading = false;
        console.log(e);
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    webSpeakFun(speakVal) {
      this.speech.speak({ text: speakVal }).then(() => {
        this.speech.cancel(); //播放结束后调用
      });
      //   try {
      //     const utterance = new SpeechSynthesisUtterance(speakVal);
      //     // 获取 SpeechSynthesis 实例
      //     const synth = window.speechSynthesis;
      //     // 播放语音
      //     synth.speak(utterance);
      //   } catch (e) {
      //     console.log(e);
      //     this.customTipDialog(
      //       {
      //         icon: "icon-danger",
      //         message: e, //查询条件为空
      //       },
      //       0
      //     );
      //   }
    },

    speechInit() {
      this.speech = new Speech();
      this.speech.setLanguage("zh-CN");
      this.speech.init().then(() => {
        console.log("语音播报初始化完成");
      });
    },

    tableClickBtn(row, prop) {
      if (prop === "boxNo") {
        this.boxNo = row[prop];
        this.input2Enter();
      }
    },
    // 得到箱号得到后一位箱号
    getBoxNoByStr(boxNo) {
      let str = "";
      if (this.deliveryType == 1) {
        str = boxNo.substring(0, boxNo.length - 6);
        let str1 = parseFloat(boxNo.substring(boxNo.length - 6, boxNo.length));
        if (str1 + 1 < 10) {
          str += "00000" + (str1 + 1);
        } else if (str1 + 1 < 100) {
          str += "0000" + (str1 + 1);
        } else if (str1 + 1 < 1000) {
          str += "000" + (str1 + 1);
        } else if (str1 + 1 < 10000) {
          str += "00" + (str1 + 1);
        } else if (str1 + 1 < 100000) {
          str += "0" + (str1 + 1);
        } else {
          str += str1 + 1;
        }
      } else {
        str = boxNo.substring(0, boxNo.length - 3);
        let str1 = parseFloat(boxNo.substring(boxNo.length - 3, boxNo.length));
        if (str1 + 1 < 10) {
          str += "00" + (str1 + 1);
        } else if (str1 + 1 < 100) {
          str += "0" + (str1 + 1);
        } else {
          str += str1 + 1;
        }
      }
      return str;
    },
  },
  mounted() {
    this.speechInit();
    this.autoFocus = true;
    this.$nextTick(() => {
      this.$refs["input1Ref"] && this.$refs["input1Ref"].focus();
      this.tableHeight = document
        .querySelector(".tableContainer")
        .getBoundingClientRect().height;
    });
  },
};
</script>
  
  <style lang="scss" scoped>
#OutStockPage {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .headerClass {
    background-color: #409eff;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    .userNameClass {
      text-align: right;
    }
    .goBack {
      font-size: 20px;
      vertical-align: bottom;
    }
    .warehouse {
      margin-left: 6px;
    }
  }
  .contentclass {
    padding: 0 10px;
    .inputsClass {
      font-size: 18px;
      padding: 10px 0;
      border-bottom: 1px solid #333;
      .inputItemClass {
        display: flex;
        align-items: center;
        .labelClass {
          width: 120px;
        }
        input {
          font-size: 16px;
          flex: 1;
          border: 1px solid rgb(110, 110, 110);
          height: 30px;
        }
        input:disabled {
          background-color: #f0f0f0;
        }
      }
    }
  }
  .tableContainer {
    flex: 1;
    box-sizing: border-box;
    padding: 10px;
    display: flex;
    flex-direction: column;
    .loadingContainer {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tableHeadClass {
      height: auto;
    }
    .scrollbarClass {
      flex: 1;
      overflow-y: scroll;
      scroll-behavior: smooth; /* 平滑滚动效果 */
    }
    .tableClass {
      border: 1px solid #929292;
      border-bottom: none;
      table {
        table-layout: fixed;
        color: #515a6e;
        border-bottom: 1px solid #929292;
      }
      thead {
        th {
          padding: 8px 6px;
          font-size: 15px;
          text-align: center;
          border: 1px solid #929292; /* 设置边框 */
          word-wrap: break-word;
        }
      }
      tbody {
        td {
          padding: 6px;
          text-align: center;
          font-size: 14px;
          border: 1px solid #929292; /* 设置边框 */
          word-wrap: break-word;
        }
      }
    }
  }
  .dialogClass {
    width: 60%;
    height: 25%;
    padding: 20px;
    .tipIconClass {
      text-align: center;
      padding: 20px;
      .iconfont {
        font-size: 54px;
      }
    }
    .tipMsgClass {
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      line-height: 24px;
      margin-bottom: 10px;
    }
  }
}
</style>
  