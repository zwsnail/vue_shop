<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary" @click="addRoleDialog = true">添加角色</el-button>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop': '', 'vcenter']"
              v-for="(one, i1) in scope.row.children"
              :key="one.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row, one.id)" closable>{{one.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 !== 0 ? 'bdtop': '', 'vcenter']"
                  v-for="(two, i2) in one.children"
                  :key="two.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightById(scope.row, two.id)"
                      closable
                    >{{two.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="removeRightById(scope.row, three.id)"
                      closable
                      type="warning"
                      v-for="three in two.children"
                      :key="three.id"
                    >{{three.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              @click="showEditRole(scope.row.id)"
              size="mini"
              icon="el-icon-edit"
            >编辑</el-button>
            <el-button
              type="danger"
              @click="delRole(scope.row.id)"
              size="mini"
              icon="el-icon-delete"
            >删除</el-button>
            <el-button
              type="warning"
              @click="showSetRightDialog(scope.row)"
              size="mini"
              icon="el-icon-setting"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- node-key就是复选框☑️每个的值，default-expand-all直接展开所有节点
      default-checked-keys默认勾选已有的权限-->
      <el-tree
        ref="treeRef"
        :default-checked-keys="defKeys"
        default-expand-all
        node-key="id"
        show-checkbox
        :data="rightsList"
        :props="treeProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialog" width="50%" @close="addRoleClosed">
      <el-form :model="addRoleForm" label-width="80px" :rules="rules" ref="addRoleRef">
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="addRoleForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialog" width="50%" @close="editRoleClosed">
      <el-form :model="editRoleForm" label-width="80px" :rules="rules" ref="editRoleRef">
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="editRoleForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      setRightDialogVisible: false,
      // 获取所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中的id
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",
      // 添加角色对话框
      addRoleDialog: false,
      // 添加角色表单
      addRoleForm: {
        roleName: "",
        roleDesc: ""
      },
      rules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ]
      },
      // 修改角色表单
      editRoleForm: {},
      editRoleDialog: false
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
    },
    /**
     * 根据id删除三级分类
     * @param role number 角色数据
     * @param rightId number 权限id
     */
    async removeRightById(role, rightId) {
      const result = await this.$confirm(
        "此操作会永久删除该权限,是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") return this.$message.info("取消操作");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除权限失败");
      //如果用getRolesList()重新渲染就会关闭这个窗口，下面这种就不会
      role.children = res.data;
      this.$message.success("删除权限成功");
    },
    // 点击分配全选,弹出对话框
    async showSetRightDialog(role) {
      //先拿到所有id，下面分配权限用
    //   this.roleId = role.id;
      console.log(role)
      console.log(this.roleId)
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }
      // 递归
      this.rightsList = res.data;
      this.roleId = role.id;
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defkeys 数组中
    // node-是否为三级节点(无children)，arr-数组来保存
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      //一直调用自己，知道if里面成立跳出
      node.children.forEach(item => this.getLeafKeys(item, arr));
    //   for (let item of node.children) {
    //       this.getLeafKeys(item, arr);
    //   }
    },
    setRightDialogClosed() {
      //不清空会越来越多
      this.defKeys = [];
    },
    //点确定为角色分配权限
    async allotRights() {
      const keys = [
        //展开运算符 两个数组合并成一个数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      //用逗号把所有id拼接成一个id字符串
      const idStr = keys.join(",");

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (res.meta.status !== 200) return this.$message.error("更新权限失败");
      this.getRolesList();
      this.setRightDialogVisible = false;
      this.$message.success(res.meta.msg);
    },

    // 点击确定添加角色
    addRole() {
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post('roles', this.addRoleForm);
        if (res.meta.status !== 201) return this.$message.error("添加角色失败");
        this.getRolesList();
        this.addRoleDialog = false;
        this.$message.success("添加角色成功");
      });
    },
    addRoleClosed() {
      this.$refs.addRoleRef.resetFields();
      this.addRoleForm.roleDesc = "";
    },
    async showEditRole(id) {
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200)
        return this.$message.error("查询角色信息失败");
      this.editRoleForm = res.data;
      this.editRoleDialog = true;
    },
    // 点击确定修改角色信息
    editRole() {
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, 
        {            
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
        });
        if (res.meta.status !== 200)
          return this.$message.error("修改角色信息失败");
        this.editRoleDialog = false;
        this.getRolesList();
        this.$message.success("修改角色信息成功");
      });
    },
    editRoleClosed() {
      this.$refs.editRoleRef.resetFields();
      this.editRoleForm = {};
    },
    // 删除角色
    async delRole(id) {
      const result = await this.$confirm(
        "此操作将永久删除该角色,是否继续?",
        "提示",
        {
          type: "warning"
        }
      ).catch(err => err);
      if (result !== "confirm") return this.$message.info("取消操作");
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除角色失败");
      this.getRolesList();
      this.$message.success("删除角色成功");
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>