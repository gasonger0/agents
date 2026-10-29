export const meta = {
  name: 'implement-and-review',
  description: 'Run an implementation task, then have Reviewer check it. Loop until PASS.',
  phases: [
    { title: 'Implement', detail: 'Delegate the task to backend or frontend' },
    { title: 'Review', detail: 'Reviewer checks the result' },
  ],
}

// Схема структурированного ответа от Reviewer
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL'], description: 'Final verdict' },
    feedback: { type: 'string', description: 'Actionable feedback if FAIL' },
    files: { type: 'array', items: { type: 'string' }, description: 'Files reviewed or changed' },
  },
  required: ['verdict', 'feedback'],
}

phase('Implement')

// Запускаем исполнителя. В аргументах можно передать роль (backend/frontend) и описание задачи.
const implementation = await agent(
  `Implement the following task according to the approved plan:\n${args.task}\n\n` +
  `Role: ${args.role}\n` +
  `If you need to explore the codebase, use the explore agent first. ` +
  `Do not install new dependencies. Report what you changed.`,
  { label: 'Implement task', phase: 'Implement' }
)

phase('Review')

// Цикл: пока Reviewer не вернёт PASS (или не исчерпаны итерации)
const finalReview = await loop(
  'the reviewer verdict is PASS',
  async () => {
    // Вызываем Reviewer со схемой, чтобы получить структурированный вердикт
    const review = await agent(
      `Review the implementation against the approved spec and plan.\n\n` +
      `Implementation summary:\n${implementation}\n\n` +
      `If the implementation is acceptable, return verdict PASS. ` +
      `If not, return verdict FAIL with actionable feedback for the developer.`,
      {
        label: 'Review implementation',
        phase: 'Review',
        schema: REVIEW_SCHEMA,
      }
    )

    // Если FAIL — передаём feedback обратно исполнителю и просим исправить
    if (review.verdict === 'FAIL') {
      const fix = await agent(
        `The reviewer rejected the implementation with the following feedback:\n` +
        `${review.feedback}\n\n` +
        `Fix the issues in the code. Do not change the plan. ` +
        `Only address the reviewer's feedback. Report what you changed.`,
        { label: 'Fix review feedback', phase: 'Implement' }
      )
      // Возвращаем обновлённое состояние для следующей итерации
      return { review, fix }
    }

    return { review }
  },
  {
    maxIterations: 5,
    label: 'Review-fix loop',
  }
)

// Возвращаем итоговый результат в основную сессию
return {
  implementation,
  finalReview,
}
