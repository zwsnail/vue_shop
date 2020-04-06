<template>
  <div class="params">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon />
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name', children:'children'}"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮🔘 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border strpe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(scope.row, i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 🔘tag -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="delParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的按钮🔘 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border strpe>
            <!-- 展开行 i-index， @close="handleClose(tag, scope.row, i)"-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(scope.row, i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 🔘tag -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="delParam(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改参数的对话框 -->
      <el-form :model="editForm" label-width="80px" ref="editFormRef" :rules="rules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParames">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的表格 -->
      <el-form :model="addForm" label-width="80px" ref="addFormRef" :rules="rules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParames">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      // 级联选择器选中的值
      selectedKeys: [],
      //被激活的页签的名称
      activeName: "many",
      //静态，动态参数 列表
      manyTableData: [],
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加的表单数据对象
      addForm: {
        attr_name: ""
      },
      rules: {
        attr_name: [{ required: true, message: "请输入名称", trigger: "blur" }]
      },
      editDialogVisible: false,
      editForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    //级联选择器选中项变换，触发这个函数
    handleChange() {
      this.getParamsData();
    },
    // tab标签页的点击事件
    handleTabClick() {
      // console.log(this.activeName)
      this.getParamsData();
    },
    //不管是下拉选中☑️还是切换面板，都要调用
    async getParamsData() {
      //必须选到第三节点，新版本像我这个其实可以不处理这里了
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        //防止比如选到二级菜单这种不能选的，下面的table还显示
        this.manyTableData = [];
        this.onlyTableData = []

        return;
      }
      //选中之后用computed属性获得id，传参sel
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }
      //用空格分割展开属性，如果为空，没有标签，就不写
      // 弹幕另外解决方法 (item.attr_vals || '').spilit('')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //自己添加一个属性到scope.row里面
        // 控制文本框的显示与隐藏
        item.inputVisible = false;
        //文本框中输入的内容
        item.inputValue = "";
      });

      console.log(res);
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      this.$message.success(res.meta.msg);
    },
    //正常关闭对话框重置
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //添加确定
    async addParames() {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return "添加失败！";
      });
      const { data: res } = await this.$http.post(
        `categories/${this.cateId}/attributes`,
        {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName //many or only
        }
      );
      if (res.meta.status !== 201) {
        return this.$message.error("添加参数失败");
      }
      this.$message.success(res.meta.msg);
      this.addDialogVisible = false;
      this.getParamsData();
    },

    async showEditDialog(attr_id) {
      //查询当前参数的信息,但弹幕说scope.row其实就拿到了
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) return this.$message.error("修改参数失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮🔘，保存修改参数信息
    editParames() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/
        ${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );

        if (res.meta.status !== 200) return this.$message.error("修改参数失败");
        this.editDialogVisible = false;
        this.getParamsData();
        this.$message.success("修改参数成功");
      });
    },
    async delParam(attrId) {
      const result = await this.$confirm(
        "此操作将永久删除该参数，是否继续?",
        "提示",
        {
          type: "warning"
        }
      ).catch(err => err);

      if (result !== "confirm") return this.$message.info("取消操作");
      const { data: res } = await this.$http.delete(`categories/
      ${this.cateId}/attributes/${attrId}`);
      if (res.meta.status !== 200) return this.$message.error("删除分类失败");
      this.getParamsData();
      this.$message.success("删除分类成功");
    },
    //tag里面按下 Enter 或者 失去焦点触发
    async handleInputConfirm(row) {
      //如果只输入了空格，就无效
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false;
        row.inputValue = '';
        return;
      }
      // 把新添加的tag添加到之前的数组里，并且trim下
      row.attr_vals.push(row.inputValue.trim());
      row.inputVisible = false;
      row.inputValue = ''; //重置

      this.saveAttrVals(row);

    },
    //数据库请求
    async saveAttrVals(row) {
      const obj = {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        // 数组变字符串
        attr_vals: row.attr_vals.join(' ')
      };
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        obj
      );
      if (res.meta.status !== 200)
        return this.$message.error("添加参数标签失败");
      this.$message.success(res.meta.msg);
    },
    //
    showInput(row) {
      row.inputVisible = true; //这时页面还是button按钮不是文本框，要用下面才能变

      // 让文本框自动获得焦点
      // $nextTick方法的作用, 就是当页面上元素被重新渲染之后才会执行回调函数中的代码
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //tag删除之后发送到数据库
    handleClose(row, i) {
        row.attr_vals.splice(i, 1);
        this.saveAttrVals(row);
    }
  },
  computed: {
    isBtnDisabled() {
      //   if(this.selectedKeys.length !==3) return true
      //   else return false
      // 直接返回true 还是 false
      return this.selectedKeys.length !== 3;
    },
    //当前选中的三级分类的id
    cateId() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    //动态显示添加【静态or动态】对话框
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
//  expand下面的tag
.el-tag {
  margin: 5px;
}
//tag变成input后的样式
.input-new-tag {
  width: 90px;
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>