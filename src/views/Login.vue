<template>
  <div class="login-page">
    <!-- 登录页面 -->
    <div class="fixedBox">
      <van-radio-group
        v-model="languageType"
        @change="selectLang"
        direction="horizontal"
      >
        <van-radio name="Chinese">Chinese</van-radio>
        <van-radio name="English">English</van-radio>
      </van-radio-group>
    </div>
    <h3
      style="
        margin: 50px 0 30px;
        text-align: center;
        font-size: 20px;
        line-height: 36px;
      "
    >
      {{ languageType == "Chinese" ? "云畅" : "Yunchang" }}
    </h3>
    <van-form v-if="languageType == 'Chinese'">
      <van-field
        v-model.trim="username"
        name="用户名"
        label="用户名"
        placeholder="用户名"
        :rules="[{ required: true, message: '请填写用户名' }]"
      />
      <van-field
        v-model.trim="password"
        type="password"
        name="密码"
        label="密码"
        placeholder="密码"
        @keyup.enter="submit"
        :rules="[
          { required: true, message: '请填写密码' },
          { validator: validator, message: '密码至少6位' },
        ]"
      />
      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">提交</van-button>
      </div>
    </van-form>
    <van-form v-else>
      <van-field
        v-model.trim="username"
        name="username"
        label="user name"
        placeholder="user name"
        :rules="[{ required: true, message: 'Please fill in the user name!' }]"
      />
      <van-field
        v-model.trim="password"
        type="password"
        name="password"
        label="password"
        placeholder="password"
        @keyup.enter="submit"
        :rules="[
          { required: true, message: 'Please fill in the password!' },
          {
            validator: validator,
            message: 'The password must be at least 6 digits!',
          },
        ]"
      />
      <div style="margin: 16px">
        <van-button round block type="info" @click="submit">Submit</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { Toast } from "vant";
import { getToken } from "@/api/index.js";
export default {
  data() {
    return {
      username: "",
      password: "",
      languageType: "Chinese",
    };
  },
  methods: {
    selectLang(value) {
      localStorage.removeItem("factoryLanguage");
      localStorage.setItem("factoryLanguage", value);
      this.languageType = value;
    },
    validator(val) {
      return val.length >= 6;
    },
    submit() {
      let that = this;
      if (this.username.trim().length > 0 && this.password.trim().length >= 6) {
        sessionStorage.removeItem("factoryToken");
        let data = {
          username: that.username,
          password: that.$md5(that.password),
          grant_type: "password",
          scope: "all",
          __t: new Date().getTime(),
        };
        getToken(data).then((res) => {
          sessionStorage.setItem(
            "factoryToken",
            `${res.token_type} ${res.access_token}`
          );
          sessionStorage.setItem("username", that.username);
          console.log(res);
          that.$router.push({ name: "Home" });
        });
      }
    },
  },
  created() {
    this.languageType = localStorage.getItem("factoryLanguage") || "Chinese";
  },

  mounted() {},
};
</script>

<style lang="scss">
.login-page {
  position: relative;
  padding: 5%;
  .fixedBox {
    font-size: 16px;
  }
}
</style>
