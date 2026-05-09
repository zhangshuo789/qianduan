<template>
  <div class="bracket-wrapper" ref="wrapperRef">
    <div class="bracket-scroll">
      <div class="bracket" :style="bracketStyle">
        <!-- 轮次标签 -->
        <div class="round-labels">
          <div
            v-for="(round, ri) in rounds"
            :key="ri"
            class="round-label"
            :style="roundLabelStyle(ri)"
          >{{ roundLabel(round, ri) }}</div>
        </div>

        <!-- 对阵图主体 -->
        <div class="bracket-body">
          <div
            v-for="(round, ri) in rounds"
            :key="ri"
            class="round-column"
            :style="roundColumnStyle(ri)"
          >
            <div
              v-for="(match, mi) in round.matches"
              :key="match.matchId"
              class="match-wrapper"
              :style="matchWrapperStyle(ri)"
            >
              <div
                class="match-card"
                :class="matchCardClass(match)"
                @click="$emit('match-click', match)"
              >
                <!-- team1 -->
                <div class="match-team" :class="teamClass(match, match.team1, match.winnerId)">
                  <span class="team-name">{{ match.team1?.teamName || '待定' }}</span>
                  <span v-if="match.score1 != null" class="team-score">{{ match.score1 }}</span>
                </div>
                <!-- 分隔线 -->
                <div class="match-divider"></div>
                <!-- team2 -->
                <div class="match-team" :class="teamClass(match, match.team2, match.winnerId)">
                  <span class="team-name">{{ match.team2?.teamName || '待定' }}</span>
                  <span v-if="match.score2 != null" class="team-score">{{ match.score2 }}</span>
                </div>
                <!-- 状态标签 -->
                <span v-if="match.status === 'BYE'" class="match-status-tag tag-bye">轮空</span>
                <span v-else-if="match.status === 'PENDING' && canSetResult(match)" class="match-status-tag tag-ready">可操作</span>
              </div>
              <!-- 连接线（非最后一轮） -->
              <div v-if="ri < rounds.length - 1" class="connector-out"></div>
            </div>
            <!-- 连接线入（非第一轮） -->
            <div v-if="ri > 0" class="connector-column">
              <div
                v-for="(match, mi) in round.matches"
                :key="mi"
                class="connector-in"
                :style="connectorInStyle(ri)"
              ></div>
            </div>
          </div>
        </div>
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

const baseHeight = 72
const gap = 16

const totalRounds = computed(() => props.rounds.length)

const bracketStyle = computed(() => {
  const cols = totalRounds.value
  const w = cols * 220
  return { minWidth: w + 'px' }
})

function roundLabelStyle(ri) {
  return { left: ri * 220 + 'px', width: '200px' }
}

function roundColumnStyle(ri) {
  const multiplier = Math.pow(2, ri)
  const itemHeight = baseHeight + gap
  const marginTop = ri === 0 ? 0 : (itemHeight * (multiplier - 1)) / 2
  return {
    marginLeft: '0',
    paddingTop: marginTop + 'px'
  }
}

function matchWrapperStyle(ri) {
  const multiplier = Math.pow(2, ri)
  const itemHeight = baseHeight + gap
  const marginBottom = ri === 0 ? gap : (itemHeight * (multiplier - 1)) + gap
  return { marginBottom: marginBottom + 'px' }
}

function connectorInStyle(ri) {
  const multiplier = Math.pow(2, ri - 1)
  const itemHeight = baseHeight + gap
  const marginBottom = ri === 1 ? gap : (itemHeight * (multiplier - 1)) + gap
  return { marginBottom: marginBottom + 'px' }
}

function roundLabel(round, ri) {
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
  padding: var(--space-4) 0;
}

.bracket-scroll {
  display: inline-block;
  min-width: 100%;
}

.bracket {
  position: relative;
  padding-top: 48px;
}

.round-labels {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
}

.round-label {
  position: absolute;
  text-align: center;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: var(--space-2) 0;
}

.bracket-body {
  display: flex;
}

.round-column {
  position: relative;
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.match-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.match-card {
  width: 180px;
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.match-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.match-ready {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.match-completed {
  opacity: 0.9;
}

.match-bye {
  opacity: 0.5;
  cursor: default;
}

.match-team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.team-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.team-score {
  font-weight: 700;
  margin-left: var(--space-2);
  flex-shrink: 0;
}

.match-divider {
  height: 1px;
  background: var(--color-border-light);
}

.team-empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.team-winner {
  background: #f6ffed;
  color: #389e0d;
  font-weight: 600;
}

.team-winner .team-score {
  color: #389e0d;
}

.team-loser {
  color: var(--color-text-muted);
  text-decoration: line-through;
  opacity: 0.6;
}

.team-champion {
  background: #fff7e6;
  color: #d48806;
  font-weight: 700;
}

.team-eliminated {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.match-status-tag {
  position: absolute;
  top: -8px;
  right: 8px;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

.tag-bye {
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
}

.tag-ready {
  background: var(--color-primary);
  color: white;
}

.connector-out {
  width: 20px;
  height: 2px;
  background: var(--color-border);
  flex-shrink: 0;
}

.connector-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  width: 20px;
}

.connector-in {
  height: 100%;
  border-left: 2px solid var(--color-border);
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .match-card {
    width: 160px;
  }

  .round-column {
    width: 180px;
  }
}
</style>
