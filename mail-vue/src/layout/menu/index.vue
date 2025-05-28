<template>
  <el-menu
    :default-active="route.path"
    class="el-menu-vertical"
    :collapse="!uiStore.asideShow"
    router
  >
    <el-menu-item index="/email">
      <Icon icon="carbon:email" />
      <template #title>收件箱</template>
    </el-menu-item>
    <el-menu-item index="/setting">
      <Icon icon="carbon:settings" />
      <template #title>个人设置</template>
    </el-menu-item>
    <el-menu-item index="/sys-setting">
      <Icon icon="carbon:settings-services" />
      <template #title>系统设置</template>
    </el-menu-item>
    <el-menu-item v-if="userStore.user.type === 0" index="/user-manage">
      <Icon icon="carbon:user-multiple" />
      <template #title>用户管理</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useUiStore } from '@/store/ui';
import { useUserStore } from '@/store/user';

const route = useRoute();
const uiStore = useUiStore();
const userStore = useUserStore();
</script> 