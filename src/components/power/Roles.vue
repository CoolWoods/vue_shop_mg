<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightsById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二和三级权限 -->
              <el-col :span="19">
                <!-- 循环二级权限 -->
                <el-row
                  :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightsById(scope.row, item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.key"
                      type="warning"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- pre通常用于显示代码块 <pre
              >{{ scope.row }}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加角色表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 添加角色底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 编辑角色表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 编辑角色底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话配 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <!-- 分配权限树形控件 -->
      <el-tree
        :data="rightsTree"
        :props="rightsTreeProps"
        ref="treeRef"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 控制添加角色列表的显示与隐藏
      addDialogVisible: false,
      // 控制修改角色列表的显示与隐藏
      editDialogVisible: false,
      // 控制分配权限列表的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限树形数据
      rightsTree: [],
      // 添加角色表单数据
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      // rightsTree中默认选中节点的id数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色表单数据
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单校验规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 编辑角色表单校验规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rolesList = res.data
    },
    // 根据id删除角色权限
    async removeRightsById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 重新获取权限，会发生整个表格的渲染
      // this.getRolesList()
      // 通过返回的最新角色信息直接给role不会刷新整个表格
      // role也是双向绑定
      role.children = res.data
    },
    // 添加角色
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getRolesList()
        this.addDialogVisible = false
      })
    },
    // 通过ID删除角色
    async removeRoleById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      // 取消删除返回消息提示
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除！')
      }
      // 确认删除调用api接口进行删除
      const { data: res } = await this.$http.delete('roles/' + id)
      // 调用接口删除失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 调用接口删除成功
      this.$message.success(res.meta.msg)
      // 刷新当前角色列表
      this.getRolesList()
    },
    // 展示修改角色对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改角色预校验
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })

        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getRolesList()
        this.editDialogVisible = false
      })
    },
    // 监听添加用户对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 监听编辑用户对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    setRightsDialogClosed () {
      this.defKeys = []
    },
    // 展示分配权限对话框
    async showSetRightDialog (role) {
      const { data: res } = await this.$http.get('rights/tree')
      this.getLeafKeys(role, this.defKeys)
      console.log(res)
      // 获取所有权限数据
      this.rightsTree = res.data
      // 保存当前分配权限角色的id
      this.roleId = role.id
      this.setRightDialogVisible = true
    },
    // 点击为角色分配权限
    async allotRights () {
      // ...为展开运算符
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      console.log(idStr + this.roleId)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 通过递归的方式获取角色下的三级权限的id
    getLeafKeys (node, arr) {
      // 如果当节点不包含children则是叶子节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归调用
      node.children.forEach(element => {
        this.getLeafKeys(element, arr)
      })
    }
  }
}
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
</style>
