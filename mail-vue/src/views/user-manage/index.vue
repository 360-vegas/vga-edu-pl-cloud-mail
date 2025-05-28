<template>
  <div class="user-manage">
    <div class="header">
      <el-input
        v-model="searchEmail"
        placeholder="搜索邮箱"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <Icon icon="carbon:search" />
          </el-button>
        </template>
      </el-input>
    </div>

    <el-table :data="userList" style="width: 100%" v-loading="loading">
      <el-table-column prop="userId" label="ID" width="80" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          {{ row.type === 0 ? '管理员' : '普通用户' }}
        </template>
      </el-table-column>
      <el-table-column prop="disabled" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.disabled ? 'danger' : 'success'">
            {{ row.disabled ? '已禁用' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" @click="handleEdit(row)" :disabled="row.type === 0">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="row.type === 0"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editForm.type">
            <el-option label="普通用户" :value="1" />
            <el-option label="管理员" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editForm.disabled"
            :active-value="1"
            :inactive-value="0"
            active-text="禁用"
            inactive-text="正常"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listUsers, updateUser, deleteUser } from '@/request/user.js';

const loading = ref(false);
const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchEmail = ref('');
const dialogVisible = ref(false);
const editForm = ref({
  userId: null,
  email: '',
  type: 1,
  disabled: 0
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await listUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      email: searchEmail.value
    });
    userList.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  loadData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadData();
};

const handleEdit = (row) => {
  editForm.value = { ...row };
  dialogVisible.value = true;
};

const handleSave = async () => {
  try {
    await updateUser(editForm.value.userId, {
      email: editForm.value.email,
      type: editForm.value.type,
      disabled: editForm.value.disabled
    });
    ElMessage.success('更新成功');
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    ElMessage.error(error.message || '更新失败');
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteUser(row.userId);
      ElMessage.success('删除成功');
      loadData();
    } catch (error) {
      ElMessage.error(error.message || '删除失败');
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.user-manage {
  padding: 20px;

  .header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .search-input {
      width: 300px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 