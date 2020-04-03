<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->

      <!-- 删格系统，row和col总数24来分，gutter代表每个格子自己的列宽 -->
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="searchUser()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <!-- 这些prop是api里面传过来的 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="电话" prop="mobile" />
        <el-table-column label="角色" prop="role_name" />
        <el-table-column label="状态">
          <!-- 作用域插槽 scope.row就是所以一行的数据-,而且可以去掉状态后面的prop属性，-->
          <template v-slot:default="scope">
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDiaglog(scope.row.id)"
            />
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            />
            <el-tooltip :enterable="false" content="分配角色" placement="top" effect="dark">
              <el-button type="warning" size="mini" icon="el-icon-setting" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加用户的内容主体 -->
      <el-form :model="addForm" label-width="70px" :rules="userFormRules" ref="addFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 修改用户的内容主体 -->
      <el-form :model="editForm" label-width="70px" :rules="userFormRules" ref="editFormRef">
        <el-form-item label="用户名">
          <el-input :value="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Users",
  data() {
    // 自定义校验规则(必须放上面)
    let checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (!regEmail.test(value)) {
        callback(new Error("请输入正确的邮箱"));
      }
      callback();
    };
    // 手机号码的验证规则
    let checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (!regMobile.test(value)) {
        callback(new Error("请输入正确的手机号码"));
      }
      callback();
    };

    return {
      // 把method里面的参数写到这里是好习惯
      queryInfo: {
        query: "",
        pagenum: 1, //当前页数
        pagesize: 2 //当前每页显示多少条
      },
      userList: [],
      total: 0,
      //控制添加用户对话框表单页面显示与隐藏
      addDialogVisible: false,
      // 修改用户对话框显示与隐藏
      editDialogVisible: false,
      //添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //修改用户表单数据
      editForm: {},
      //修改规则也用这个 用户表单数据的验证规则
      //添加用户表单数据的验证规则
      userFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 5, max: 10, message: "长度在 5 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱地址", trigger: "blur" },
          {
            type: "email",  //有些人没有写这个的正则，而是就写了个type！也可以！
            message: "请输入正确的邮箱地址",
            trigger: ["change", "blur"]
          },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      //api规定用这三个参数
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // 修改每页显示条数时触发
    handleSizeChange(newSize) {
      // console.log(newSize);  弹幕提醒可以用.sync 但我没弄懂
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 切换页码时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // switch监听状态改变
    async userStateChanged(userInfo) {
      console.log(userInfo);
      //   查api文档1.3.3修改用户状态，用put请求
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status != 200) {
        //将switch的状态更改回去
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败!");
      }
      this.$message.closeAll(); //免得一直弹窗很多
      this.$message.success("更新用户状态成功！");
    },
    //查找用户
    searchUser() {
      this.queryInfo.pagenum = 1; //必须在第一页才能搜索，这个是bug
      this.getUserList();
    },
    //重置添加用户对话框，关闭之后没有填过的内容
    addDialogClosed() {
        this.$refs.addFormRef.resetFields();
    },
    //点击确定按钮添加用户
    addUser() {
        //表单预验证
        this.$refs.addFormRef.validate(async valid => 
        {
            if(!valid) return;
            // 发起添加用户的网络请求
            const {data: res} = await this.$http.post('users', this.addForm);
            if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
            this.$message.success(res.meta.msg);
            this.getUserList(); // 重新获取用户列表数据
            this.addDialogVisible = false; // 关闭对话框
        })
    },
    //修改按钮对话框
    async showEditDiaglog(id) {
        const {data : res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
        }
        this.editForm = res.data;
        this.editDialogVisible = true;
    },
    //重置编辑框
    editDialogClosed() {
        //弹幕说关闭有bug，我还没找到，但可以用这个
        // this.$refs.ediFormEef.clearValidate()
        this.$refs.editFormRef.resetFields();
    },
    //修改用户信息并提交
    editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
            if (!valid) return;
            const {data : res} = await this.$http.put('users/' + this.editForm.id,
             {
                email: this.editForm.email, 
                mobile: this.editForm.mobile
            })  
            if (res.meta.status !== 200) {
                return this.$message.error("修改失败");
            }
            //刷新列表
            this.getUserList();
            // 关闭对话框
            this.editDialogVisible = false;
            //提示成功
            this.$message.success(res.meta.msg);
        })
    },
    //删除用户信息并保存
    async removeUserById(id) {
        const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(err => err);
        //如果用户确认删除，这返回值为字符串 confrim
        //如果用户取消了删除，这返回值为字符串 cancel
        //console.log(result) 可以打出来看
        if (result !== 'confirm') return this.$message.info('取消删除');
        const {data: res} = await this.$http.delete('users/' + id);
        if (res.meta.status !== 200) return this.$message.error('删除用户失败');
        this.$message.success(res.meta.msg);
        //重置到首页刷新列表
        this.queryInfo.pagenum = 1;
        this.getUserList();
        // 官方是用then catch
        // this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
        //   this.$message({
        //     type: 'success',
        //     message: '删除成功!'
        //   });
        // }).catch(() => {
        //   this.$message({
        //     type: 'info',
        //     message: '已取消删除'
        //   });  
    }








  }
}
</script>

<style lang="less" scoped>
</style>