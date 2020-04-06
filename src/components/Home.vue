<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/head.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width= "isCollapse ? '64px' : '200px'">
        <div class="toggle-button"  @click="toggleCollapse"> ||| </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened 
        :collapse= "isCollapse" :collapse-transition="false" router :default-active="this.$route.path"> 
                                         <!--这个也可以 :default-active="this.$router.history.current.path" -->
          <!-- 一级菜单   动态绑定index不然展开一个全跟着展开了 而且要把int转为string-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>     
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconsObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao"
      },
      // 是否折叠
      isCollapse: false
    };
  },
  created() {
    //一开始就要加载side数据，所以在生命周期函数中
    this.getMenuList();
  },
  methods: {
    //promise然后解构对象处理
    async getMenuList() {
      //这个是在api里面查到的
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      // console.log(res);
      this.menulist = res.data;
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    logout() {
      //   removeItem()
      window.sessionStorage.clear();
      this.$router.push("/login");
    }
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%; //检查哪个部分没有撑满全屏
}
.img {
  height: 20px;
  width: 20px;
}
.el-header {
  background-color: #373d41;
  //加了这两句退后按钮就和div的图片分别在两端了
  display: flex;
  justify-content: space-between;
  //不要默认flex的左边padding让logo贴到左边
  padding-left: 0%;
  //让退出按钮能够不要贴上下边
  align-items: center;
  //把字体设成白色
  color: #ffffff;
  font-size: 20px;
  //用嵌套的方式，在把左边文字和图片如法炮制
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
// .el-menu {
//   width: 200px; //边框仿佛有锯齿状，菜单似乎比aside宽了一个像素
// }

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  font-size: 10px;
  color: #fff;
  text-align: center;
  letter-spacing: .2em;
  line-height: 24px;
  background-color: #4A5064;
  cursor: pointer;
}
</style>