<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { CirclePlusFilled, DeleteFilled, EditPen, Plus } from '@element-plus/icons-vue'
import { Frps, Frpc } from 'FrpManager'
import useFrpStore from '@/stores/useFrpStore.ts'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import { zodValidate } from '@/utils/zodValidate.ts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addFrpcApi, deleteFrpcApi } from '@/invoke-apis/frpc.ts'
import { simpleClone } from '@/utils/simpleClone.ts'
import { log_debug, log_error, log_info, log_warn } from '@/invoke-apis/file-log.ts'

const { height: windowHeight } = useWindowSize()
const tableHeight = computed(() => windowHeight.value - 82)
const currentTab = ref('frpc')

const frpStore = useFrpStore()
const { frpcList, frpsList } = storeToRefs(frpStore)

const frpcEditDialogVisible = ref(false)
const frpcEditDialogTitle = ref<'编辑' | '新增'>('新增')
const frpcEditData = ref(getDefaultEditFrpcData())

function getDefaultEditFrpcData() {
  return {
    id: '',
    name: '',
    followAppStart: false,
    binaryFile: '',
    startUpArgs: '',
  } as Frpc
}

function addFrpc() {
  frpcEditDialogTitle.value = '新增'
  frpcEditData.value = getDefaultEditFrpcData()
  frpcEditDialogVisible.value = true
}

function saveFrpc() {
  const validate = z.object({
    id: z.string().regex(new RegExp('^[a-zA-Z0-9-_.]+$'), { error: 'ID 只能包含字母、数字、下划线、中划线、点号！' }),
    name: z.string().trim().nonempty({ error: '名称不能为空！' }),
    binaryFile: z.string().trim(),
    startUpArgs: z.string().trim(),
    followAppStart: z.boolean(),
  })
  const { valid, message, data } = zodValidate(() => validate.parse(frpcEditData.value))
  if (!valid) {
    ElMessage.warning(message)
    return
  }

  Promise.resolve()
    .then(() => {
      // 新增
      if (frpcEditDialogTitle.value === '新增') {
        return addFrpcApi({ id: data.id }).then(() => {
          frpcList.value.push(data)
        })
      }

      // 编辑
      frpcList.value = frpcList.value.map((item) => {
        if (item.id !== data.id) return item
        return simpleClone(data)
      })
    })
    .then(() => frpStore.save())
    .then(() => {
      ElMessage.success('操作成功！')
      frpStore.refresh()
      frpcEditDialogVisible.value = false
    })
    .catch((e) => {
      ElMessage.error(`${e?.message || e}`)
      throw e
    })
}

async function deleteFrpc(frpc: Frpc) {
  const confirm = await ElMessageBox.confirm(`确认删除【${frpc.name}】吗？`, '删除', {
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (!confirm) return

  deleteFrpcApi({ id: frpc.id })
    .then(() => {
      frpcList.value = frpcList.value.filter((item) => item.id !== frpc.id)
      return frpStore.save()
    })
    .then(() => {
      ElMessage.success('删除成功！')
      frpStore.refresh()
    })
    .catch((e) => {
      ElMessage.error(`${e?.message || e}`)
    })
}

function editFrpc(frpc: Frpc) {
  frpcEditData.value = simpleClone(frpc)
  frpcEditDialogTitle.value = '编辑'
  frpcEditDialogVisible.value = true
}

function addFrps() {}

function deleteFrps(frps: Frps) {}

function editFrps(frps: Frps) {}
</script>

<template>
  <div class="home-page">
    <el-tabs v-model="currentTab" type="border-card" class="hide-tab-content-padding">
      <!--frpc-->
      <el-tab-pane label="frpc" name="frpc">
        <div class="flex flex-col child-mt-5">
          <div class="flex flex-row child-ml-10 mt-1 ml-1">
            <el-button type="primary" :icon="CirclePlusFilled" @click="addFrpc()">添加</el-button>
          </div>

          <el-table :data="frpcList" border :height="tableHeight">
            <el-table-column type="index" width="50" align="center"></el-table-column>
            <el-table-column width="100" align="center" label="ID" prop="id" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" label="名称" prop="name"></el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="100">
              <template #default="{ row }">
                <el-tooltip placement="bottom" effect="light">
                  <template #default>
                    <el-text type="primary" text>操作</el-text>
                  </template>

                  <template #content>
                    <div class="flex flex-col child-mt-10">
                      <div>
                        <el-button type="primary" :icon="EditPen" @click="editFrpc(row)">编辑</el-button>
                      </div>
                      <div>
                        <el-button type="danger" :icon="DeleteFilled" @click="deleteFrpc(row)">删除</el-button>
                      </div>
                    </div>
                  </template>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!--frps-->
      <el-tab-pane label="frps" name="frps">
        <div class="flex flex-col child-mt-5">
          <div class="flex flex-row child-ml-10 mt-1 ml-1">
            <el-button type="primary" :icon="CirclePlusFilled">添加</el-button>
          </div>

          <el-table :data="frpsList" border :height="tableHeight">
            <el-table-column type="index" width="50" align="center"></el-table-column>
            <el-table-column width="100" align="center" label="ID" prop="id" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" label="名称" prop="name"></el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="100">
              <template #default="{ row }">
                <el-tooltip placement="bottom" effect="light">
                  <template #default>
                    <el-text type="primary" text>操作</el-text>
                  </template>

                  <template #content>
                    <div class="flex flex-col child-mt-10">
                      <el-button type="primary" :icon="EditPen" @click="editFrps(row)">编辑</el-button>
                      <el-button type="danger" :icon="DeleteFilled" @click="deleteFrps(row)">删除</el-button>
                    </div>
                  </template>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog :title="frpcEditDialogTitle" v-model="frpcEditDialogVisible">
      <el-descriptions border :column="1">
        <el-descriptions-item label="ID">
          <el-input
            v-model="frpcEditData.id"
            placeholder="字母、数字、下划线、中划线、点号(必填)"
            :disabled="frpcEditDialogTitle === '编辑'"
          ></el-input>
        </el-descriptions-item>
        <el-descriptions-item label="名称">
          <el-input v-model="frpcEditData.name" placeholder="(必填)"></el-input>
        </el-descriptions-item>
        <el-descriptions-item label="二进制文件路径">
          <div class="flex flex-row">
            <el-input v-model="frpcEditData.binaryFile" placeholder="(可选)"></el-input>
            <el-button type="primary">选择</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="启动参数">
          <el-input v-model="frpcEditData.startUpArgs" placeholder="(可选)"></el-input>
        </el-descriptions-item>
        <el-descriptions-item label="跟随应用启动">
          <el-switch
            v-model="frpcEditData.followAppStart"
            active-text="已开启"
            inactive-text="已关闭"
            inline-prompt
          ></el-switch>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="flex flex-row child-ml-5 justify-end">
          <el-button @click="frpcEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFrpc">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  .frpc {
    width: 200px;
    height: 200px;
    border: var(--el-border);
    border-radius: 3px;
    margin: 10px;
    overflow: hidden;
  }
}
</style>
