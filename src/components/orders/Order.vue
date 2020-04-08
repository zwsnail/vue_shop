<template>
    <div class="order">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="clearSearch">
                        <el-button slot="append" icon="el-icon-search" @click="searchOrder"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <el-table :data="orderList" border stripe>
                <el-table-column label="#" type="index"/>
                <el-table-column label="订单编号" prop="order_number"/>
                <el-table-column label="订单价格" prop="order_price"/>
                <el-table-column label="是否付款">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"/>
                <el-table-column label="下单时间">
                    <template v-slot="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <el-button type="primary" @click="addressVisible = true" size="mini" icon="el-icon-edit"></el-button>
                        <el-button type="success" @click="showProgress" size="mini" icon="el-icon-location"></el-button>
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
                    :total="total">
            </el-pagination>
            
        </el-card>

                    <!-- 修改地址对话框 -->
        <el-dialog
                title="修改地址"
                :visible.sync="addressVisible"
                width="50%"
                @close="addressClose">
            <el-form :model="addressForm" ref="addressRef" :rules="addressRules" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                            v-model="addressForm.address1"
                            :options="cityData"
                            :props="{ expandTrigger: 'hover' }"/>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"/>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>
                    <!-- 查看物流进度 -->
        <el-dialog
                title="查看物流进度"
                :visible.sync="progressVisible"
                width="50%">
            <el-timeline :reverse="false">
                <el-timeline-item
                        v-for="(activity, index) in progressInfo"
                        :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
     
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'

export default {
    data() {
        return {
            queryInfo: {
              query: '',
              pagenum: 1,
              pagesize: 10
            },
            orderList: [],
            total: 0,//分页总条数
            addressVisible: false,
            addressForm: {
                address1: [],//cascader
                address2: ''
            },
            addressRules: {
                address1: [
                    {required: true, message: '请选择省市区/县', trigger: 'blur'}
                ],
                address2: [
                    {required: true, message: '请填写详细地址', trigger: 'blur'}
                ]
            },
            cityData: cityData, //可以直接简写成cityData,
            progressVisible: false,
            progressInfo: []
        }
    },
    created() {
        this.getOrderList();
    },
    methods: {
        async getOrderList() {
            const {data : res} = await this.$http.get('orders', {
                params: this.queryInfo
            })
            if(res.meta.status !== 200) return this.$message.error('获取订单列表失败')
            // console.log(res)
            this.total = res.data.total;
            this.orderList = res.data.goods;
            console.log(this.orderList)
        },
        clearSearch() {
            this.getOrderList();
        },
        searchOrder() {
            this.queryInfo.pagenum = 1;
            this.getOrderList();
            console.log(this.queryInfo.query)
        },
   
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
        },
        addressClose() {
            this.$refs.addressRef.resetFields();
        },
        async showProgress() {                    //:id 测试用
            const {data: res} = await this.$http.get(`/kuaidi/1106975712662`);
            if (res.meta.status !== 200) return this.$message.error('获取物流信息失败');
            this.progressInfo = res.data;
            // console.log(this.progressInfo)
            this.progressVisible = true;
        },
    },
    computed: {

    }
}
</script>

<style lang="less" scoped>
    .el-cascader {
        width: 100%;
    }
</style>