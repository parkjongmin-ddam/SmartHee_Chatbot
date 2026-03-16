import styles from './TokenDashboard.module.css'

interface MessageToken {
    role: string
    inputTokens?: number
    outputTokens?: number
}

interface DailyUsage {
    date: string
    input: number
    output: number
}

interface Props {
    messages: MessageToken[]
    totalTokens: { input: number; output: number }
}

// claude-sonnet-4-5 기준 단가
const INPUT_COST_PER_TOKEN = 3 / 1_000_000
const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000

function loadDailyHistory(): DailyUsage[] {
    try {
        return JSON.parse(localStorage.getItem('tokenHistory') || '[]')
    } catch {
        return []
    }
}

function saveTodayUsage(input: number, output: number) {
    const today = new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
    const history = loadDailyHistory()
    const existing = history.find(d => d.date === today)
    if (existing) {
        existing.input = input
        existing.output = output
    } else {
        history.push({ date: today, input, output })
    }
    const recent = history.slice(-7)
    localStorage.setItem('tokenHistory', JSON.stringify(recent))
    return recent
}

export default function TokenDashboard({ messages, totalTokens }: Props) {
    const dailyHistory = saveTodayUsage(totalTokens.input, totalTokens.output)
    const totalCost = (totalTokens.input * INPUT_COST_PER_TOKEN + totalTokens.output * OUTPUT_COST_PER_TOKEN)

    const conversations = messages.filter(m => m.role === 'assistant' && m.inputTokens != null)
    const maxTokens = Math.max(...dailyHistory.map(d => d.input + d.output), 1)

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>📊 사용량 대시보드</div>

            {/* 세션 요약 */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>이번 세션</div>
                <div className={styles.statGrid}>
                    <div className={styles.statBox}>
                        <div className={styles.statLabel}>입력 토큰</div>
                        <div className={styles.statValue}>{totalTokens.input.toLocaleString()}</div>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.statLabel}>출력 토큰</div>
                        <div className={styles.statValue}>{totalTokens.output.toLocaleString()}</div>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.statLabel}>총 토큰</div>
                        <div className={styles.statValue}>{(totalTokens.input + totalTokens.output).toLocaleString()}</div>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.statLabel}>예상 비용</div>
                        <div className={`${styles.statValue} ${styles.cost}`}>${totalCost.toFixed(4)}</div>
                    </div>
                </div>
            </div>

            {/* 일별 사용량 그래프 */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>최근 7일 사용량</div>
                <div className={styles.chart}>
                    {dailyHistory.length === 0 ? (
                        <div className={styles.empty}>데이터 없음</div>
                    ) : (
                        dailyHistory.map((d, i) => {
                            const total = d.input + d.output
                            const pct = (total / maxTokens) * 100
                            const inputPct = total > 0 ? (d.input / total) * 100 : 0
                            return (
                                <div key={i} className={styles.barGroup}>
                                    <div className={styles.barWrap}>
                                        <div className={styles.bar} style={{ height: `${pct}%` }}>
                                            <div className={styles.barInput} style={{ height: `${inputPct}%` }} />
                                        </div>
                                    </div>
                                    <div className={styles.barLabel}>{d.date}</div>
                                    <div className={styles.barValue}>{(total / 1000).toFixed(1)}k</div>
                                </div>
                            )
                        })
                    )}
                </div>
                <div className={styles.legend}>
                    <span className={styles.legendInput}>■ 입력</span>
                    <span className={styles.legendOutput}>■ 출력</span>
                </div>
            </div>

            {/* 대화별 토큰 */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>대화별 사용량</div>
                {conversations.length === 0 ? (
                    <div className={styles.empty}>아직 대화 없음</div>
                ) : (
                    <div className={styles.convList}>
                        {conversations.map((m, i) => {
                            const cost = ((m.inputTokens ?? 0) * INPUT_COST_PER_TOKEN + (m.outputTokens ?? 0) * OUTPUT_COST_PER_TOKEN)
                            return (
                                <div key={i} className={styles.convRow}>
                                    <div className={styles.convIndex}>#{i + 1}</div>
                                    <div className={styles.convTokens}>
                                        <span className={styles.inputBadge}>↑{(m.inputTokens ?? 0).toLocaleString()}</span>
                                        <span className={styles.outputBadge}>↓{(m.outputTokens ?? 0).toLocaleString()}</span>
                                    </div>
                                    <div className={styles.convCost}>${cost.toFixed(4)}</div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}