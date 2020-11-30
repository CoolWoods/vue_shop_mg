<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片式区域 -->
    <el-card class="box-card">
      <!-- 警告消息 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      ></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类级联选择框 -->
          <!-- options表示数据源 -->
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="cateChanged"
            clearable
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tabs页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            :disabled="isBtnDisable"
            size="mini"
            type="primary"
            @click="addDialogVisible = true"
            >添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <!--  @keyup.enter.native="$event.target.blur" 回车时调用blur时触发的事件，避免两次调用同一事件 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  :disabled="isBtnDisable"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑
                </el-button>
                <el-button
                  :disabled="isBtnDisable"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button
            :disabled="isBtnDisable"
            size="mini"
            type="primary"
            @click="addDialogVisible = true"
            >添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <!--  @keyup.enter.native="$event.target.blur" 回车时调用blur时触发的事件，避免两次调用同一事件 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  :disabled="isBtnDisable"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑
                </el-button>
                <el-button
                  :disabled="isBtnDisable"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titelTest"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClosed"
    >
      <!-- 添加参数表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titelTest" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titelTest"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed"
    >
      <!-- 添加参数表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titelTest" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加参数/属性对话框
      addDialogVisible: false,
      // 添加参数的表单数据
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改表单数据对象
      editForm: {
        attr_name: ''
      },
      // 修改表单校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.cateList = res.data
    },
    // 级联选择change事件
    cateChanged () {
      this.getParamsList()
    },
    // 监听面板切换事件
    handleTabClick () {
      this.getParamsList()
    },
    async getParamsList () {
      const length = this.selectedCateKeys.length
      if (length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据当前所选的id和所处的面板查询参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      console.log(res.data)
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        // 控制按钮与文本框的显示
        element.inputVisible = false
        // 文本框中的内容
        element.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 添加对话框关闭时的监听事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击编辑按钮展示编辑对话框
    // 查询当前参数信息
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 点击按钮修改参数信息
    async editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName })

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 修改对话框关闭时的监听事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据Id删除参数
    async removeParams (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除！')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsList()
    },
    // 文本框失去焦点或者按下enter键都会触发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 没有return则输入了内容，调用api添加
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      this.saveAttributes(row)
    },
    // 点击按钮展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // this.$nextTick当页面上元素被重新渲染之后才会调用回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应参数可选项
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttributes(row)
    },
    // 调用api保存attr_vals操作
    async saveAttributes (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    }
  },
  computed: {
    // 如果按钮补禁用返回true
    isBtnDisable () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titelTest () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag + .el-tag {
  margin-left: 10px;
  margin-bottom: 10px;
}
.input-new-tag {
  width: 120px;
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
