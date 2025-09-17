type AnalyticsEvent =
  | { type: 'assignment_created'; assignmentId: string; coachId: string; studentId: string }
  | { type: 'assignment_updated'; assignmentId: string; coachId: string }
  | { type: 'review_created'; assignmentId: string; submissionId: string; coachId: string }
  | { type: 'message_sent'; messageId: string; senderId: string; receiverId: string }

export async function track(event: AnalyticsEvent) {
  try {
    // Basit: console + ileride dış servise gönderim noktası
    // eslint-disable-next-line no-console
    console.log('[analytics]', JSON.stringify(event))
  } catch {
    // noop
  }
}


