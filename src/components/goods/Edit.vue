<template>
    <div class="edit-goods">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert title="编辑商品信息" type="info" center show-icon :closable="false"/>
            <el-steps :space="200" align-center :active="activeIndex-0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <el-form :model="editGoodsForm" label-position="top" :rules="editGoodsRules" ref="editGoodsRef">
                <el-tabs @tab-click="tabClicked" v-model="activeIndex" tab-position="left"
                         :before-leave="beforeTabLeave">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="editGoodsForm.goods_name"/>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="editGoodsForm.goods_price" type="number"/>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="editGoodsForm.goods_weight" type="number"/>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="editGoodsForm.goods_number" type="number"/>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                    v-model="editGoodsForm.goods_cat"
                                    :options="cateList"
                                    :props="cateProps"
                                    @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyList" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="title" border v-for="(title, i) in item.attr_vals" :key="i"></el-checkbox>
                            </el-checkbox-group>ß
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyList" :key="item.id">
                            <el-input v-model="item.attr_vals"/>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action: 表示图片要上传到后台api地址 -->
                        <el-upload
                                :action="uploadURL"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                :headers="headerObj"
                                :on-success="handleSuccess"
                                list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="editGoodsForm.goods_introduce"/>
                        <el-button class="addBtn" type="primary" @click="editGoods">编辑商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览图 -->
        <el-dialog
                title="图片预览"
                width="50%"
                :visible.sync="imgDiaLog">
            <img class="previewImg" :src="showImgURL" alt="图片预览">
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                activeIndex: '0',
                editGoodsForm: {},
                editGoodsRules: {},
                cateProps: {
                    expandTrigger: 'hover',
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                cateList: [],
                manyList: [],
                onlyList: [],
                uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                imgDiaLog: false,
                showImgURL: '',
                pics: [],
                attrs: [],



            }
        },
        created() {
            this.getGoods();
            this.getCateList();
        },
        methods: {
            async getGoods() {
                const {data: res} = await this.$http.get(`goods/${this.$route.params.id}`);
                if (res.meta.status !== 200) return this.$message.error('获取商品信息失败');
                this.editGoodsForm = res.data;
                this.editGoodsForm.goods_cat = this.editGoodsForm.goods_cat.split(',');
                // map()方法可以转换数组元素中的类型
                this.editGoodsForm.goods_cat = this.editGoodsForm.goods_cat.map(Number);
            },
            async getCateList() {
                const {data: res} = await this.$http.get('categories');
                if (res.meta.status !== 200) return this.$message.error('获取分类数据失败');
                this.cateList = res.data;
            },
            tabClicked() {
                if (this.activeIndex === '1') {
                    this.getParamsList('many');
                } else if (this.activeIndex === '2') {
                    this.getParamsList('only');
                }
            },
            async getParamsList(type) {
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: type
                    }
                });
                if (res.meta.status !== 200) return this.$message.error('获取参数列表失败');
                if (type === 'many') {
                    res.data.forEach(item => {
                        if (item.attr_vals !== '') {
                            item.attr_vals = item.attr_vals.split(' ');
                        } else {
                            item.attr_vals = [];
                        }
                    });
                    this.manyList = res.data;
                } else {
                    this.onlyList = res.data;
                }
            },
            handleChange() {
                if (this.editGoodsForm.goods_cat.length !== 3) {
                    this.editGoodsForm.goods_cat = [];
                }
            },
            beforeTabLeave(newTab, oldTab) {
                if (oldTab === '0' && this.editGoodsForm.goods_cat.length !== 3) {
                    this.$message.error('请先选择商品分类');
                    return false;
                }
            },
            handleRemove(file) {
                let filePath = '';
                if (file.response) {
                    filePath = file.response.data.tmp_path;
                } else {
                    filePath = file.url;
                }
                const index = this.pics.findIndex(item => {
                    return item.pic === filePath;
                });
                this.pics.splice(index, 1);
            },
            handleSuccess(response) {
                if (response.meta.status !== 200) return this.$message.error('上传图片失败');
                // 拼接得到一个图片对象信息
                // 将图片对象信息push到pics数组中
                const picInfo = {
                    pic: response.data.tmp_path
                };
                this.pics.push(picInfo);
            },
            handlePreview(file) {
                this.showImgURL = file.url;
                this.imgDiaLog = true;
            },
            async editGoods() {
                this.manyList.forEach(item => {
                    const manyObj = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    };
                    this.attrs.push(manyObj);
                });

                this.onlyList.forEach(item => {
                    const onlyObj = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    };
                    this.attrs.push(onlyObj);
                });
                const obj = {
                    id: this.editGoodsForm.goods_id,
                    goods_name: this.editGoodsForm.goods_name,
                    goods_price: this.editGoodsForm.goods_price,
                    goods_number: this.editGoodsForm.goods_number,
                    goods_weight: this.editGoodsForm.goods_weight,
                    goods_introduce: this.editGoodsForm.goods_introduce,
                    goods_cat: this.editGoodsForm.goods_cat.join(','),
                    pics: this.pics,
                    attrs: this.attrs
                };
                const {data: res} = await this.$http.put(`goods/${obj.id}`, obj);
                if (res.meta.status !== 200) return this.$message.error('编辑商品失败');
                this.$message.success(res.meta.msg);
                this.$router.push('/goods');
                console.log(obj)
            }
        },
        computed: {
            cateId() {
                if (this.editGoodsForm.goods_cat.length === 3) {
                    return this.editGoodsForm.goods_cat[this.editGoodsForm.goods_cat.length - 1];
                }
                return null;
            }
        }
    }
</script>

<style scoped>
    .el-checkbox {
        margin: 0;
    }

    .previewImg {
        width: 100%;
    }

    .addBtn {
        margin-top: 15px;
    }
</style>
