export function matchesNoticeTarget(target, student) {
  if (!target || target === 'All Students') return true

  const department = `${student?.department || student?.dept || ''} ${student?.branch || ''}`.toLowerCase()
  const hostel = student?.hostel_block || (student?.hostel && !/day scholar/i.test(student.hostel))

  if (target === 'Computer Science') return /computer|\bcse\b|\bcs\b|information technology/.test(department)
  if (target === 'Mechanical Engg') return /mechanical|\bmech\b/.test(department)
  if (target === 'Electronics') return /electronics|\bece\b|electrical/.test(department)
  if (target.startsWith('Year ')) return Number(target.slice(5)) === Number(student?.year)
  if (target === 'Hostel') return Boolean(hostel)
  if (target === 'Day Scholars') return !hostel

  return false
}