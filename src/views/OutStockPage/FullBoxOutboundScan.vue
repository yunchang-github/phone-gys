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
            :style="{ flex: isCanSuccessScan ? '' : 1 }"
          />
          <div class="btnClass" v-if="isCanSuccessScan">
            <van-button type="primary" size="small" @click="replaceSuccessBtn"
              >完成扫描</van-button
            >
          </div>
          <!-- :disabled="shipmentIdSuccess" -->
        </div>
        <div class="inputItemClass">
          <span class="labelClass">箱子编号:</span>
          <input
            class="input2Class"
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
                        <template
                          v-if="option.prop === 'scannedQuantity/totality'"
                        >
                          <span
                            :style="{
                              color:
                                row.status !== '已扫描' &&
                                row.scannedQuantity > 0
                                  ? '#52c41a'
                                  : '',
                            }"
                            >{{ row.scannedQuantity }}</span
                          >/<span>{{ row.totality }}</span>
                        </template>
                        <template v-else>
                          <span>{{ row[option.prop] }}</span>
                        </template>
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
      :style="{ height: !clickCloseFlag ? '35%' : '30%' }"
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
          <van-button
            style="margin-right: 1em"
            type="default"
            size="small"
            @click="dialogShow = false"
            >取消</van-button
          >
          <van-button type="info" size="small" @click="confirmSuccessBtn"
            >确认完成</van-button
          >
        </div>
      </template>
    </van-popup>
  </div>
</template>
  
  <script>
import {
  selDemandBoxNo,
  getNewBoxNo,
  updateCaseScanStatus,
  replaceBoxNo,
  selOverseaBoxNoByBoxNo,
} from "@/api/FullBoxOutboundScan.js";
import chongfu from "@/assets/chongfu.mp3";
import chenggong from "@/assets/chenggong.mp3";
import cuowu from "@/assets/cuowu.mp3";
import tihuanchenggong from "@/assets/tihuanchenggong.mp3";
import { Toast } from "vant";
export default {
  data() {
    return {
      readonly: false,
      autoFocus: false,
      shipmentId: undefined,
      shipmentIdSuccess: undefined,
      boxNo: undefined,
      boxNoSuccess: undefined,
      loading: false,
      tableHeight: 400,
      isCanSuccessScan: false,
      tableData: [],
      tableColumns: [
        {
          label: "序号",
          prop: "index",
          width: 40,
        },
        {
          label: "海外仓箱号",
          prop: "overseaBoxNo",
        },
        {
          label: "已扫描数/总数",
          prop: "scannedQuantity/totality",
          width: 110,
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
      try {
        //判断 海外仓箱号 已扫描数要总数
        const { data: currentBoxName } = await selOverseaBoxNoByBoxNo({
          boxNo: this.boxNo,
        });
        let currentRow = this.tableData.find(
          (item) => item.overseaBoxNo === currentBoxName
        );
        if (!currentRow) {
          return Toast.fail({
            message: `未找到箱号为${this.boxNo}的对应海外仓箱号`,
            position: "center",
          });
        }
        if (currentRow.status === "已扫描") {
          return Toast.fail({
            message: `海外仓箱号为${currentRow.overseaBoxNo}已扫描完成，无法继续扫描`,
            position: "center",
          });
        }
        // 获取新箱号
        const { data: newBoxNoList } = await getNewBoxNo({
          shipmentId: this.shipmentIdSuccess,
        });
        let newBoxNo = "";
        let boxName = "";
        if (newBoxNoList.length === 0) {
          newBoxNo = this.shipmentIdSuccess + "U000001";
          boxName = `P1-B1`;
        } else {
          newBoxNo = this.getBoxNoByStr(newBoxNoList[0].newBoxNo);
          let boxNameIndex = Number(newBoxNo.slice(-6));
          boxName = `P1-B${boxNameIndex}`;
        }
        const data = {
          shipmentId: this.shipmentIdSuccess,
          originalBoxNo: this.boxNo,
          newBoxNo,
          boxName,
        };
        await updateCaseScanStatus(data);
        // 语言播报
        this.webSpeakFun(`成功`);
        this.boxNoSuccess = this.boxNo;
      } catch (e) {
        // 语言播报
        this.webSpeakFun(`错误`);
        this.boxNoSuccess = undefined;
        console.log(e);
      } finally {
        this.dataClear("boxNo", "input2Ref");
        // this.boxNo = undefined;
        this.getMainTable();
      }
    },
    // 完成替换按钮点击
    async replaceSuccessBtn() {
      let isAllSuccessFlag = this.tableData.every(
        (item) => item.status === "已扫描"
      );
      if (!isAllSuccessFlag) {
        this.clickCloseFlag = false;
        // 未全部扫描 跳出弹窗
        this.customTipDialog(
          {
            icon: "icon-warn",
            message: `此计划中还有箱子未扫描<br>是否确认要完成`,
          },
          0
        );
      } else {
        this.clickCloseFlag = true;
        this.replaceSuccessFun();
      }
    },
    // 确认完成
    confirmSuccessBtn() {
      this.dialogShow = false;
      this.clickCloseFlag = true;
      this.replaceSuccessFun();
    },
    // 替换接口动作
    async replaceSuccessFun() {
      try {
        const { data: msg } = await replaceBoxNo({
          shipmentId: this.shipmentIdSuccess,
        });
        let delay = msg === "操作成功" ? 1000 : 3000;
        // 语言播报
        this.webSpeakFun(`替换成功`);
        this.tableData = [];
        this.customTipDialog(
          {
            icon: "icon-success",
            message: msg, //查询条件为空
          },
          delay
        );
        return this.dataClear("shipmentId", "input1Ref");
      } catch (e) {
        this.webSpeakFun(`错误`);
        this.getMainTable();
        console.log(e);
      }
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
        res.forEach((item, i) => {
          item.index = i + 1;
          item.status =
            item.scannedQuantity === item.totality && item.totality > 0
              ? "已扫描"
              : "未扫描";
        });
        this.isCanSuccessScan = res.some((item) => item.scannedQuantity > 0);
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
      let mp3 = null;
      if (speakVal === "重复") {
        mp3 = chongfu;
      } else if (speakVal === "成功") {
        mp3 = chenggong;
      } else if (speakVal === "错误") {
        mp3 = cuowu;
      } else if (speakVal === "替换成功") {
        mp3 = tihuanchenggong;
      }
      var audio = new Audio(mp3);
      audio.play();
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
      font-size: 16px;
      padding: 10px 0;
      border-bottom: 1px solid #333;
      .inputItemClass {
        display: flex;
        align-items: center;
        .labelClass {
          width: 100px;
        }
        .btnClass {
          text-align: right;
          flex: 1;
        }
        input {
          font-size: 14px;
          width: 170px;
          border: 1px solid rgb(110, 110, 110);
          height: 30px;
        }
        input:disabled {
          background-color: #f0f0f0;
        }
        .input2Class {
          flex: 1;
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
    height: 35%;
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
  