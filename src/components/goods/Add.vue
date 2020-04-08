<template>
  <div class="add-goods">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <!-- 警告区⚠️ -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false" />
      <!-- 步骤条区域 active当前激活高亮的step-->
      <!-- 隐式转换 activeIndex是个字符，-0 就变成数字，也可以直接+activeIndex转换，parseInt(activeIndex)也可 -->
      <el-steps :space="200" align-center :active="activeIndex-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 左边tab栏区域 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 如果不选择第三级点，点不到下一个tab -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 第一个tab -->
          <el-tab-pane label="基本信息" name="0">
            基本信息
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name" />
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number" />
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number" />
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number" />
            </el-form-item>
            <!-- cascader checkStrictly:是否严格的遵守父子节点不互相关联 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name', children:'children'}"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 第二个tab -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="title" border v-for="(title, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.id">
              <el-input v-model="item.attr_vals" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!-- action: 表示图片要上传到后台api地址 
            :headers 上传没有用axios属性发起
            list-type:预览图片还是文字的列表样式
            handleSuccess：成功上传后的钩子-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>

            <!-- 最后一个tag，富文本框 -->
          <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addGoodsForm.goods_introduce"/>
                        <el-button class="addBtn" type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

            <!-- 图片预览图 -->
        <el-dialog
                title="图片预览"
                width="50%"
                :visible.sync="imgVisible">
            <img class="previewImg" :src="previewPath" alt="图片预览">
        </el-dialog>
  </div>
</template>

<script>

  import _ from 'lodash';

export default {

  data() {
    return {
      activeIndex: "0",
      addGoodsRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //添加的时候貌似数量和价格写0，就不能添加
      addGoodsForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 上传多张图片数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // api文档里要求有这个参数存放上传的信息，每个信息是一个对象
        attrs:[]
      },
      // 商品分类列表
      cateList: [],
      // 动态参数列表数组
      manyTableData: [],
      // 静态属性列表数组
      onlyTableData: [],
      // 图片上传的url地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传的header请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      //预览alert dialog显示
      imgVisible: false,
      previewPath: '',
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      // 获取所有商品分类数据
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取分类数据失败");
      this.cateList = res.data;
      //   console.log(this.cateList);
    },
    // 级联选择器选中项☑️变化，触发函数
    handleChange() {
      // 必须选择三级节点
      // console.log(this.addGoodsForm.goods_cat)
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = [];
      }
    },
    //如果不选择第三级点，点不到下一个tab
    beforeTabLeave(newTab, oldTab) {
      //只能打印出页码，不能跳转
      // 这个返回值是element api查的
      // console.log(newTab);
      // console.log(oldTab);
      // return false
      this.$message.closeAll(); //免得一直弹窗很多
      if (oldTab === "0" && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
      //在第一页并且选了一个三级商品才跳转
    },
    //单击面板tab跳转到另一个面板触发⌚️
    async tabClicked() {
      // console.log(this.activeIndex)
      // 访问的是动态参数面板
      if (this.activeIndex === "1") {
        //拿到三级分类的id，
        // this.$http.get(`categories/${this.addGoodsForm.goods_cat[2]}/
        // attributes`)
        // computed => 拿到id
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        console.log(res.data);
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败！");
        }
        //"把字符串用逗号分割后组成字符串，并判断是否为空"
        // res.data.forEach(item => {
        //     if (item.attr_vals !== '') {
        //         item.attr_vals = item.attr_vals.split(' ');
        //     } else {
        //         item.attr_vals = [];
        //     }
        // });
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
        //静态属性
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        console.log(res.data);
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败！");
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
        // console.log(file);
        //预览图片地址先通过打印file找到
        this.previewPath = file.response.data.url;
        this.imgVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      console.log(file);
      const filePath = file.response.data.tmp_path;
      //通过查看有一个pic【】里面的路径找到那个图片的索引
      // findIndex
      const i = this.addGoodsForm.pics.findIndex(item => {
        item.pic === filePath;
      });
      //通过索引删除那一项
      this.addGoodsForm.pics.splice(i, 1);
      console.log(this.addGoodsForm); //发现那一项就被删除了
    },
    //成功上传后的钩子,官网上有三个参数，这里传一个就OK了
    handleSuccess(response) {
      // console.log(response)
      //pic是后段api要求字段，data.tem_path是打印data里面可以看到
      const picInfo = { pic: response.data.tmp_path };
      //讲图片信息对象，push 到pics数组中
      this.addGoodsForm.pics.push(picInfo);
      console.log(this.addGoodsForm);
    },
    addGoods() {
        this.$refs.addFormRef.validate(async valid => {
            if (!valid) return this.$message.error('请填写必要表单信息');

                this.manyTableData.forEach(item => {
                    const manyObj = {
                        attr_id: item.attr_id,
                        // 动态的是数组所以要join
                        attr_value: item.attr_vals.join(' ')
                    };
                    this.addGoodsForm.attrs.push(manyObj);
                });

                this.onlyTableData.forEach(item => {
                    const onlyObj = {
                        attr_id: item.attr_id,
                        // 静态本身就是字符串
                        attr_value: item.attr_vals
                    };
                    this.addGoodsForm.attrs.push(onlyObj);
                });

            // join 【】=》string数组[1,2,3]变字符串'1,2,3'  
            // 下面不行，因为cascader要数组，不要字符串就出现了矛盾
            // this.addGoodsForm.goods_cat = 
            // this.addGoodsForm.goods_cat.join(',');
            // 解决办法：1。深拷贝(复制一份,常用方法a.递归 b.JSON.stringify)
            // 下载一个包loadsh 用里面的cloneDeep(obj)

            //这种方法也可以！并且不用添加lodash依赖，也可以先得到数组，在join成字符串
            // var form = JSON.parse(JSON.stringify(this.addGoodsForm));  
//             goods_cat: Array(3)
//                 0: 1
//                 1: 3
//                 2: 6
// l            ength: 3
            //深拷贝方法也可以
            const form = _.cloneDeep(this.addGoodsForm);


            form.goods_cat = form.goods_cat.join(',');
            console.log(form);// "1,3,6"
                                // 发送请求
            const {data: res} = await this.$http.post(`goods`, form);
            if (res.meta.status !== 201) return this.$message.error('添加商品失败');
            this.$message.success(res.meta.msg);
            this.$router.push('/goods');
        })








    }
  },
  computed: {
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  // 不加important权重不够
  margin: 0 10px 0 0 !important;
}
//预览图片占满整个alert dialog
.previewImg {
    width: 100%;
}
.addBtn {
    margin-top: 15px;
}
</style>