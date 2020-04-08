<template>
    <div class="report">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <div ref="main" style="width: 750px;height: 400px;"></div>
        </el-card>
    </div>
</template>

<script>
    import echarts from 'echarts'
    import _ from 'lodash'

    export default {
        name: "Report",
        data() {
            return {
                // 需要合并的数据
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                }
            }
        },
        created() {

        },
        //dom渲染完了，再加载这里
        async mounted() {
            // id = "main"
            // var myChart = echarts.init(document.getElementById('main'))
            let myChart = echarts.init(this.$refs.main);

            // 获取折线图数据
            const {data: res} = await this.$http.get('reports/type/1');
            if (res.meta.status !== 200) return this.$message.error('获取折线图失败');

            // 4.准备数据的配置项
            // 合并两个对象
            // (data那个直接就是api后台拿到的粘贴到这里)
            const result = _.merge(res.data, this.options);

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(result);
        },
        methods: {}
    }
</script>

<style lang="less" scoped>

</style>
