<template>
  <div id="packageToInventory">
    <div class="headerClass">
      <div>
        <van-icon name="arrow-left" class="goBack" @click="goBack"></van-icon>
        <span class="warehouse">默认仓库</span>
      </div>
      <div>整箱盘点</div>
      <div class="userNameClass">{{ username }}</div>
    </div>
    <div class="contentclass">
      <div class="inputsClass">
        <div class="inputItemClass" style="margin-bottom: 10px">
          <span class="labelClass">库位:</span>
          <input
            type="text"
            ref="input1Ref"
            v-model.trim="newStorageLocation"
            placeholder="请扫描库位"
            @keydown.enter="input1Enter"
            @focus="stopKeyborad"
            :readonly="readonly"
            :style="{ flex: isCanSuccessCheck ? '' : 1 }"
          />
          <div class="btnClass" v-if="isCanSuccessCheck">
            <van-button type="primary" size="small" @click="checkSuccessBtn"
              >完成盘点</van-button
            >
          </div>
          <!-- :disabled="newStorageLocationSuccess" -->
        </div>
        <div class="inputItemClass">
          <span class="labelClass">托盘号:</span>
          <input
            class="input2Class"
            type="text"
            ref="input2Ref"
            v-model.trim="palletNo"
            :disabled="input2Disabled"
            placeholder="请扫描托盘号"
            @keydown.enter="input2Enter"
            @focus="stopKeyborad"
            :readonly="readonly"
          />
        </div>
      </div>
    </div>
    <div class="tipsClass">
      <span>上一条扫描的托盘号：{{ palletNoSuccess }}</span>
      <span>总箱数：{{ allBoxCounts }}</span>
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
                <template v-if="filterTableData.length === 0 && !loading">
                  <tr :style="{ height: tableHeight }">
                    <td :colspan="tableColumns.length" align="center">
                      暂无数据
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="(row, index) in filterTableData" :key="index">
                    <template v-for="(option, i) in tableColumns">
                      <td :width="option.width" align="center" :key="i">
                        <template v-if="option.prop === 'index'">
                          {{ index + 1 }}
                        </template>
                        <template v-else-if="option.prop === 'operate'">
                          <span style="color: red" @click="deleteTableRow(row)">
                            删除
                          </span>
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
  </div>
</template>
    
    <script>
import { getTodayDate } from "@/utils/getDate";
import {
  selDListByLocation,
  selDListByPalletNo,
  completeInventory,
} from "@/api/packageToInventory.js";
import { Toast } from "vant";
export default {
  data() {
    return {
      readonly: false,
      autoFocus: false,
      newStorageLocation: undefined,
      newStorageLocationSuccess: undefined,
      palletNo: undefined,
      palletNoSuccess: undefined,
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
          label: "托盘号",
          prop: "palletNo",
        },
        {
          label: "箱子数量",
          prop: "boxCount",
          width: 80,
        },
        {
          label: "操作",
          prop: "operate",
          width: 60,
        },
      ],
    };
  },
  computed: {
    // 是否显示完成盘点按钮
    isCanSuccessCheck() {
      return this.tableData.length > 0;
    },
    // 过滤掉 已被删除的数据
    filterTableData() {
      return this.tableData.filter((item) => item.flag !== "delete");
    },
    // 表格目前存在的palletNo集合
    isExistPalletNos() {
      return this.filterTableData.map((item) => item.palletNo);
    },
    // 箱数总和
    allBoxCounts() {
      return this.filterTableData.reduce((acc, cur) => {
        acc += cur.boxCount;
        return acc;
      }, 0);
    },
    // 禁用palletNo输入框
    input2Disabled() {
      return !this.newStorageLocationSuccess;
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
    // newStorageLocation
    input1Enter() {
      if (this.inputEnter("newStorageLocation", "库位", "input1Ref")) return;
      this.getMainTable();
    },
    // palletNo
    async input2Enter() {
      if (this.inputEnter("palletNo", "托盘号", "input2Ref")) return;
      try {
        const { data: palletRes } = await selDListByPalletNo({
          palletNo: this.palletNo,
        });
        if (palletRes.length === 0) {
          Toast.fail({
            message: `没有 ${this.palletNo} 托盘信息`,
            position: "center",
          });
          this.palletNo = undefined;
          return false;
        }
        if (this.isExistPalletNos.includes(this.palletNo)) {
          Toast.fail({
            message: `托盘号 ${this.palletNo} 重复`,
            position: "center",
          });
          this.palletNo = undefined;
          return false;
        }
        // 进行将新库位与原库位的修改
        palletRes[0].originalStorageLocation = palletRes[0].newStorageLocation;
        palletRes[0].newStorageLocation = this.newStorageLocation;
        palletRes[0].flag = "new";
        this.palletNoSuccess = this.palletNo;
        this.tableData = this.tableData.concat(palletRes);
        this.palletNo = undefined;
      } catch (e) {
        console.log(e);
      }
    },
    // 删除 将新库位改为原库位  新库位删除
    deleteTableRow(row) {
      if (row.flag === "new") {
        this.tableData = this.tableData.filter(
          (item) => item.palletNo !== row.palletNo
        );
      } else {
        row.flag = "delete";
        row.originalStorageLocation = row.newStorageLocation;
        row.newStorageLocation = null;
        Toast.success({
          message: `删除托盘号 ${row.palletNo} 成功`,
          position: "center",
        });
      }
    },
    // 完成盘点按钮点击
    async checkSuccessBtn() {
      try {
        let list = this.tableData.map((item) => {
          return {
            ...item,
            inventoryTime: getTodayDate(),
          };
        });
        await completeInventory(list);
        Toast.success({
          message: `库位 ${this.newStorageLocation} 成功`,
          position: "center",
        });
        this.tableData = [];
        this.dataClear("newStorageLocation", "input1Ref");
      } catch (e) {
        console.log(e);
      }
    },
    async getMainTable() {
      try {
        this.palletNoSuccess = undefined;
        this.loading = true;
        this.tableData = [];
        const params = {
          newStorageLocation: this.newStorageLocation,
        };
        const { data: res } = await selDListByLocation(params);
        // 存一份原始数据的顺序
        this.tableDataOrg = res.map((item) => {
          return { oldBoxNo: item.palletNo };
        });
        res.forEach((item) => {
          item.flag = "old";
        });
        this.tableData = res;
        this.newStorageLocationSuccess = this.newStorageLocation;
        this.autoFocus = true;
        this.$nextTick(() => {
          this.$refs["input2Ref"] && this.$refs["input2Ref"].focus();
        });
        this.loading = false;
      } catch (e) {
        this.dataClear("newStorageLocation", "input1Ref");
        this.loading = false;
        console.log(e);
      }
    },
    goBack() {
      this.$router.go(-1);
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
#packageToInventory {
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
          width: 70px;
        }
        .btnClass {
          text-align: right;
          flex: 1;
        }
        input {
          font-size: 14px;
          width: 190px;
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
  .tipsClass {
    padding: 4px 20px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #666;
  }
  .tableContainer {
    flex: 1;
    box-sizing: border-box;
    padding: 10px;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    .loadingContainer {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .tableHeadClass {
      height: auto;
      thead {
        background-color: #eeeeee;
        th {
          color: #444;
          font-weight: 400;
        }
      }
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
    