import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: 'login',
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/home",
    name: "Home",
    component: resolve => require(["@/views/Home.vue"], resolve)
  },
  {
    path: "/Factory",
    name: "Factory",
    component: resolve => require(["@/views/Factory.vue"], resolve)
  },
  {
    path: "/FactoryDetail",
    name: "FactoryDetail",
    component: resolve => require(["@/views/FactoryDetail.vue"], resolve)
  },
  {
    path: "/SignInRecordPage",
    name: "SignInRecordPage",
    component: resolve => require(["@/views/SignInRecordPage.vue"], resolve)
  },
  {
    path: "/StockPage",
    name: "StockPage",
    component: resolve => require(["@/views/StockPage/Index.vue"], resolve)
  },
  {
    path: "/locationSeparation",
    name: "locationSeparation",
    component: resolve => require(["@/views/StockPage/locationSeparation.vue"], resolve)
  },
  {
    path: "/SkuSeparation",
    name: "skuSeparation",
    component: resolve => require(["@/views/StockPage/SkuSeparation.vue"], resolve)
  },
  {
    path: "/SkuSeparationNew",
    name: "SkuSeparationNew",
    component: resolve => require(["@/views/StockPage/SkuSeparationNew.vue"], resolve)
  },
  {
    path: "/InventoryDisk",
    name: "InventoryDisk",
    component: resolve => require(["@/views/StockPage/InventoryDisk.vue"], resolve)
  },
  {
    path: "/SkuSeparationDetail",
    name: "skuSeparationDetail",
    component: resolve => require(["@/views/StockPage/SkuSeparationDetail.vue"], resolve)
  },
  {
    path: "/transparentLabel",
    name: "TransparentLabel",
    component: resolve => require(["@/views/StockPage/transparentLabel.vue"], resolve)
  },
  {
    path: "/OutStockPage",
    name: "OutStockPage",
    component: resolve => require(["@/views/OutStockPage/Index.vue"], resolve)
  },
  {
    path: "/FullBoxOutboundScan",
    name: "FullBoxOutboundScan",
    component: resolve => require(["@/views/OutStockPage/FullBoxOutboundScan.vue"], resolve)
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
export default router;
