<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!-- 表单区 -->
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRule"
      >
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" type="password" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456"
      },
      loginFormRule: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          //prop="password"
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    resetLoginForm() {
      //console.log(this;)这个里面有很多，可以打印出来看看
      //ref相当于操作拿到了form这个DOM
      this.$refs.loginFormRef.resetFields(); //这个是element-ui官网上form里面找到的函数
    },
    login() {
      //回调返回一个boolean   Function(callback: Function(boolean, object))
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        // axios                              route   data->loginFrom
        // const result = await this.$http.post("login", this.loginForm);
        // console.log(result); //这个result是个promise，用async和await修饰之后就变成获取到了对象
        // const {data : res} = await this.$http.post("login",res => { console.log(res)}); 等于上面

        //result里面由axios封装回了6个值，只需要data一个，所以解构出来重命名res, 只看这部分而已
        const { data: res } = await this.$http.post("login", this.loginForm);
        console.log(res); //打印出来发现res里面还有三部分           "登录失败"--之前自己写，但弹幕提醒最好用后端传过来的
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        
        //保存token跳转页面
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push('home'); 
      });
      // this.$refs.loginFormRef.validate().then(function(response){
      //     if(!response) {
      //         console.log("登录失败");
      //         return;
      //     }
      //     console.log(response);
      //     console.log("登录成功！")
      //     });
    }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  // 让白色区域在页面中间
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(
    -50%,
    -50%
  ); //不加这个相当于顶点在中间，减去自身宽高的一半
  //less语法嵌套
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px; //让图片和旁边有些间隙
    box-shadow: 0 0 10px #dddddd;
    //下面三个往右移动之后返回自身一半宽度就放正中间了
    position: absolute;
    left: 50%;          //左    右
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      //撑满上面box
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .btns {
    //这是我想的。。
    //   position: absolute;
    //   right: 10%;
    display: flex; //弹性盒子
    justify-content: flex-end;
  }

  .login_form {
    //加了下面两句form里面的input和button都到左下角了。。距离底部对齐
    position: absolute;
    bottom: 0;
    //加了这个input就拉长了
    width: 100%;
    padding: 0 20px; //以内容为边界调整边距
    //默认boxsizing: content-box改了这个input和button框框就不会跑到右边外面去了
    box-sizing: border-box; //以边框为界限调整边距
  }
}
</style>