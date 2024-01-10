import axios from "axios";
import { Toast, Dialog } from "vant";
import store from '@/store'
// import { getToken } from '@/utils/auth'
import errorCode from "@/utils/errorCode";
import Qs from "qs";
function tansParams(params) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== "undefined") {
            let params = propName + "[" + key + "]";
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}
axios.defaults.headers["Content-Type"] =
  "application/x-www-form-urlencoded;charset=utf-8";
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_URL,
  // 超时
  timeout: 600000
});

// request拦截器
service.interceptors.request.use(
  config => {
    if (config.isShowLoading) {
      if (config.loadMsg) {
        store.commit("updateApiLoadMsg", config.loadMsg)
      }
      store.commit("updateApiLoading", true)
    }
    // 是否需要设置 token
    let { method, requestType, data, types, params } = config;
    const isToken = sessionStorage.getItem("factoryToken");
    config.headers["Authorization"] = isToken || "Basic eWM6c2VjcmV0"; // 让每个请求携带自定义token 请根据实际情况自行修改
    if (params) {
      let url = config.url + "?" + tansParams(params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    // 处理参数
    if (types == "json") {
      config["data"] = JSON.stringify(data);
      config.headers["Content-Type"] = "application/json; charset=UTF-8";
    } else {
      if (requestType !== "upload" && !config.isNotHandle) {
        if (method === "post" || method === "POST") {
          config["data"] = Qs.stringify(data, { indices: false });
        }
      }
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  res => {
    if (res.config.isShowLoading) {
      store.commit("updateApiLoading", false)
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = res.data.msg || errorCode["default"] || errorCode[code];
    if (code === 401) {
      Toast("登录状态已过期");
      setTimeout(() => {
        sessionStorage.removeItem("factoryToken");
        location.href = "/phone/gys/";
      }, 3000);
    } else if (code === 500) {
      Toast(msg);
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      Toast(msg);
      return Promise.reject("error");
    } else {
      return res.data;
    }
  },
  async (error) => {
    if (error.config.isShowLoading) {
      store.commit("updateApiLoading", false)
    }
    let { message } = error;
    if (message === "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      const sub = message.substr(message.length - 3);
      if (sub == 500 && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else {
        message = "系统接口" + sub + "异常";
      }
      if (sub === "401") {
        handleAuthorized()
        // 如果未认证，并且未进行刷新令牌，说明可能是访问令牌过期了
        // if (!isRefreshToken) {
        //   isRefreshToken = true;
        //   // 1. 如果获取不到刷新令牌，则只能执行登出操作
        //   if (!getRefreshToken()) {
        //     return handleAuthorized();
        //   }
        //   // 2. 进行刷新访问令牌
        //   try {
        //     const refreshTokenRes = await refreshToken({
        //       grant_type: "refresh_token",
        //       refresh_token: getRefreshToken(),
        //     });
        //     // 2.1 刷新成功，则回放队列的请求 + 当前请求
        //     let expiresIn = new Date(
        //       new Date().getTime() + refreshTokenRes.expires_in * 1000
        //     );
        //     Cookies.set("admin-Token", refreshTokenRes.access_token, {
        //       expires: expiresIn,
        //     });
        //     Cookies.set("admin-Refresh-Token", refreshTokenRes.refresh_token, {
        //       expires: new Date(new Date().getTime() + 600000 * 1000),
        //     });
        //     Cookies.set("admin-Expires-In", expiresIn, { expires: expiresIn });
        //     requestList.forEach((cb) => cb());
        //     return service(error.config);
        //   } catch (e) {
        //     // 为什么需要 catch 异常呢？刷新失败时，请求因为 Promise.reject 触发异常。
        //     // 2.2 刷新失败，只回放队列的请求
        //     requestList.forEach((cb) => cb());
        //     // 提示是否要登出。即不回放当前请求！不然会形成递归
        //     return handleAuthorized();
        //   } finally {
        //     requestList = [];
        //     isRefreshToken = false;
        //   }
        // } else {
        //   return new Promise((resolve) => {
        //     requestList.push(() => {
        //       error.config.headers["Authorization"] = "bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
        //       resolve(service(error.config));
        //     });
        //   });
        // }
      }
    }
    if (error.config.url.indexOf("/authentication/form") !== -1) {
      message = error.response.data.content;
    }
    Toast.fail({
      message: message, //数量为空
      position: "top",
    });
    return Promise.reject(error);
  }
);

export default service;
