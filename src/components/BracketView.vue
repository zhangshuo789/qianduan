<template>
  <div class="bracket-wrapper">
    <div class="bracket-scroll">
      <div class="bracket-grid" :style="gridStyle">
        <template v-for="(round, ri) in rounds" :key="ri">
          <!-- 轮次标题 -->
          <div class="round-title" :style="gridPos(ri, 0, 'title')">
            {{ roundLabel(ri) }}
          </div>

          <!-- 比赛卡片 -->
          <div
            v-for="(match, mi) in round.matches"
            :key="match.matchId"
            class="match-slot"
            :style="gridPos(ri, mi, 'match')"
          >
            <!-- 左侧入线（非首轮） -->
            <div v-if="ri > 0" class="line-in"></div>

            <!-- 状态标签（放在卡片外，不被裁切） -->
            <span v-if="match.status === 'BYE'" class="match-tag tag-bye">轮空</span>
            <span v-else-if="match.status === 'PENDING' && canSetResult(match)" class="match-tag tag-ready">可操作</span>

            <div
              class="match-card"
              :class="matchCardClass(match)"
              @click="$emit('match-click', match)"
            >
              <div class="match-team" :class="teamClass(match, match.team1, match.winnerId)">
                <span class="team-seed">{{ positionOf(match.team1) }}</span>
                <span class="team-name">{{ match.team1?.teamName || '待定' }}</span>
                <span v-if="match.score1 != null" class="team-score">{{ match.score1 }}</span>
              </div>
              <div class="match-vs"></div>
              <div class="match-team" :class="teamClass(match, match.team2, match.winnerId)">
                <span class="team-seed">{{ positionOf(match.team2) }}</span>
                <span class="team-name">{{ match.team2?.teamName || '待定' }}</span>
                <span v-if="match.score2 != null" class="team-score">{{ match.score2 }}</span>
              </div>
            </div>

            <!-- 右侧出线（非末轮） -->
            <div v-if="ri < rounds.length - 1" class="line-out"></div>

            <!-- 垂直连接线：出侧（非末轮） -->
            <div v-if="ri < rounds.length - 1 && mi % 2 === 0" class="line-v line-v-top" :style="vLineStyle"></div>
            <div v-if="ri < rounds.length - 1 && mi % 2 === 1" class="line-v line-v-bottom" :style="vLineStyle"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rounds: { type: Array, required: true },
  eventStatus: { type: String, default: '' },
  isOrganizer: { type: Boolean, default: false }
})

defineEmits(['match-click'])

const colWidth = 210
const matchH = 68
const rowGap = 12
const baseRow = matchH + rowGap
const titleH = 36

const totalRounds = computed(() => props.rounds.length)

// 每轮最大 match 数，用于计算总高度
function matchesInRound(ri) {
  return props.rounds[ri]?.matches?.length || 1
}

// match 高度（含间距）
function slotH(ri) {
  return baseRow * Math.pow(2, ri)
}

const gridStyle = computed(() => {
  const cols = totalRounds.value
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${colWidth}px)`,
    gridAutoRows: 'auto',
    width: cols * colWidth + 'px',
    position: 'relative'
  }
})

// 计算每个元素的 grid 行位置
function gridPos(ri, mi, type) {
  const multiplier = Math.pow(2, ri)
  // 每个 match 占据的行跨度
  const span = multiplier
  // 起始行（1-based）
  const startRow = mi * span + 1
  // 标题行占第 0 行（需要偏移）
  if (type === 'title') {
    return {
      gridColumn: ri + 1,
      gridRow: `1`
    }
  }
  // match 从第 2 行开始（第 1 行是标题）
  return {
    gridColumn: ri + 1,
    gridRow: `${startRow + 1} / span ${span}`
  }
}

const vLineStyle = computed(() => {
  return { height: baseRow + 'px' }
})

function positionOf(team) {
  if (!team) return ''
  return team.bracketPosition != null ? `#${team.bracketPosition + 1}` : ''
}

function roundLabel(ri) {
  const total = totalRounds.value
  if (ri === total - 1) return '决赛'
  if (ri === total - 2) return '半决赛'
  if (ri === total - 3) return '1/4决赛'
  return `第${ri + 1}轮`
}

function matchCardClass(match) {
  return {
    'match-completed': match.status === 'COMPLETED',
    'match-bye': match.status === 'BYE',
    'match-ready': match.status === 'PENDING' && match.team1 && match.team2
  }
}

function teamClass(match, team, winnerId) {
  if (!team) return 'team-empty'
  if (match.status === 'COMPLETED' && winnerId) {
    if (team.registrationId === winnerId) return 'team-winner'
    return 'team-loser'
  }
  if (team.isChampion) return 'team-champion'
  if (team.eliminated) return 'team-eliminated'
  return ''
}

function canSetResult(match) {
  return props.isOrganizer
    && match.status === 'PENDING'
    && match.team1
    && match.team2
    && (props.eventStatus === 'IN_PROGRESS' || props.eventStatus === 'REGISTERING')
}
</script>

<style scoped>
.bracket-wrapper {
  width: 100%;
  overflow-x: auto;
  padding: var(--space-2) 0 var(--space-4);
}

.bracket-scroll {
  display: inline-block;
  min-width: 100%;
}

.bracket-grid {
  gap: 0;
}

/* 轮次标题 */
.round-title {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 2px solid var(--color-border-light);
  margin-bottom: var(--space-3);
}

/* 比赛卡槽 */
.match-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 比赛卡片 */
.match-card {
  width: 176px;
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.match-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: scale(1.02);
}

.match-ready {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary-soft);
}

.match-completed {
  border-color: #d9f7be;
}

.match-bye {
  opacity: 0.45;
  cursor: default;
}

.match-bye:hover {
  transform: none;
  box-shadow: none;
}

/* 队伍行 */
.match-team {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 10px;
  font-size: 13px;
  transition: background var(--transition-fast);
}

.match-vs {
  height: 1px;
  background: var(--color-border-light);
}

.team-seed {
  flex-shrink: 0;
  width: 22px;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-soft);
  border-radius: 3px;
  padding: 1px 0;
}

.team-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.team-score {
  flex-shrink: 0;
  width: 24px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

/* 队伍状态 */
.team-empty {
  color: var(--color-text-muted);
}

.team-empty .team-name {
  font-style: italic;
  font-weight: 400;
}

.team-winner {
  background: #f6ffed;
}

.team-winner .team-name {
  color: #389e0d;
  font-weight: 700;
}

.team-winner .team-score {
  color: #389e0d;
}

.team-loser {
  opacity: 0.5;
}

.team-loser .team-name {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.team-champion {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
}

.team-champion .team-name {
  color: #d48806;
  font-weight: 700;
}

.team-champion .team-score {
  color: #d48806;
}

.team-eliminated .team-name {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

/* 状态标签（相对于 .match-slot 定位） */
.match-tag {
  position: absolute;
  top: 0;
  right: 18px;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  z-index: 3;
  letter-spacing: 0.3px;
  transform: translateY(-50%);
}

.tag-bye {
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.tag-ready {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 连接线 */
.line-in {
  position: absolute;
  left: -16px;
  top: 50%;
  width: 16px;
  height: 2px;
  background: var(--color-border);
  transform: translateY(-1px);
}

.line-out {
  position: absolute;
  right: -16px;
  top: 50%;
  width: 16px;
  height: 2px;
  background: var(--color-border);
  transform: translateY(-1px);
}

.line-v {
  position: absolute;
  right: -17px;
  width: 2px;
  background: var(--color-border);
  z-index: 1;
}

.line-v-top {
  top: 50%;
  transform: translateY(-1px);
}

.line-v-bottom {
  bottom: 50%;
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .match-card {
    width: 150px;
  }

  .team-seed {
    display: none;
  }
}
</style>
