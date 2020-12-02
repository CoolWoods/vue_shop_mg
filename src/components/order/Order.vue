<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number">
        </el-table-column>
        <el-table-column label="订单价格" prop="order_price"> </el-table-column>
        <el-table-column label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status == '1'"
              >已付款
            </el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="100px">
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框区域 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流进度对话框区域 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false"
          >确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      orderList: [],
      // 订单总数
      total: 0,
      addressDialogVisible: false,
      // 修改地址表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单校验规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县！', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址！', trigger: 'blur' }
        ]
      },
      // 城市信息
      cityData,
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 分页大小change事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 分页当前页change事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址对话框
    showBox () {
      this.addressDialogVisible = true
    },
    // 监听修改地址对话框关闭事件
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示物流进度对话框
    async showProgressBox () {
      // 快递100接口发生变化，因此不做api请求，仅做页面渲染
      var kuaidi = { message: 'ok', nu: '4310583080076', ischeck: '0', condition: '00', com: 'yunda', status: '200', state: '0', data: [{ time: '2020-12-01 09:18:52', ftime: '2020-12-01 09:18:52', context: '【广州市】已离开 广东广州分拨中心；发往 广西桂林公司', location: '' }, { time: '2020-12-01 09:15:29', ftime: '2020-12-01 09:15:29', context: '【广州市】已到达 广东广州分拨中心', location: '' }, { time: '2020-12-01 04:27:41', ftime: '2020-12-01 04:27:41', context: '【佛山市】已离开 广东佛山分拨中心；发往 广东广州分拨中心', location: '' }, { time: '2020-12-01 04:21:05', ftime: '2020-12-01 04:21:05', context: '【佛山市】已到达 广东佛山分拨中心', location: '' }, { time: '2020-11-30 21:27:07', ftime: '2020-11-30 21:27:07', context: '【佛山市】已离开 广东佛山公司；发往 广西桂林公司', location: '' }, { time: '2020-11-30 21:02:37', ftime: '2020-11-30 21:02:37', context: '【佛山市】广东佛山公司-韦立销(13242761814) 已揽收', location: '' }] }
      this.progressInfo = kuaidi.data
      console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
