<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable placeholder="请输入内容" v-model="queryInfo.query" @clear="getGoodsList()">
                                        <!-- 当不在第一页的时候不能搜索🔍，可以先强制跳到第一页在获取列表 -->
            <el-button slot="append" icon="el-icon-search" @click="handleCurrentChange(1)"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
        <!-- table商品表格区域   -->
            <el-table :data="goodsList" border stripe>
                <el-table-column label="#" type="index"/>
                <el-table-column label="商品名称" prop="goods_name"/>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"/>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"/>
                <el-table-column label="创建时间" prop="add_time" width="140px">
                    <template v-slot="scope" >
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editGoods(scope.row.goods_id)"/>
                        <el-button type="danger" size="mini"  icon="el-icon-delete" @click="delGoods(scope.row.goods_id)"/>
                    </template>
                </el-table-column>
            </el-table>

        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
        </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      goodsList: []
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }
      console.log(res);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },

    handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getGoodsList();
    },
    handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getGoodsList();
    },
    goAddGoods() {
        // 如果前面用 this.$router.path来获取当前路径
        //下面这种写法会导致左侧边栏不高亮
        // this.$router.push('/goods/add');
        // this.$route.path 当时没跟着做，而用了这个;

        
        this.$router.push({path:'/goods/add'})

    },
    async delGoods(id) {
        const result = await this.$confirm('此操作将永久删除该商品,是否继续?', '提示', {
            type: 'warning'
        }).catch(err => err);
        if (result !== 'confirm') return this.$message.info('取消操作');
        const {data: res} = await this.$http.delete(`goods/${id}`);
        if (res.meta.status !== 200) return this.$message.error('删除商品失败');
        this.getGoodsList();
        this.$message.success(res.meta.msg);
    },
    editGoods(id) {
        this.$router.push(`/goods/edit/${id}`);
    }





  }
};
</script>