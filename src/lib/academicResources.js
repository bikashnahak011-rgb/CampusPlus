export function isPdfAssignmentFile(file) {
  const name = file?.name?.toLowerCase() || ''
  const type = file?.type?.toLowerCase() || ''
  return name.endsWith('.pdf') && (!type || type === 'application/pdf' || type === 'pdf')
}
