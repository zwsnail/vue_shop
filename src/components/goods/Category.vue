<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

      <!-- 表格区 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- slot="isok" slot-scope="scope"还可以写出 :v-slot:isok="scope" #default="scope"  -->
        <template v-slot:isok="scope">
          <i v-if="!scope.row.cat_deleted" style="color: lightgreen;" class="el-icon-success"></i>
          <i v-else class="el-icon-error" style="color: red;"></i>
        </template>

        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <template slot="operation" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditCate(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="showDelCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 对话框 -->
    <!-- 点击【添加分类】对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 点击【添加分类】点击后的那个表单 -->
      <el-form :model="addCateForm" ref="addCateFormRef" :rules="rules" label-width="100px">
        <el-form-item prop="cat_name" label="分类名称:">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- cascader 层级选择器 
          checkStrictly: 可以选择二级菜单-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            @change="parentCateChanged"
            :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name', children:'children', checkStrictly:true}"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialog" width="50%" @close="editCateClosed">
      <el-form :model="editCateForm" ref="editCateRef" :rules="rules" label-width="100px">
        <el-form-item prop="cat_name" label="分类名称:">
          <el-input v-model="editCateForm.cat_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      //query parameter
      querInfo: {
        type: 3, // total three dimentional goods
        pagenum: 1,
        pagesize: 5 // per page 5
      },
      //total goods
      total: 0,
      //tree-table
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template", //作用域插槽
          template: "isok" //作用域插槽名称
        },
        {
          label: "排序",
          type: "template",
          template: "sort"
        },
        {
          label: "操作",
          type: "template",
          template: "operation"
        }
      ],
      // 点击【添加分类】弹出来的饿对话框
      addCateDialogVisible: false,
      // 添加的内容
      addCateForm: {
        cat_name: "",
        cat_pid: 0, // 父级分类id默认为一级
        cat_level: 0 // 分类等级
      },
      rules: {
        cat_name: [
          { required: true, message: "分类名称不能为空", trigger: "blur" }
        ]
      },
      //父级分页列表
      parentCateList: [],
      //选中的父级id分类数组
      selectedKeys: [],
                        // 修改
      editCateDialog: false,
      editCateForm: {},
      rules: {}

    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      //   console.log(res.data);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    //pagination
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    //click【添加分类】open the dialog
    showAddCateDialog() {
      //first get the parent cate list
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //监听对话框关闭，重置表单数据
    addCateDialogClosed() {
      this.selectedKeys = []; //v-model
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
      this.$refs.addCateFormRef.resetFields();
    },
    //请求接口，获得父级分类列表, 只需要第二，三级
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表失败！");
      }
      this.parentCateList = res.data;
    },
    //cascader 层级选择器发生变换
    parentCateChanged() {
      // console.log(this.selectedKeys)
      //如果下拉级联列表什么都没选，那这个selectedKeys就该为空
      //一旦大于0证明要么选了二级/三级，不管选哪级反正id选最后面那个，就是长度-1，而刚好发现选了的level，就是选的数组长度(比如选了「1，2」第一级id为1，第二级id为2)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        //当前添加这个商品的等级
        this.addCateForm.cat_level = this.selectedKeys.length;
        return; //触发函数
      } else {
        //就取了名字，什么都没选直接为一级
        this.addCateForm.cat_level = 0;
        //没有任何父级分类
        this.addCateForm.cat_pid = 0;
      }
    },
    //点击【确定】添加新分类
    addCate() {
      // console.log(this.addCateForm)
      //用rule去validate
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加商品分类失败!");
        }
        // console.log(res)
        this.$message.success(res.meta.msg);
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    //点击【编辑】弹出编辑对话框
    async showEditCate(id) {
        const {data: res} = await this.$http.get(`categories/${id}`);
        if (res.meta.status !== 200) return this.$message.error('查询分类信息失败');
        this.editCateForm = res.data;
        this.editCateDialog = true;
    },
    
    editCate() {
        this.$refs.editCateRef.validate(async valid => {
            if (!valid) return;
            const {data: res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {cat_name : this.editCateForm.cat_name});
            if (res.meta.status !== 200) return this.$message.error('修改分类信息失败');
            this.getCateList();
            this.editCateDialog = false;
            this.$message.success(res.meta.msg);
        })
    },
            // 编辑对话框关闭
            editCateClosed() {
                this.$refs.editCateRef.resetFields();
            },
            async showDelCate(id) {
                const result = await this.$confirm('此操作会永久删除该分类，是否继续?','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if (result !== 'confirm') return this.$message.info('取消操作')
                const {data: res} = await this.$http.delete(`categories/${id}`);
                if (res.meta.status !== 200) return this.$message.error('删除分类失败');
                // this.querInfo.pagenum = 1;
                this.getCateList();
                this.$message.success(res.meta.msg);
            },


  }
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>

