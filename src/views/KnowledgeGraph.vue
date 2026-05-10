<template>
  <div class="kg-page">
    <div class="kg-container">
      <!-- 顶部搜索栏 -->
      <header class="kg-header ui-card">
        <router-link to="/ai-chat" class="kg-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </router-link>
        <div class="kg-search-wrapper">
          <svg class="kg-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchKeyword"
            type="text"
            class="kg-search-input"
            placeholder="搜索球员、球队、比赛、赛事..."
            @input="onSearchInput"
            @keydown.enter="onSearchEnter"
            @focus="showSearchResults = searchResults.length > 0"
          />
          <!-- 搜索结果下拉 -->
          <div v-if="showSearchResults && searchResults.length > 0" class="kg-search-dropdown">
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="kg-search-item"
              @mousedown.prevent="selectSearchItem(item)"
            >
              <span class="kg-search-item-icon" :style="{ background: typeColor(item.type) }"></span>
              <div class="kg-search-item-info">
                <span class="kg-search-item-name">{{ item.name }}</span>
                <span class="kg-search-item-type">{{ typeLabel(item.type) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="kg-header-actions">
          <button class="kg-action-btn kg-action-primary" @click="openCreateEntity" title="创建实体">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>创建实体</span>
          </button>
          <button class="kg-action-btn" @click="openPathDialog" title="查找最短路径">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>路径</span>
          </button>
          <button class="kg-action-btn" @click="resetView" title="重置视图">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- 主体区域 -->
      <div class="kg-main">
        <!-- 图谱画布 -->
        <div class="kg-canvas-wrapper">
          <div v-if="loading" class="kg-loading">
            <div class="spinner spinner-lg"></div>
            <span>查询图谱中...</span>
          </div>
          <div v-else-if="!graphData" class="kg-empty">
            <div class="kg-empty-icon">
              <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3>排球知识图谱</h3>
            <p>搜索球员或球队名称，探索排球世界的关联关系</p>
            <div class="kg-quick-links">
              <button @click="searchAndLoad('朱婷')">🏐 朱婷</button>
              <button @click="searchAndLoad('中国女排')">🇨🇳 中国女排</button>
              <button @click="searchAndLoad('巴西女排')">🇧🇷 巴西女排</button>
            </div>
          </div>
          <div v-else-if="!graphData.nodes || graphData.nodes.length === 0" class="kg-empty">
            <p>未找到相关图谱数据</p>
            <p class="kg-hint">请尝试搜索其他实体</p>
          </div>
          <div ref="chartContainer" class="kg-chart" v-show="graphData && graphData.nodes && graphData.nodes.length > 0"></div>
        </div>

        <!-- 侧边信息栏 -->
        <aside class="kg-sidebar" v-if="graphData && graphData.nodes && graphData.nodes.length > 0">
          <div class="kg-legend">
            <h4>图例</h4>
            <div class="kg-legend-item"><span class="kg-legend-dot" style="background:#e74c3c"></span>球员</div>
            <div class="kg-legend-item"><span class="kg-legend-dot" style="background:#3498db"></span>球队</div>
            <div class="kg-legend-item"><span class="kg-legend-dot" style="background:#2ecc71"></span>比赛</div>
            <div class="kg-legend-item"><span class="kg-legend-dot" style="background:#f39c12"></span>赛事</div>
          </div>

          <div v-if="selectedNode" class="kg-detail">
            <h4>节点详情</h4>
            <div class="kg-detail-card">
              <div class="kg-detail-type" :style="{ background: typeColor(selectedNode.type) }">{{ typeLabel(selectedNode.type) }}</div>
              <h3 class="kg-detail-name">{{ selectedNode.name }}</h3>
              <p class="kg-detail-desc" v-if="selectedNode.description">{{ selectedNode.description }}</p>
              <div class="kg-detail-props" v-if="selectedNode.properties && Object.keys(selectedNode.properties).length">
                <div class="kg-prop-item" v-for="(value, key) in selectedNode.properties" :key="key">
                  <span class="kg-prop-key">{{ key }}</span>
                  <span class="kg-prop-value">{{ value }}</span>
                </div>
              </div>
              <div class="kg-detail-actions">
                <button class="kg-detail-btn" @click="expandFromNode(selectedNode)">从此节点出发</button>
                <button class="kg-detail-btn" @click="openEditEntity(selectedNode)">编辑</button>
                <button class="kg-detail-btn" @click="openCreateRelation(selectedNode)">添加关系</button>
                <button class="kg-detail-btn kg-detail-btn-danger" @click="openDeleteConfirm(selectedNode)">删除</button>
              </div>
            </div>
          </div>

          <div class="kg-stats" v-if="graphData && graphData.nodes">
            <span>{{ graphData.nodes.length }} 个节点</span>
            <span>{{ graphData.edges ? graphData.edges.length : 0 }} 条关系</span>
          </div>
        </aside>
      </div>
    </div>

    <!-- 路径查找弹窗 -->
    <div v-if="showPathDialog" class="modal-overlay" @click.self="showPathDialog = false">
      <div class="modal kg-path-modal">
        <div class="modal-header">
          <h3>查找最短路径</h3>
          <button class="modal-close" @click="showPathDialog = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>起点</label>
            <input v-model="pathFrom" type="text" placeholder="输入名称，如：朱婷" class="form-input" />
          </div>
          <div class="form-group">
            <label>终点</label>
            <input v-model="pathTo" type="text" placeholder="输入名称，如：巴西女排" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showPathDialog = false">取消</button>
          <button class="btn btn-primary" @click="findPath" :disabled="!pathFrom.trim() || !pathTo.trim() || pathLoading">
            {{ pathLoading ? '查询中...' : '查询路径' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 创建实体弹窗 -->
    <div v-if="showCreateEntity" class="modal-overlay" @click.self="showCreateEntity = false">
      <div class="modal kg-entity-modal">
        <div class="modal-header">
          <h3>创建实体</h3>
          <button class="modal-close" @click="showCreateEntity = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>名称 <span class="required">*</span></label>
              <input v-model="entityForm.name" type="text" placeholder="实体名称" class="form-input" />
            </div>
            <div class="form-group">
              <label>类型 <span class="required">*</span></label>
              <select v-model="entityForm.type" class="form-input" @change="onEntityTypeChange">
                <option value="" disabled>选择类型</option>
                <option v-for="t in entityTypes" :key="t.name" :value="t.name">{{ t.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="entityForm.description" placeholder="实体描述（可选）" class="form-input form-textarea" rows="2"></textarea>
          </div>
          <template v-if="entityForm.type && entityPropsConfig[entityForm.type]">
            <div class="form-divider">属性信息</div>
            <div class="form-row">
              <div class="form-group" v-for="prop in entityPropsConfig[entityForm.type]" :key="prop.key">
                <label>{{ prop.label }}</label>
                <select v-if="prop.options" v-model="entityForm.properties[prop.key]" class="form-input">
                  <option value="">请选择</option>
                  <option v-for="opt in prop.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <input v-else v-model="entityForm.properties[prop.key]" :type="prop.type || 'text'" :placeholder="prop.placeholder" class="form-input" />
              </div>
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateEntity = false">取消</button>
          <button class="btn btn-primary" @click="submitCreateEntity" :disabled="!entityForm.name.trim() || !entityForm.type || entitySaving">
            {{ entitySaving ? '创建中...' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑实体弹窗 -->
    <div v-if="showEditEntity" class="modal-overlay" @click.self="showEditEntity = false">
      <div class="modal kg-entity-modal">
        <div class="modal-header">
          <h3>编辑实体</h3>
          <button class="modal-close" @click="showEditEntity = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>名称 <span class="required">*</span></label>
              <input v-model="entityForm.name" type="text" placeholder="实体名称" class="form-input" />
            </div>
            <div class="form-group">
              <label>类型</label>
              <input :value="typeLabel(entityForm.type)" type="text" class="form-input" disabled />
            </div>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="entityForm.description" placeholder="实体描述（可选）" class="form-input form-textarea" rows="2"></textarea>
          </div>
          <template v-if="entityForm.type && entityPropsConfig[entityForm.type]">
            <div class="form-divider">属性信息</div>
            <div class="form-row">
              <div class="form-group" v-for="prop in entityPropsConfig[entityForm.type]" :key="prop.key">
                <label>{{ prop.label }}</label>
                <select v-if="prop.options" v-model="entityForm.properties[prop.key]" class="form-input">
                  <option value="">请选择</option>
                  <option v-for="opt in prop.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <input v-else v-model="entityForm.properties[prop.key]" :type="prop.type || 'text'" :placeholder="prop.placeholder" class="form-input" />
              </div>
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditEntity = false">取消</button>
          <button class="btn btn-primary" @click="submitEditEntity" :disabled="!entityForm.name.trim() || entitySaving">
            {{ entitySaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal kg-confirm-modal">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="modal-close" @click="showDeleteConfirm = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>确定要删除实体 <strong>{{ deleteTarget?.name }}</strong> 吗？</p>
          <p class="kg-warn-text">该操作将同时删除该实体的所有关系，且不可恢复。</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-danger" @click="submitDeleteEntity" :disabled="entitySaving">
            {{ entitySaving ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 创建关系弹窗 -->
    <div v-if="showCreateRelation" class="modal-overlay" @click.self="showCreateRelation = false">
      <div class="modal kg-relation-modal">
        <div class="modal-header">
          <h3>添加关系</h3>
          <button class="modal-close" @click="showCreateRelation = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>起始节点</label>
            <input :value="relationForm.fromName" type="text" class="form-input" disabled />
          </div>
          <div class="form-group">
            <label>关系类型 <span class="required">*</span></label>
            <select v-model="relationForm.relationType" class="form-input">
              <option value="" disabled>选择关系类型</option>
              <option v-for="r in relationTypes" :key="r.name" :value="r.name">{{ r.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>目标节点 <span class="required">*</span></label>
            <div class="kg-relation-target">
              <input
                v-model="relationTargetSearch"
                type="text"
                placeholder="输入名称搜索目标节点..."
                class="form-input"
                @input="onRelationTargetSearch"
              />
              <div v-if="relationTargetResults.length > 0" class="kg-relation-dropdown">
                <div
                  v-for="item in relationTargetResults"
                  :key="item.id"
                  class="kg-relation-option"
                  :class="{ selected: relationForm.toId === item.id }"
                  @mousedown.prevent="selectRelationTarget(item)"
                >
                  <span class="kg-dot" :style="{ background: typeColor(item.type) }"></span>
                  {{ item.name }}
                  <span class="kg-relation-option-type">{{ typeLabel(item.type) }}</span>
                </div>
              </div>
            </div>
            <div v-if="relationForm.toName" class="kg-relation-selected">
              已选：{{ relationForm.toName }}
              <button class="kg-clear-btn" @click="clearRelationTarget">清除</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateRelation = false">取消</button>
          <button class="btn btn-primary" @click="submitCreateRelation" :disabled="!relationForm.toId || !relationForm.relationType || entitySaving">
            {{ entitySaving ? '创建中...' : '创建关系' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { knowledge } from '@/api'
import { toastBus } from '@/utils/toast'

const searchKeyword = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const loading = ref(false)
const graphData = ref(null)
const selectedNode = ref(null)
const chartContainer = ref(null)
const showPathDialog = ref(false)
const pathFrom = ref('')
const pathTo = ref('')
const pathLoading = ref(false)

// 增删改状态
const entityTypes = ref([])
const relationTypes = ref([])
const showCreateEntity = ref(false)
const showEditEntity = ref(false)
const showDeleteConfirm = ref(false)
const showCreateRelation = ref(false)
const entitySaving = ref(false)
const editingEntityId = ref(null)
const deleteTarget = ref(null)
const entityForm = ref({ name: '', type: '', description: '', properties: {} })
const relationForm = ref({ fromId: '', fromName: '', toId: '', toName: '', relationType: '' })
const relationTargetSearch = ref('')
const relationTargetResults = ref([])

let chart = null
let searchTimer = null
let relationSearchTimer = null

// 类型配置
const TYPE_CONFIG = {
  PLAYER: { color: '#e74c3c', symbol: 'circle', size: 40, label: '球员' },
  TEAM: { color: '#3498db', symbol: 'roundRect', size: 50, label: '球队' },
  MATCH: { color: '#2ecc71', symbol: 'diamond', size: 35, label: '比赛' },
  TOURNAMENT: { color: '#f39c12', symbol: 'triangle', size: 40, label: '赛事' }
}

// 各类型的属性配置
const entityPropsConfig = {
  PLAYER: [
    { key: 'position', label: '位置', options: ['主攻', '副攻', '二传', '接应', '自由人'] },
    { key: 'height', label: '身高', placeholder: '如：198cm' },
    { key: 'nationality', label: '国籍', placeholder: '如：中国' },
    { key: 'birthDate', label: '出生日期', type: 'date' }
  ],
  TEAM: [
    { key: 'country', label: '国家', placeholder: '如：中国' },
    { key: 'teamType', label: '队伍类型', options: ['国家队', '俱乐部'] }
  ],
  MATCH: [
    { key: 'matchDate', label: '比赛日期', type: 'date' },
    { key: 'location', label: '比赛地点', placeholder: '如：东京' },
    { key: 'result', label: '比赛结果', placeholder: '如：3-1' }
  ],
  TOURNAMENT: [
    { key: 'year', label: '年份', placeholder: '如：2024' },
    { key: 'tournamentType', label: '赛事类型', options: ['奥运会', '世锦赛', '世界杯', '联赛'] }
  ]
}

function typeColor(type) { return TYPE_CONFIG[type]?.color || '#999' }
function typeLabel(type) { return TYPE_CONFIG[type]?.label || type }

function getNodeSymbol(type) {
  const cfg = TYPE_CONFIG[type]
  if (!cfg) return 'circle'
  // ECharts 5 支持 'roundRect', 'triangle', 'diamond', 'circle'
  return cfg.symbol
}

function getNodeSize(type) {
  return TYPE_CONFIG[type]?.size || 30
}

// 防抖搜索
function onSearchInput() {
  clearTimeout(searchTimer)
  const kw = searchKeyword.value.trim()
  if (!kw) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      const res = await knowledge.searchEntities(kw)
      searchResults.value = (res.data || []).slice(0, 8)
      showSearchResults.value = searchResults.value.length > 0
    } catch (e) {
      console.error('搜索失败:', e)
    }
  }, 300)
}

function onSearchEnter() {
  showSearchResults.value = false
  const kw = searchKeyword.value.trim()
  if (!kw) return
  loadGraphForKeyword(kw)
}

function selectSearchItem(item) {
  showSearchResults.value = false
  searchKeyword.value = item.name
  loadGraphForEntity(item)
}

async function searchAndLoad(name) {
  searchKeyword.value = name
  // 先搜一下拿到实体类型，再决定用哪个接口
  try {
    const res = await knowledge.searchEntities(name, '')
    const list = res.data || []
    const match = list.find(e => e.name === name)
    if (match) {
      loadGraphForEntity(match)
    } else {
      loadGraphForKeyword(name)
    }
  } catch (e) {
    loadGraphForKeyword(name)
  }
}

function loadGraphForEntity(entity) {
  if (entity.type === 'PLAYER') {
    loadPlayerGraph(entity.name)
  } else if (entity.type === 'TEAM') {
    loadTeamGraph(entity.name)
  } else {
    loadPlayerGraph(entity.name)
  }
}

function loadGraphForKeyword(keyword) {
  // 默认按球员查询
  loadPlayerGraph(keyword)
}

async function loadPlayerGraph(name) {
  loading.value = true
  selectedNode.value = null
  try {
    const res = await knowledge.getPlayerGraph(name)
    graphData.value = normalizeGraphData(res.data)
    if (graphData.value.nodes.length === 0) {
      toastBus.info('该实体暂无关联图谱数据')
    }
    await nextTick()
    renderChart()
  } catch (e) {
    toastBus.error(e.message || '查询失败')
    graphData.value = null
  } finally {
    loading.value = false
  }
}

async function loadTeamGraph(name) {
  loading.value = true
  selectedNode.value = null
  try {
    const res = await knowledge.getTeamGraph(name)
    graphData.value = normalizeGraphData(res.data)
    if (graphData.value.nodes.length === 0) {
      toastBus.info('该实体暂无关联图谱数据')
    }
    await nextTick()
    renderChart()
  } catch (e) {
    toastBus.error(e.message || '查询失败')
    graphData.value = null
  } finally {
    loading.value = false
  }
}

// 规范化图谱数据：兼容后端返回数组 或 {nodes, edges} 两种格式
function normalizeGraphData(data) {
  if (!data) return { nodes: [], edges: [] }
  // 后端可能返回数组 [{...}, {...}]（与搜索接口格式一致）
  if (Array.isArray(data)) {
    return { nodes: data, edges: [] }
  }
  // 标准格式 { nodes: [...], edges: [...] }
  return {
    nodes: data.nodes || [],
    edges: data.edges || []
  }
}

async function expandFromNode(node) {
  if (!node) return
  if (node.type === 'PLAYER') {
    searchKeyword.value = node.name
    await loadPlayerGraph(node.name)
  } else if (node.type === 'TEAM') {
    searchKeyword.value = node.name
    await loadTeamGraph(node.name)
  } else {
    toastBus.info('暂不支持从此类型节点展开')
  }
}

async function findPath() {
  if (!pathFrom.value.trim() || !pathTo.value.trim()) return
  pathLoading.value = true
  try {
    const res = await knowledge.getPath(pathFrom.value.trim(), pathTo.value.trim())
    graphData.value = normalizeGraphData(res.data)
    if (graphData.value.nodes.length === 0) {
      toastBus.info('未找到路径')
      return
    }
    selectedNode.value = null
    showPathDialog.value = false
    await nextTick()
    renderChart()
  } catch (e) {
    toastBus.error(e.message || '路径查询失败')
  } finally {
    pathLoading.value = false
  }
}

function openPathDialog() {
  pathFrom.value = ''
  pathTo.value = ''
  showPathDialog.value = true
}

function renderChart() {
  if (!chartContainer.value || !graphData.value) return

  if (chart) {
    chart.dispose()
    chart = null
  }

  chart = echarts.init(chartContainer.value)

  const nodes = graphData.value.nodes.map(n => ({
    id: n.elementId,
    name: n.name,
    symbolSize: getNodeSize(n.type),
    symbol: getNodeSymbol(n.type),
    itemStyle: { color: typeColor(n.type), borderColor: '#fff', borderWidth: 2 },
    label: { show: true, fontSize: 12, color: '#333', position: 'bottom', distance: 8 },
    // 附加数据
    _name: n.name,
    _type: n.type,
    _desc: n.description,
    _props: n.properties,
    _id: n.id
  }))

  const edges = graphData.value.edges.map(e => ({
    source: e.from,
    target: e.to,
    label: { show: true, formatter: relationLabel(e.label), fontSize: 10, color: '#888' },
    lineStyle: { color: '#cbd5e1', width: 1.5, curveness: 0.2 }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'edge') return params.data.label?.formatter || ''
        const d = params.data
        const props = d._props || {}
        const propStr = Object.entries(props).map(([k, v]) => `<br/>${k}: ${v}`).join('')
        return `<b>${d._name}</b><br/>类型: ${typeLabel(d._type)}${d._desc ? '<br/>' + d._desc : ''}${propStr}`
      }
    },
    animationDuration: 800,
    animationEasingUpdate: 'cubicInOut',
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      force: {
        repulsion: 350,
        gravity: 0.15,
        edgeLength: [120, 250],
        layoutAnimation: true
      },
      data: nodes,
      edges: edges,
      // 连线标签
      edgeLabel: { show: true, fontSize: 10, color: '#888' },
      // 选中样式
      emphasis: {
        focus: 'adjacency',
        itemStyle: { borderColor: '#333', borderWidth: 3, shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        lineStyle: { width: 3 }
      }
    }]
  }

  chart.setOption(option)

  // 点击节点 → 选中详情
  chart.on('click', (params) => {
    if (params.dataType === 'node') {
      const d = params.data
      selectedNode.value = {
        elementId: d.id,
        id: d._id,
        name: d._name,
        type: d._type,
        description: d._desc,
        properties: d._props
      }
    }
  })

  // 响应窗口大小变化
  const resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)
  // 存到闭包中以便清理
  chart._resizeHandler = resizeHandler
}

function relationLabel(type) {
  const map = {
    PLAYS_FOR: '效力于',
    PARTICIPATES_IN: '参加',
    BELONGS_TO: '属于',
    COACHES: '执教',
    TEAMMATE_OF: '队友'
  }
  return map[type] || type
}

function resetView() {
  if (chart) {
    chart.dispatchAction({ type: 'restore' })
    selectedNode.value = null
  }
}

// 点击空白区域清除选中
function handleClickOutside(e) {
  if (chartContainer.value && !chartContainer.value.contains(e.target)) {
    // 保留 selectedNode 不清除（用户可能在看侧边栏）
  }
}

// ===== 增删改相关函数 =====

function resetEntityForm() {
  entityForm.value = { name: '', type: '', description: '', properties: {} }
  editingEntityId.value = null
}

function onEntityTypeChange() {
  entityForm.value.properties = {}
}

function openCreateEntity() {
  resetEntityForm()
  showCreateEntity.value = true
}

function openEditEntity(node) {
  editingEntityId.value = node.id
  const props = {}
  const schema = entityPropsConfig[node.type] || []
  for (const p of schema) {
    props[p.key] = node.properties?.[p.key] || ''
  }
  entityForm.value = {
    name: node.name,
    type: node.type,
    description: node.description || '',
    properties: props
  }
  showEditEntity.value = true
}

async function submitCreateEntity() {
  if (!entityForm.value.name.trim() || !entityForm.value.type) return
  entitySaving.value = true
  try {
    const data = {
      name: entityForm.value.name.trim(),
      type: entityForm.value.type,
      description: entityForm.value.description.trim() || null,
      properties: cleanProperties(entityForm.value.properties)
    }
    await knowledge.createEntity(data)
    toastBus.success('实体创建成功')
    showCreateEntity.value = false
  } catch (e) {
    toastBus.error(e.message || '创建失败，请检查是否已登录')
  } finally {
    entitySaving.value = false
  }
}

async function submitEditEntity() {
  if (!entityForm.value.name.trim() || !editingEntityId.value) return
  entitySaving.value = true
  try {
    const data = {
      name: entityForm.value.name.trim(),
      description: entityForm.value.description.trim() || null,
      properties: cleanProperties(entityForm.value.properties)
    }
    const res = await knowledge.updateEntity(editingEntityId.value, data)
    const updated = res.data
    if (selectedNode.value && selectedNode.value.id === editingEntityId.value) {
      selectedNode.value = { ...selectedNode.value, name: updated.name, description: updated.description, properties: updated.properties }
    }
    if (graphData.value) {
      const idx = graphData.value.nodes.findIndex(n => n.id === editingEntityId.value)
      if (idx !== -1) Object.assign(graphData.value.nodes[idx], updated)
      renderChart()
    }
    toastBus.success('实体更新成功')
    showEditEntity.value = false
  } catch (e) {
    toastBus.error(e.message || '更新失败')
  } finally {
    entitySaving.value = false
  }
}

function openDeleteConfirm(node) {
  deleteTarget.value = node
  showDeleteConfirm.value = true
}

async function submitDeleteEntity() {
  if (!deleteTarget.value) return
  entitySaving.value = true
  try {
    await knowledge.deleteEntity(deleteTarget.value.id)
    toastBus.success('实体已删除')
    showDeleteConfirm.value = false
    if (selectedNode.value?.id === deleteTarget.value.id) selectedNode.value = null
    if (graphData.value) {
      graphData.value.nodes = graphData.value.nodes.filter(n => n.id !== deleteTarget.value.id)
      const eid = deleteTarget.value.elementId
      graphData.value.edges = graphData.value.edges.filter(e => e.from !== eid && e.to !== eid)
      renderChart()
    }
    deleteTarget.value = null
  } catch (e) {
    toastBus.error(e.message || '删除失败')
  } finally {
    entitySaving.value = false
  }
}

function openCreateRelation(node) {
  relationForm.value = { fromId: node.id, fromName: node.name, toId: '', toName: '', relationType: '' }
  relationTargetSearch.value = ''
  relationTargetResults.value = []
  showCreateRelation.value = true
}

function onRelationTargetSearch() {
  clearTimeout(relationSearchTimer)
  const kw = relationTargetSearch.value.trim()
  if (!kw) { relationTargetResults.value = []; return }
  relationSearchTimer = setTimeout(async () => {
    try {
      const res = await knowledge.searchEntities(kw)
      relationTargetResults.value = (res.data || []).filter(e => e.id !== relationForm.value.fromId).slice(0, 8)
    } catch (e) {
      console.error('搜索目标节点失败:', e)
    }
  }, 300)
}

function selectRelationTarget(item) {
  relationForm.value.toId = item.id
  relationForm.value.toName = item.name
  relationTargetSearch.value = ''
  relationTargetResults.value = []
}

function clearRelationTarget() {
  relationForm.value.toId = ''
  relationForm.value.toName = ''
}

async function submitCreateRelation() {
  if (!relationForm.value.toId || !relationForm.value.relationType) return
  entitySaving.value = true
  try {
    await knowledge.createRelation({
      fromId: relationForm.value.fromId,
      toId: relationForm.value.toId,
      relationType: relationForm.value.relationType
    })
    toastBus.success('关系创建成功')
    showCreateRelation.value = false
    // 刷新当前图谱
    if (selectedNode.value) await expandFromNode(selectedNode.value)
  } catch (e) {
    toastBus.error(e.message || '创建关系失败')
  } finally {
    entitySaving.value = false
  }
}

function cleanProperties(props) {
  const result = {}
  for (const [k, v] of Object.entries(props)) {
    if (v !== '' && v != null) result[k] = v
  }
  return result
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  try {
    const [typesRes, relRes] = await Promise.all([knowledge.getTypes(), knowledge.getRelationTypes()])
    entityTypes.value = typesRes.data || []
    relationTypes.value = relRes.data || []
  } catch (e) {
    console.error('加载类型失败:', e)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (chart) {
    if (chart._resizeHandler) {
      window.removeEventListener('resize', chart._resizeHandler)
    }
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.kg-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.kg-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px);
  max-width: 1600px;
  margin: 0 auto;
}

/* 头部搜索栏 */
.kg-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: 0;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border-light);
}

.kg-back {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
  text-decoration: none;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.kg-back:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  text-decoration: none;
}

.kg-search-wrapper {
  flex: 1;
  position: relative;
  max-width: 600px;
}

.kg-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.kg-search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-2xl);
  font-size: var(--text-sm);
  background: var(--color-bg-soft);
  color: var(--color-text);
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.kg-search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-card);
  box-shadow: var(--shadow-focus);
}

.kg-search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-height: 320px;
  overflow-y: auto;
}

.kg-search-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kg-search-item:hover {
  background: var(--color-bg-soft);
}

.kg-search-item-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kg-search-item-info {
  display: flex;
  flex-direction: column;
}

.kg-search-item-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.kg-search-item-type {
  font-size: 11px;
  color: var(--color-text-muted);
}

.kg-header-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.kg-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kg-action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

/* 主体 */
.kg-main {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 画布 */
.kg-canvas-wrapper {
  flex: 1;
  position: relative;
  min-width: 0;
}

.kg-chart {
  width: 100%;
  height: 100%;
}

.kg-loading,
.kg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  gap: var(--space-md);
}

.kg-empty-icon {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  color: var(--color-text-muted);
}

.kg-empty h3 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.kg-empty p {
  font-size: var(--text-sm);
  margin: 0;
}

.kg-hint {
  color: var(--color-text-muted);
  font-size: var(--text-xs) !important;
  margin-top: var(--space-2) !important;
}

.kg-quick-links {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.kg-quick-links button {
  padding: var(--space-md) var(--space-xl);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-card);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kg-quick-links button:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  transform: translateY(-1px);
}

/* 侧边栏 */
.kg-sidebar {
  width: 280px;
  background: var(--color-card);
  border-left: 1px solid var(--color-border-light);
  padding: var(--space-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  flex-shrink: 0;
}

.kg-legend h4,
.kg-detail h4 {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 var(--space-md);
}

.kg-legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
}

.kg-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kg-detail-card {
  background: var(--color-bg-soft);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
}

.kg-detail-type {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  margin-bottom: var(--space-2);
}

.kg-detail-name {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--space-2);
}

.kg-detail-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: 1.5;
}

.kg-detail-props {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-md);
}

.kg-prop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  padding: var(--space-1) 0;
  border-bottom: 1px dashed var(--color-border-light);
}

.kg-prop-key {
  color: var(--color-text-muted);
}

.kg-prop-value {
  color: var(--color-text);
  font-weight: 500;
}

.kg-detail-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.kg-detail-btn {
  padding: var(--space-2) var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kg-detail-btn:hover {
  background: var(--color-primary);
  color: white;
}

.kg-stats {
  display: flex;
  gap: var(--space-lg);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

/* 路径弹窗 */
.kg-path-modal {
  max-width: 400px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  width: 100%;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--color-error);
  color: white;
}

.modal-body {
  padding: var(--space-xl);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.form-input {
  width: 100%;
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}

.btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-card);
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-text-muted);
}

/* 操作按钮 */
.kg-action-primary {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.kg-action-primary:hover {
  background: var(--color-primary);
  color: white;
}

/* 详情按钮 - 危险 */
.kg-detail-btn-danger {
  border-color: var(--color-error);
  color: var(--color-error);
}

.kg-detail-btn-danger:hover {
  background: var(--color-error);
  color: white;
}

/* 实体弹窗 */
.kg-entity-modal {
  max-width: 560px;
}

.kg-relation-modal {
  max-width: 480px;
}

.kg-confirm-modal {
  max-width: 400px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-divider {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-top: var(--space-md);
  margin-bottom: var(--space-md);
  border-top: 1px dashed var(--color-border-light);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.required {
  color: var(--color-error);
}

select.form-input {
  appearance: auto;
  cursor: pointer;
}

/* 关系目标搜索 */
.kg-relation-target {
  position: relative;
}

.kg-relation-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.kg-relation-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-md);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.kg-relation-option:hover {
  background: var(--color-bg-soft);
}

.kg-relation-option.selected {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.kg-relation-option-type {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-muted);
}

.kg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kg-relation-selected {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-primary);
  margin-top: var(--space-2);
}

.kg-clear-btn {
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.kg-warn-text {
  font-size: var(--text-sm);
  color: var(--color-error);
  margin-top: var(--space-2);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 960px) {
  .kg-sidebar {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .kg-main {
    flex-direction: column;
  }

  .kg-canvas-wrapper {
    height: 55vh;
  }

  .kg-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--color-border-light);
    max-height: 40vh;
    flex-shrink: 1;
  }

  .kg-header-actions .kg-action-btn span {
    display: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
