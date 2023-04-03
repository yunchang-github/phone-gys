import axios from "axios";
import { Toast, Dialog } from "vant";
// import store from '@/store'
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
  timeout: 10000
});

// request拦截器
service.interceptors.request.use(
  config => {
    // 是否需要设置 token
    let { method, requestType, data, types, params } = config;
    const isToken = sessionStorage.getItem("factoryToken");
    if (config.types == "json") {
      config.headers["Content-Type"] = "application/json; charset=UTF-8";
    }
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
      if (requestType !== "upload") {
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
  error => {
    let { message, response } = error;
    // 所有的数据统一处理401的问题
    if (response.status === 401) {
      Toast("登录状态已过期");
      setTimeout(() => {
        sessionStorage.removeItem("factoryToken");
        location.href = "/phone/gys/";
      }, 3000);
    } else {
      if (message == "Network Error") {
        message = "Network Error";
      } else if (message.includes("timeout")) {
        message = "timeout";
      } else if (message.includes("Request failed with status code")) {
        message =
          "Request failed with status code" +
          message.substr(message.length - 3);
      }
      if (error.config.url === "/yc-busi-basics/oauth/token") {
        if (error.response) {
          Toast(error.response.data.error_description);
        } else {
          Toast(message);
        }
      } else {
        Toast(message);
      }
    }

    return Promise.reject(error);
  }
);

export default service;
