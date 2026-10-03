import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, Award, Bookmark, BookOpen, BriefcaseBusiness,
  Building2, CalendarDays, Check, CheckCircle2, ChevronRight, CircleHelp,
  Code2, Download, ExternalLink, GraduationCap, LoaderCircle,
  MapPin, Play, Search, Send, Sparkles, Target, Upload, Users, X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'
import {
  CAREER_CATALOG,
  DEMO_COMPANIES,
  DEMO_OPPORTUNITIES,
  INTERVIEW_QUESTIONS,
  OPPORTUNITY_FILTERS,
  PROFESSIONAL_SKILLS,
  getOpportunityMatch,
  getProfileCompletion,
} from '../../lib/careerHub'
import './CareerHub.css'

const DEMO_STUDENT_KEY = 'campusplus_career_hub_student'
const DEMO_ADMIN_KEY = 'campusplus_career_hub_admin'
const EMPTY_PROFILE = {
  headline: '', about: '', skills: [], achievements: [], internships: [],
  github_url: '', linkedin_url: '', portfolio_url: '', resume_path: '', selected_career_path_id: '',
}
const EMPTY_DATA = {
  paths: [], professionalSkills: [], skillProgress: {}, projectProgress: {}, profile: EMPTY_PROFILE,
  bookmarks: [], companies: [], collaborations: [], opportunities: [], workshops: [],
  registrations: [], certifications: [], articles: [], interviewPractice: [],
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'explore', label: 'Career paths', icon: ArrowDownRight },
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'professional', label: 'Professional skills', icon: Users },
  { id: 'interview', label: 'Interview prep', icon: CircleHelp },
  { id: 'opportunities', label: 'Opportunities', icon: Sparkles },
  { id: 'campus', label: 'Campus', icon: CalendarDays },
  { id: 'profile', label: 'My career profile', icon: GraduationCap },
]

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

function mergeDemoRecords(studentRecords = [], adminRecords = []) {
  const records = new Map(studentRecords.map(record => [record.id, record]))
  adminRecords.forEach(record => records.set(record.id, { ...records.get(record.id), ...record }))
  return [...records.values()]
}

function syncDemoAdminRecord(collection, record) {
  const admin = readStorage(DEMO_ADMIN_KEY) || {}
  const records = admin[collection] || []
  localStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify({
    ...admin,
    [collection]: [record, ...records.filter(item => item.id !== record.id)],
  }))
}

function getDemoData() {
  const saved = readStorage(DEMO_STUDENT_KEY) || {}
  const admin = readStorage(DEMO_ADMIN_KEY) || {}
  const adminPaths = admin.paths?.length ? admin.paths : CAREER_CATALOG.map(path => ({ ...path, id: path.slug }))
  const paths = adminPaths.filter(path => path.is_active !== false).map(path => {
    const template = CAREER_CATALOG.find(item => item.slug === path.slug || item.slug === path.id)
    const pathId = path.id || path.slug
    const managedSkills = (admin.skills || []).filter(skill => skill.career_path_id === pathId)
    const skills = managedSkills.length
      ? managedSkills.map(skill => {
        const guide = template?.skills.find(item => item.slug === skill.slug || item.name.toLowerCase() === skill.name.toLowerCase())
        const resources = (admin.resources || []).filter(resource => resource.career_skill_id === skill.id)
        return { ...guide, ...skill, id: skill.id, why: guide?.why || skill.why_it_matters, topics: guide?.topics?.length ? guide.topics : skill.topics || [], resources: resources.length ? resources : guide?.resources || [], practice: guide?.practice || `Apply ${skill.name} in a small project.` }
      })
      : (template?.skills || []).map(skill => ({ ...skill, id: `${pathId}:${skill.slug}` }))
    const managedProjects = (admin.projects || []).filter(project => project.career_path_id === pathId)
    const projects = managedProjects.length
      ? managedProjects.map(project => ({ ...project, level: project.difficulty || project.level, id: project.id || `${pathId}:project:${slugify(project.title)}` }))
      : (template?.projects || []).map(project => ({ ...project, id: `${pathId}:project:${slugify(project.title)}` }))
    return { ...template, ...path, id: pathId, title: path.title || template?.title, category: path.category || template?.category, summary: path.summary || template?.summary || '', description: path.description || template?.description || '', roadmap: path.roadmap?.length ? path.roadmap : template?.roadmap || [], skills, projects, color: template?.color || 'teal' }
  })
  const professionalSkills = PROFESSIONAL_SKILLS.map(skill => ({ ...skill, id: `professional:${skill.slug}` }))
  return {
    ...EMPTY_DATA,
    ...saved,
    paths,
    professionalSkills,
    profile: { ...EMPTY_PROFILE, ...(saved.profile || {}) },
    skillProgress: saved.skillProgress || {},
    projectProgress: saved.projectProgress || {},
    registrations: mergeDemoRecords(saved.registrations, admin.registrations),
    certifications: mergeDemoRecords(saved.certifications, admin.certifications),
    articles: mergeDemoRecords(saved.articles, admin.articles),
    companies: [...DEMO_COMPANIES, ...(admin.companies || []).filter(c => c.verification_status === 'verified')],
    collaborations: (admin.collaborations || []).filter(item => item.verification_status === 'verified'),
    opportunities: [...DEMO_OPPORTUNITIES, ...(admin.opportunities || []).filter(item => item.status === 'published')],
    workshops: (admin.workshops || []).filter(item => item.status === 'published' && (!item.company_id || (admin.companies || []).some(company => company.id === item.company_id && company.verification_status === 'verified'))),
  }
}

function normalizeCareerPath(row, skillRows, resourceRows, projectRows) {
  const template = CAREER_CATALOG.find(path => path.slug === row.slug)
  const dbSkills = skillRows.filter(skill => skill.career_path_id === row.id)
  const skills = dbSkills.length
    ? dbSkills.map(skill => {
      const guide = template?.skills.find(item => item.slug === skill.slug || item.name.toLowerCase() === skill.name.toLowerCase())
      const resources = resourceRows.filter(resource => resource.career_skill_id === skill.id)
      return {
        ...guide,
        ...skill,
        id: skill.id,
        why: guide?.why || skill.why_it_matters,
        topics: guide?.topics?.length ? guide.topics : skill.topics || [],
        resources: resources.length ? resources : guide?.resources || [],
        practice: guide?.practice || `Use ${skill.name} in a small project and record what you learned.`,
      }
    })
    : (template?.skills || []).map(skill => ({ ...skill, id: `${row.id}:${skill.slug}` }))
  const dbProjects = projectRows.filter(project => project.career_path_id === row.id)
  return {
    ...template,
    ...row,
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary || template?.summary || '',
    description: row.description || template?.description || row.summary || '',
    roadmap: row.roadmap?.length ? row.roadmap : template?.roadmap || [],
    skills,
    projects: dbProjects.length ? dbProjects.map(project => ({ ...project, level: project.difficulty, summary: project.description })) : (template?.projects || []).map(project => ({ ...project, id: `${row.id}:project:${slugify(project.title)}` })),
    color: template?.color || 'teal',
  }
}

function resolveBookmark(bookmark, data) {
  const collections = [
    ['career_path_id', 'paths', 'Career path'],
    ['career_project_id', 'projects', 'Project'],
    ['company_id', 'companies', 'Company'],
    ['opportunity_id', 'opportunities', 'Opportunity'],
    ['workshop_id', 'workshops', 'Workshop'],
  ]
  const definition = collections.find(([field]) => bookmark[field])
  if (!definition) return null
  const [field, collection, label] = definition
  const items = collection === 'projects' ? data.paths.flatMap(path => path.projects) : data[collection]
  const item = items.find(value => value.id === bookmark[field])
  return item ? { field, label, item } : null
}

const COMPANY_LOGOS = {
  google: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.33 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.67 14.62 48 24 48z"/>
    </svg>
  ),
  amazon: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <path fill="#FF9900" d="M29.49 32.18c-4.93 3.64-12.08 5.58-18.24 5.58-8.63 0-16.4-3.19-22.27-8.5-.46-.42-.05-1 .51-.67 6.34 3.69 14.18 5.91 22.27 5.91 5.46 0 11.47-1.13 17-3.5.83-.36 1.53.55.73 1.18z"/>
      <path fill="#FF9900" d="M31.64 29.74c-.63-.81-4.18-.38-5.77-.19-.48.06-.56-.36-.12-.67 2.83-1.99 7.47-1.41 8.01-.75.54.67-.14 5.33-2.8 7.55-.41.34-.8.16-.62-.29.6-1.49 1.93-4.84 1.3-5.65z"/>
      <path fill="#232F3E" d="M25.69 8.26V6.03c0-.33.25-.55.55-.55h9.77c.31 0 .56.23.56.55v1.93c0 .31-.27.72-.74 1.36l-5.06 7.23c1.88-.05 3.87.24 5.58 1.2.38.22.49.54.52.85v2.38c0 .32-.35.69-.71.5-2.97-1.56-6.91-1.73-10.19.02-.33.18-.69-.19-.69-.51v-2.26c0-.35.01-.94.36-1.47l5.87-8.42h-5.11c-.31 0-.56-.22-.71-.55z"/>
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <path fill="#F25022" d="M1 1h21v21H1z"/>
      <path fill="#7FBA00" d="M26 1h21v21H26z"/>
      <path fill="#00A4EF" d="M1 26h21v21H1z"/>
      <path fill="#FFB900" d="M26 26h21v21H26z"/>
    </svg>
  ),
  infosys: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#007CC3"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">Infy</text>
    </svg>
  ),
  tcs: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#003087"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">TCS</text>
    </svg>
  ),
  wipro: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#341C6E"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial,sans-serif">wipro</text>
    </svg>
  ),
  hcl: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#0076CE"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">HCL</text>
    </svg>
  ),
  accenture: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#A100FF"/>
      <path fill="white" d="M24 10 L36 38 H28 L24 28 L20 38 H12 Z"/>
    </svg>
  ),
  cognizant: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#1A6496"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial,sans-serif">CTS</text>
    </svg>
  ),
  meta: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <path fill="#0866FF" d="M6 24c0-7.18 3.76-13.5 9.4-16.5C18.1 6.1 21 8.5 21 12v24c0 3.5-2.9 5.9-5.6 4.5C9.76 37.5 6 31.18 6 24z"/>
      <path fill="#0866FF" d="M42 24c0-7.18-3.76-13.5-9.4-16.5C29.9 6.1 27 8.5 27 12v24c0 3.5 2.9 5.9 5.6 4.5C38.24 37.5 42 31.18 42 24z"/>
      <ellipse fill="#0866FF" cx="24" cy="24" rx="6" ry="12"/>
    </svg>
  ),
  flipkart: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <rect width="48" height="48" rx="8" fill="#F74D00"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial,sans-serif">Fkart</text>
    </svg>
  ),
  adobe: (
    <svg viewBox="0 0 48 48" width="28" height="28">
      <path fill="#FF0000" d="M28.3 4H44v40L28.3 4zM19.7 4H4v40L19.7 4zM24 17.8L33.5 44h-6.7l-2.8-7.8h-8.9L24 17.8z"/>
    </svg>
  ),
}

function CompanyCard({ company, collaborations, isBookmarked: bookmarked, onBookmark, onOpen }) {
  const cardRef = useRef(null)
  const [clicked, setClicked] = useState(false)
  const [ripple, setRipple] = useState(null)

  function handleClick(e) {
    const rect = cardRef.current.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setClicked(true)
    setTimeout(() => setClicked(false), 400)
    setTimeout(() => setRipple(null), 600)
    onOpen()
  }

  const logo = COMPANY_LOGOS[company.id]
  const collabs = collaborations.filter(item => item.company_id === company.id && item.verification_status === 'verified')

  return (
    <article
      ref={cardRef}
      className={`career-company-card ${clicked ? 'company-clicked' : ''}`}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
      onClick={handleClick}
    >
      {ripple && (
        <span
          className="company-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="company-logo-wrap">
          {logo || (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-lg" style={{ background: company.logo_color || '#176154' }}>
              {company.name[0]}
            </div>
          )}
        </div>
        <span className="career-verified"><CheckCircle2 size={13} />Verified</span>
      </div>
      <h3 className="career-display mt-3 text-xl">{company.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{company.industry || 'Industry not listed'}</p>
      <p className="mt-3 text-sm leading-6 text-gray-600 company-desc">{company.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {collabs.map(item => <span key={item.id} className="career-chip">{item.collaboration_type}</span>)}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-3">
        <span className="career-text-button">Company profile <ArrowRight size={14} /></span>
        <button
          type="button"
          className={`career-icon-button ${bookmarked ? 'is-saved' : ''}`}
          onClick={e => { e.stopPropagation(); onBookmark() }}
          aria-label="Bookmark company"
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}

function ProgressBar({ value, label }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        {label && <span className="text-gray-600">{label}</span>}
        <span className="ml-auto font-semibold text-gray-800">{value}%</span>
      </div>
      <div className="career-progress-track" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100" aria-label={label || 'Progress'}>
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function EmptyNotice({ title, detail }) {
  return <div className="career-empty"><Sparkles size={20} /><p className="font-semibold">{title}</p><p>{detail}</p></div>
}

function Dialog({ title, onClose, children, wide = false }) {
  return (
    <div className="career-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`career-dialog ${wide ? 'career-dialog-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="career-icon-button" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="pt-4">{children}</div>
      </section>
    </div>
  )
}

export default function CareerHub() {
  const { user } = useAuth()
  const toast = useToast()
  const [data, setData] = useState(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPathId, setSelectedPathId] = useState('')
  const [showPathDetail, setShowPathDetail] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [selectedStage, setSelectedStage] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [opportunityFilter, setOpportunityFilter] = useState('All')
  const [projectDifficulty, setProjectDifficulty] = useState('All')
  const [details, setDetails] = useState(null)
  const [projectDraft, setProjectDraft] = useState({ repository_url: '', live_url: '', reflection: '' })
  const [profileDraft, setProfileDraft] = useState(EMPTY_PROFILE)
  const [storyDraft, setStoryDraft] = useState({ title: '', summary: '', content: '', skills_learned: '' })
  const [certDraft, setCertDraft] = useState({ name: '', provider: '', issued_at: '', credential_url: '' })
  const [interviewAnswer, setInterviewAnswer] = useState('')
  const [interviewQuestion, setInterviewQuestion] = useState(INTERVIEW_QUESTIONS[0])
  const [interviewScores, setInterviewScores] = useState({ communication: 3, clarity: 3, structure: 3 })
  const [busy, setBusy] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError('')
      if (user?.isDemo) {
        const demo = getDemoData()
        if (active) {
          setData(demo)
          setProfileDraft(demo.profile)
          setSelectedPathId(demo.profile.selected_career_path_id || demo.paths[0]?.id || '')
          setLoading(false)
        }
        return
      }
      if (!supabase) {
        if (active) {
          setLoadError('Career Hub needs a configured Supabase connection. Sign in with your campus account or enable the local demo account.')
          setLoading(false)
        }
        return
      }
      try {
        const responses = await Promise.all([
          supabase.from('career_paths').select('*').eq('is_active', true).order('title'),
          supabase.from('career_skills').select('*').order('sort_order'),
          supabase.from('skill_resources').select('*').order('sort_order'),
          supabase.from('career_projects').select('*').order('created_at'),
          supabase.from('student_career_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('student_skill_progress').select('*').eq('user_id', user.id),
          supabase.from('student_project_progress').select('*').eq('user_id', user.id),
          supabase.from('student_career_bookmarks').select('*').eq('user_id', user.id),
          supabase.from('companies').select('*').order('name'),
          supabase.from('company_collaborations').select('*').order('created_at', { ascending: false }),
          supabase.from('career_opportunities').select('*').order('deadline'),
          supabase.from('workshops').select('*').order('starts_at'),
          supabase.from('workshop_registrations').select('*').eq('user_id', user.id),
          supabase.from('certifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('career_articles').select('*').order('published_at', { ascending: false }),
          supabase.from('student_interview_practice').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        ])
        const failed = responses.find(response => response.error)
        if (failed) throw new Error(failed.error.message)
        const [pathRows, skillRows, resourceRows, projectRows, profileResponse, skillProgressRows, projectProgressRows, bookmarks, companies, collaborations, opportunities, workshops, registrations, certifications, articles, interviewPractice] = responses.map(response => response.data)
        const paths = (pathRows || []).map(path => normalizeCareerPath(path, skillRows || [], resourceRows || [], projectRows || []))
        const professionalSkills = (skillRows || []).filter(skill => skill.category === 'professional').map(skill => {
          const guide = PROFESSIONAL_SKILLS.find(item => item.name.toLowerCase() === skill.name.toLowerCase())
          return { ...guide, ...skill, id: skill.id, why: guide?.why || skill.why_it_matters, topics: guide?.topics || skill.topics || [] }
        })
        const progress = Object.fromEntries((skillProgressRows || []).map(row => [row.career_skill_id, { progress: row.progress, status: row.status }]))
        const projectProgress = Object.fromEntries((projectProgressRows || []).map(row => [row.career_project_id, row]))
        const profile = { ...EMPTY_PROFILE, ...(profileResponse || {}) }
        const next = {
          ...EMPTY_DATA,
          paths,
          professionalSkills,
          skillProgress: progress,
          projectProgress,
          profile,
          bookmarks: bookmarks || [],
          companies: companies || [],
          collaborations: collaborations || [],
          opportunities: opportunities || [],
          workshops: workshops || [],
          registrations: registrations || [],
          certifications: certifications || [],
          articles: articles || [],
          interviewPractice: interviewPractice || [],
        }
        if (!active) return
        setData(next)
        setProfileDraft(profile)
        setSelectedPathId(profile.selected_career_path_id || paths[0]?.id || '')
      } catch (error) {
        if (active) setLoadError(`Career Hub data could not be loaded. Apply supabase/career_hub.sql after production_hardening.sql. ${error.message}`)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user])

  const selectedPath = data.paths.find(path => path.id === selectedPathId) || data.paths.find(path => path.id === data.profile.selected_career_path_id) || data.paths[0]
  const allSkills = useMemo(() => [...data.paths.flatMap(path => path.skills || []), ...data.professionalSkills], [data.paths, data.professionalSkills])
  const completedSkills = allSkills.filter(skill => data.skillProgress[skill.id]?.status === 'completed')
  const trackedSkills = allSkills.filter(skill => data.skillProgress[skill.id]?.progress > 0)
  const overallProgress = allSkills.length ? Math.round(allSkills.reduce((total, skill) => total + (data.skillProgress[skill.id]?.progress || 0), 0) / allSkills.length) : 0
  const studentSkills = [...new Set([...(data.profile.skills || []), ...completedSkills.map(skill => skill.name)])]
  const nextSkill = selectedPath?.skills?.find(skill => data.skillProgress[skill.id]?.status !== 'completed')
  const careerCompletion = selectedPath?.skills?.length
    ? Math.round(selectedPath.skills.reduce((total, skill) => total + (data.skillProgress[skill.id]?.progress || 0), 0) / selectedPath.skills.length)
    : 0
  const categories = ['All', ...new Set(data.paths.map(path => path.category).filter(Boolean))]
  const matchingPaths = data.paths.filter(path => {
    const matchesSearch = !search || `${path.title} ${path.category} ${path.summary} ${path.skills.map(skill => skill.name).join(' ')}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (categoryFilter === 'All' || path.category === categoryFilter)
  })
  const matchingOpportunities = data.opportunities.filter(opportunity => {
    const company = data.companies.find(item => item.id === opportunity.company_id)
    const searchable = `${opportunity.title} ${opportunity.role} ${opportunity.location} ${company?.name || ''} ${(opportunity.required_skills || []).join(' ')}`.toLowerCase()
    const typeMatches = opportunityFilter === 'All' || opportunity.opportunity_type === opportunityFilter
    const modeMatches = !['Remote', 'On Campus'].includes(opportunityFilter) || (opportunityFilter === 'Remote' ? opportunity.mode === 'remote' : opportunity.mode === 'on_campus')
    return typeMatches && modeMatches && (!search || searchable.includes(search.toLowerCase()))
  })
  const visibleProjects = data.paths
    .filter(path => !selectedPathId || path.id === selectedPathId)
    .flatMap(path => path.projects.filter(project => {
      const searchable = `${path.title} ${project.title} ${project.level} ${project.description || project.summary} ${(project.requirements || []).join(' ')}`.toLowerCase()
      return (projectDifficulty === 'All' || project.difficulty === projectDifficulty || project.level === projectDifficulty) && (!search || searchable.includes(search.toLowerCase()))
    }).map(project => ({ path, project })))
  const visibleWorkshops = data.workshops.filter(workshop => !search || `${workshop.title} ${workshop.organizer} ${workshop.description} ${(workshop.topics || []).join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  const savedItems = data.bookmarks.map(bookmark => ({ bookmark, ...resolveBookmark(bookmark, data) })).filter(saved => saved.item)

  function commit(patch) {
    setData(previous => {
      const next = { ...previous, ...patch }
      if (user?.isDemo) localStorage.setItem(DEMO_STUDENT_KEY, JSON.stringify(next))
      return next
    })
  }

  function progressFor(skill) {
    return data.skillProgress[skill.id] || { status: 'not_started', progress: 0 }
  }

  async function chooseCareer(path) {
    setSelectedPathId(path.id)
    setSelectedStage('')
    setSelectedSkill(null)
    const profile = { ...data.profile, selected_career_path_id: path.id }
    if (!user?.isDemo) {
      setBusy('career')
      const { error } = await supabase.from('student_career_profiles').upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      setBusy('')
      if (error) { toast(error.message, 'error'); return }
    }
    commit({ profile })
    if (user?.isDemo) syncDemoAdminRecord('studentProfiles', { id: user.id, user_id: user.id })
    toast(`${path.title} is now your selected path.`, 'success')
  }

  async function saveSkillProgress(skill, status, amount) {
    const current = progressFor(skill)
    const progress = status === 'completed' ? 100 : Math.max(current.progress || 0, amount ?? 25)
    const next = { status: progress === 100 ? 'completed' : 'in_progress', progress }
    if (!user?.isDemo) {
      setBusy(`skill-${skill.id}`)
      const { error } = await supabase.from('student_skill_progress').upsert({ user_id: user.id, career_skill_id: skill.id, ...next, updated_at: new Date().toISOString() }, { onConflict: 'user_id,career_skill_id' })
      setBusy('')
      if (error) { toast(error.message, 'error'); return }
    }
    commit({ skillProgress: { ...data.skillProgress, [skill.id]: next } })
    if (user?.isDemo) syncDemoAdminRecord('studentProfiles', { id: user.id, user_id: user.id })
    toast(next.status === 'completed' ? `${skill.name} marked complete.` : `${skill.name} added to your learning plan.`, 'success')
  }

  async function advanceProfessional(skill) {
    const current = progressFor(skill)
    const nextProgress = current.progress >= 100 ? 100 : Math.min(100, (current.progress || 0) + 30)
    await saveSkillProgress(skill, nextProgress === 100 ? 'completed' : 'in_progress', nextProgress)
  }

  async function saveProjectProgress(project, fields) {
    const previous = data.projectProgress[project.id] || {}
    const row = { ...previous, ...fields, career_project_id: project.id, user_id: user.id, updated_at: new Date().toISOString() }
    if (!user?.isDemo) {
      setBusy(`project-${project.id}`)
      const { error } = await supabase.from('student_project_progress').upsert(row, { onConflict: 'user_id,career_project_id' })
      setBusy('')
      if (error) { toast(error.message, 'error'); return false }
    }
    commit({ projectProgress: { ...data.projectProgress, [project.id]: row } })
    if (user?.isDemo) syncDemoAdminRecord('studentProfiles', { id: user.id, user_id: user.id })
    return true
  }

  async function toggleBookmark(field, id) {
    const existing = data.bookmarks.find(bookmark => bookmark[field] === id)
    if (!user?.isDemo) {
      setBusy(`bookmark-${id}`)
      const response = existing
        ? await supabase.from('student_career_bookmarks').delete().eq('user_id', user.id).eq(field, id)
        : await supabase.from('student_career_bookmarks').insert({ user_id: user.id, [field]: id })
      setBusy('')
      if (response.error) { toast(response.error.message, 'error'); return }
    }
    const bookmarks = existing ? data.bookmarks.filter(bookmark => bookmark[field] !== id) : [...data.bookmarks, { user_id: user.id, [field]: id }]
    commit({ bookmarks })
    toast(existing ? 'Bookmark removed.' : 'Saved to your bookmarks.', 'success')
  }

  async function saveCareerProfile(event) {
    event.preventDefault()
    const profile = {
      ...data.profile,
      ...profileDraft,
      skills: String(profileDraft.skillsInput ?? (profileDraft.skills || []).join(',')).split(',').map(value => value.trim()).filter(Boolean),
      achievements: String(profileDraft.achievementsInput ?? (profileDraft.achievements || []).join('\n')).split('\n').map(value => value.trim()).filter(Boolean),
      internships: String(profileDraft.internshipsInput ?? (profileDraft.internships || []).join('\n')).split('\n').map(value => value.trim()).filter(Boolean),
      selected_career_path_id: selectedPath?.id || '',
    }
    delete profile.skillsInput
    delete profile.achievementsInput
    delete profile.internshipsInput
    setBusy('profile')
    if (!user?.isDemo) {
      const { error } = await supabase.from('student_career_profiles').upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (error) { setBusy(''); toast(error.message, 'error'); return }
    }
    commit({ profile })
    if (user?.isDemo) syncDemoAdminRecord('studentProfiles', { id: user.id, user_id: user.id })
    setProfileDraft(profile)
    setBusy('')
    toast('Career profile saved.', 'success')
  }

  async function uploadResume(file) {
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { toast('Keep resume uploads under 8 MB.', 'warning'); return }
    setBusy('resume')
    let resumePath = file.name
    if (!user?.isDemo) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      resumePath = `${user.id}/resume/${crypto.randomUUID()}-${safeName}`
      const { error } = await supabase.storage.from('career-files').upload(resumePath, file, { upsert: false })
      if (error) { setBusy(''); toast(error.message, 'error'); return }
    }
    const profile = { ...data.profile, resume_path: resumePath }
    if (!user?.isDemo) {
      const { error } = await supabase.from('student_career_profiles').upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (error) { setBusy(''); toast(error.message, 'error'); return }
    }
    commit({ profile })
    setProfileDraft(profile)
    setBusy('')
    toast('Resume uploaded.', 'success')
  }

  async function addCertification(event) {
    event.preventDefault()
    if (!certDraft.name.trim()) { toast('Add a certification name first.', 'warning'); return }
    const form = event.currentTarget
    const file = form.elements.certificate.files[0]
    setBusy('certification')
    let filePath = file?.name || ''
    if (!user?.isDemo && file) {
      if (file.size > 8 * 1024 * 1024) { setBusy(''); toast('Keep certificate uploads under 8 MB.', 'warning'); return }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      filePath = `${user.id}/certificates/${crypto.randomUUID()}-${safeName}`
      const { error } = await supabase.storage.from('career-files').upload(filePath, file, { upsert: false })
      if (error) { setBusy(''); toast(error.message, 'error'); return }
    }
    const certification = { user_id: user.id, name: certDraft.name.trim(), provider: certDraft.provider.trim(), issued_at: certDraft.issued_at || null, credential_url: certDraft.credential_url.trim(), file_path: filePath, verification_status: 'pending', created_at: new Date().toISOString(), id: crypto.randomUUID() }
    if (!user?.isDemo) {
      const { data: created, error } = await supabase.from('certifications').insert(certification).select().single()
      if (error) { setBusy(''); toast(error.message, 'error'); return }
      certification.id = created.id
    }
    commit({ certifications: [certification, ...data.certifications] })
    if (user?.isDemo) syncDemoAdminRecord('certifications', certification)
    setCertDraft({ name: '', provider: '', issued_at: '', credential_url: '' })
    setBusy('')
    form.reset()
    toast('Certification added for review.', 'success')
  }

  async function registerWorkshop(workshop) {
    const existing = data.registrations.find(item => item.workshop_id === workshop.id)
    const status = existing?.status === 'registered' ? 'cancelled' : 'registered'
    setBusy(`workshop-${workshop.id}`)
    if (!user?.isDemo) {
      const response = existing
        ? await supabase.from('workshop_registrations').update({ status }).eq('id', existing.id).select().single()
        : await supabase.from('workshop_registrations').insert({ workshop_id: workshop.id, user_id: user.id, status }).select().single()
      if (response.error) { setBusy(''); toast(response.error.message, 'error'); return }
      const registrations = existing
        ? data.registrations.map(item => item.id === existing.id ? response.data : item)
        : [response.data, ...data.registrations]
      commit({ registrations })
    } else {
      const registration = { ...(existing || {}), id: existing?.id || crypto.randomUUID(), workshop_id: workshop.id, user_id: user.id, status }
      const registrations = existing ? data.registrations.map(item => item.id === existing.id ? registration : item) : [registration, ...data.registrations]
      commit({ registrations })
      syncDemoAdminRecord('registrations', registration)
    }
    setBusy('')
    toast(status === 'registered' ? 'You are registered for this workshop.' : 'Workshop registration cancelled.', 'success')
  }

  async function submitStory(event) {
    event.preventDefault()
    if (!storyDraft.title.trim() || !storyDraft.content.trim()) { toast('Add a title and story before submitting.', 'warning'); return }
    setBusy('story')
    const article = {
      author_id: user.id,
      author_display: user.name || 'Student',
      title: storyDraft.title.trim(),
      category: 'Career story',
      summary: storyDraft.summary.trim(),
      content: storyDraft.content.trim(),
      skills_learned: storyDraft.skills_learned.split(',').map(value => value.trim()).filter(Boolean),
      project_count: Object.values(data.projectProgress).filter(project => ['submitted', 'completed'].includes(project.status)).length,
      status: 'pending',
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    if (!user?.isDemo) {
      const { data: created, error } = await supabase.from('career_articles').insert(article).select().single()
      if (error) { setBusy(''); toast(error.message, 'error'); return }
      article.id = created.id
    }
    commit({ articles: [article, ...data.articles] })
    if (user?.isDemo) syncDemoAdminRecord('articles', article)
    setStoryDraft({ title: '', summary: '', content: '', skills_learned: '' })
    setBusy('')
    toast('Career story sent to the campus team for review.', 'success')
  }

  async function saveInterviewPractice(event) {
    event.preventDefault()
    if (!interviewAnswer.trim()) { toast('Write a practice answer before saving.', 'warning'); return }
    setBusy('interview')
    const practice = {
      user_id: user.id,
      question: interviewQuestion.question,
      category: interviewQuestion.category,
      answer: interviewAnswer.trim(),
      communication_score: Number(interviewScores.communication),
      clarity_score: Number(interviewScores.clarity),
      structure_score: Number(interviewScores.structure),
      created_at: new Date().toISOString(),
      id: crypto.randomUUID(),
    }
    if (!user?.isDemo) {
      const { data: created, error } = await supabase.from('student_interview_practice').insert(practice).select().single()
      if (error) { setBusy(''); toast(error.message, 'error'); return }
      practice.id = created.id
    }
    commit({ interviewPractice: [practice, ...data.interviewPractice] })
    setBusy('')
    toast('Practice answer saved. Review your self-ratings before your next attempt.', 'success')
  }

  async function openPrivateFile(path) {
    if (!path) return
    if (user?.isDemo) { toast(`Demo file: ${path}`, 'info'); return }
    const { data: signed, error } = await supabase.storage.from('career-files').createSignedUrl(path, 300)
    if (error) { toast(error.message, 'error'); return }
    window.open(signed.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function downloadResume() {
    const projects = Object.entries(data.projectProgress).filter(([, progress]) => ['submitted', 'completed'].includes(progress.status)).map(([id]) => data.paths.flatMap(path => path.projects).find(project => project.id === id)?.title).filter(Boolean)
    const lines = [user?.name || 'Student', profileDraft.headline || selectedPath?.title || 'Career profile', user?.department || '', profileDraft.about || '', '', 'Skills', (profileDraft.skills || []).join(', '), '', 'Projects', ...(projects.length ? projects : ['Add a project from Career Hub to include it here.']), '', 'Achievements', ...(profileDraft.achievements || []), '', 'Experience', ...(profileDraft.internships || []), '', 'Links', profileDraft.github_url, profileDraft.linkedin_url, profileDraft.portfolio_url].filter(value => value !== undefined)
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${slugify(user?.name || 'student')}-career-profile.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  function isBookmarked(field, id) {
    return data.bookmarks.some(bookmark => bookmark[field] === id)
  }

  function openSavedItem(saved) {
    const { field, item } = saved
    if (field === 'career_path_id') {
      setSelectedPathId(item.id)
      setShowPathDetail(true)
      setActiveTab('explore')
    } else if (field === 'career_project_id') {
      const path = data.paths.find(candidate => candidate.projects.some(project => project.id === item.id))
      if (path) setSelectedPathId(path.id)
      setDetails({ kind: 'project', item })
      setActiveTab('projects')
    } else if (field === 'company_id') {
      setDetails({ kind: 'company', item })
      setActiveTab('companies')
    } else if (field === 'opportunity_id') {
      setDetails({ kind: 'opportunity', item })
      setActiveTab('opportunities')
    } else {
      setActiveTab('campus')
    }
  }

  function renderSkillDetail(skill) {
    if (!skill) return null
    const progress = progressFor(skill)
    const resources = skill.resources || []
    return (
      <section className="career-detail-panel" aria-label={`${skill.name} learning details`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="career-eyebrow">Skill guide</p><h3 className="career-display text-2xl">{skill.name}</h3></div>
          <button type="button" className="career-icon-button" onClick={() => setSelectedSkill(null)} aria-label="Close skill details"><X size={17} /></button>
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600">{skill.why || skill.why_it_matters}</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div><h4 className="career-label">What to learn</h4><ul className="mt-2 space-y-2">{(skill.topics || []).map(topic => <li key={topic} className="flex items-center gap-2 text-sm text-gray-700"><span className="career-bullet" />{topic}</li>)}</ul></div>
          <div><h4 className="career-label">Practice</h4><p className="mt-2 text-sm leading-6 text-gray-600">{skill.practice}</p><div className="mt-3 flex flex-wrap gap-2">{resources.map(resource => <a key={`${resource.url}-${resource.title}`} href={resource.url} target="_blank" rel="noreferrer" className="career-resource-link"><ExternalLink size={13} />{resource.type || resource.resource_type || 'Learn'}<span className="sr-only">: {resource.title}</span></a>)}</div></div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
          <button type="button" onClick={() => saveSkillProgress(skill, 'in_progress', Math.max(progress.progress || 0, 25))} disabled={busy === `skill-${skill.id}`} className="career-button career-button-dark"><Play size={14} />Start learning</button>
          <button type="button" onClick={() => saveSkillProgress(skill, 'in_progress', Math.min(90, (progress.progress || 0) + 25))} disabled={busy === `skill-${skill.id}`} className="career-button career-button-light">Practice</button>
          <button type="button" onClick={() => saveSkillProgress(skill, 'completed', 100)} disabled={progress.status === 'completed' || busy === `skill-${skill.id}`} className="career-button career-button-light"><Check size={14} />{progress.status === 'completed' ? 'Completed' : 'Mark complete'}</button>
          <span className="ml-auto min-w-24"><ProgressBar value={progress.progress || 0} /></span>
        </div>
      </section>
    )
  }

  function renderCareerCards(paths) {
    if (!paths.length) return <EmptyNotice title="No paths match that search" detail="Try a different career, skill, or category." />
    return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {paths.map((path, index) => (
        <article key={path.id} className={`career-path-card career-color-${path.color || 'teal'}`} style={{ animationDelay: `${Math.min(index, 7) * 35}ms` }}>
          <div className="flex items-start justify-between gap-3"><span className="career-chip">{path.category}</span><button type="button" className={`career-icon-button ${isBookmarked('career_path_id', path.id) ? 'is-saved' : ''}`} onClick={() => toggleBookmark('career_path_id', path.id)} title={isBookmarked('career_path_id', path.id) ? 'Remove bookmark' : 'Bookmark career path'} aria-label={isBookmarked('career_path_id', path.id) ? 'Remove bookmark' : 'Bookmark career path'}><Bookmark size={17} fill={isBookmarked('career_path_id', path.id) ? 'currentColor' : 'none'} /></button></div>
          <h3 className="career-display mt-5 text-xl">{path.title}</h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-gray-600">{path.summary}</p>
          <div className="mt-4 flex min-h-14 flex-wrap content-start gap-1.5">{path.skills.slice(0, 6).map(skill => <button type="button" key={skill.id} className="career-skill-chip" onClick={() => { setSelectedPathId(path.id); setSelectedSkill(skill); setShowPathDetail(true); setActiveTab('explore') }}>{skill.name}</button>)}</div>
          <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-3"><span className="text-xs text-gray-500">{path.roadmap.length} roadmap stages · {path.projects.length} projects</span><button type="button" className="career-text-button" onClick={() => { setSelectedPathId(path.id); setSelectedSkill(null); setShowPathDetail(true); setActiveTab('explore') }}>Explore path <ArrowRight size={14} /></button></div>
        </article>
      ))}
    </div>
  }

  function renderOpportunityCard(opportunity) {
    const company = data.companies.find(item => item.id === opportunity.company_id)
    const match = getOpportunityMatch(opportunity.required_skills || [], studentSkills)
    const bookmark = isBookmarked('opportunity_id', opportunity.id)
    return (
      <article className="career-listing" key={opportunity.id}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="career-chip">{opportunity.opportunity_type}</span>{opportunity.mode && <span className="career-chip career-chip-muted">{opportunity.mode.replace('_', ' ')}</span>}{company && <span className="career-verified"><CheckCircle2 size={13} />Verified campus partner</span>}</div>
          <h3 className="mt-3 text-lg font-bold text-gray-900">{opportunity.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{company?.name || opportunity.organizer || 'Campus opportunity'}{opportunity.role ? ` · ${opportunity.role}` : ''}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500"><span className="inline-flex items-center gap-1"><MapPin size={13} />{opportunity.location || 'Location not listed'}</span><span>{opportunity.deadline ? `Apply by ${new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString()}` : 'No deadline listed'}</span></div>
          {opportunity.required_skills?.length > 0 && <div className="mt-3"><p className="text-xs font-semibold text-gray-700">{match.percent}% skill match <span className="font-normal text-gray-500">· skills-based suggestion, not a hiring decision</span></p><ProgressBar value={match.percent} /><p className="mt-1 text-xs text-gray-500">{match.missing.length ? `Consider learning: ${match.missing.slice(0, 3).join(', ')}` : 'Your listed skills cover the requirements.'}</p></div>}
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start"><button type="button" className={`career-icon-button ${bookmark ? 'is-saved' : ''}`} onClick={() => toggleBookmark('opportunity_id', opportunity.id)} aria-label={bookmark ? 'Remove opportunity bookmark' : 'Bookmark opportunity'}><Bookmark size={17} fill={bookmark ? 'currentColor' : 'none'} /></button><button type="button" className="career-button career-button-light" onClick={() => setDetails({ kind: 'opportunity', item: opportunity })}>Details <ChevronRight size={14} /></button></div>
      </article>
    )
  }

  if (loading) return <div className="career-loading"><LoaderCircle size={20} className="animate-spin" />Loading your Career Hub…</div>
  if (loadError) return <div className="career-shell"><div className="career-alert" role="alert"><strong>Career Hub is not ready.</strong><p>{loadError}</p><button type="button" onClick={() => window.location.reload()} className="career-button career-button-dark">Try again</button></div></div>

  const filteredCompanies = data.companies.filter(company => !search || `${company.name} ${company.industry} ${company.description}`.toLowerCase().includes(search.toLowerCase()))
  const selectedInterviewPractice = data.interviewPractice.find(item => item.question === interviewQuestion.question)
  const selectedOpportunity = details?.kind === 'opportunity' ? details.item : null
  const selectedCompany = details?.kind === 'company' ? details.item : null

  return (
    <div className="career-shell">
      <header className="career-hero">
        <div className="career-hero-copy">
          <p className="career-eyebrow">Student development · CampusPlus</p>
          <h1 className="career-display">Build your career.</h1>
          <p>Explore career paths, learn the right skills, build projects, improve communication and discover opportunities connected to your campus.</p>
          <form className="career-search" onSubmit={event => { event.preventDefault(); setShowPathDetail(false); setActiveTab('explore') }}>
            <Search size={18} aria-hidden="true" />
            <input aria-label="Search careers and skills" value={search} onChange={event => setSearch(event.target.value)} placeholder="What do you want to become?" />
            <button type="submit">Search careers <ArrowRight size={15} /></button>
          </form>
          <p className="career-search-examples">Try: Software Developer · AI/ML Engineer · Game Developer · UI/UX Designer</p>
        </div>
        <div className="career-hero-aside" aria-label="Your current learning progress">
          <span className="career-hero-mark"><GraduationCap size={22} /></span>
          <p className="career-aside-caption">Your learning, your pace</p>
          <strong>{overallProgress}%</strong>
          <ProgressBar value={overallProgress} label="Overall progress" />
          <p>{completedSkills.length} skills completed · {trackedSkills.length} in progress</p>
          {selectedPath && <button type="button" onClick={() => { setShowPathDetail(true); setActiveTab('explore') }} className="career-hero-link">{selectedPath.title} <ArrowRight size={14} /></button>}
        </div>
      </header>

      <nav className="career-tabs" aria-label="Career Hub sections">
        {TABS.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => { setActiveTab(id); if (id === 'explore') setShowPathDetail(false) }} className={activeTab === id ? 'active' : ''}><Icon size={15} />{label}</button>)}
      </nav>

      {activeTab === 'campus' && <div className="career-search-secondary mb-3"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search workshops and topics" aria-label="Search workshops" /></div>}
      {activeTab === 'companies' && <div className="career-search-secondary mb-3"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search verified companies or industries" aria-label="Search verified companies" /></div>}

      {activeTab === 'overview' && savedItems.length > 0 && <section className="mb-5 border-y border-gray-200 py-3" aria-label="Saved Career Hub items"><div className="mb-2 flex items-center justify-between"><div><p className="career-eyebrow">Saved for later</p><h2 className="career-display mt-1 text-lg">Your bookmarks</h2></div><span className="career-chip">{savedItems.length} saved</span></div><div className="divide-y divide-gray-100">{savedItems.map(saved => <div key={`${saved.field}-${saved.item.id}`} className="flex items-center gap-3 py-2"><span className="career-skill-check"><Bookmark size={14} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">{saved.item.title || saved.item.name}</p><p className="text-xs text-gray-500">{saved.label}</p></div><button type="button" className="career-text-button" onClick={() => openSavedItem(saved)}>Open <ArrowRight size={14} /></button><button type="button" className="career-icon-button" aria-label={`Remove ${saved.label.toLowerCase()} bookmark`} onClick={() => toggleBookmark(saved.field, saved.item.id)}><X size={14} /></button></div>)}</div></section>}

      {activeTab === 'overview' && <section className="career-overview">
        <div className="career-overview-heading"><div><p className="career-eyebrow">A practical next step</p><h2 className="career-display text-2xl">Your path, in progress</h2></div><button type="button" onClick={() => setActiveTab('profile')} className="career-text-button">Edit career profile <ArrowRight size={14} /></button></div>
        <div className="career-overview-grid">
          <article className="career-progress-feature">
            {selectedPath ? <>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="career-chip">Selected career</span><h3 className="career-display mt-3 text-2xl">{selectedPath.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{selectedPath.summary}</p></div><span className="career-score">{careerCompletion}%</span></div>
              <div className="mt-5"><ProgressBar value={careerCompletion} label="Career roadmap" /></div>
              <div className="mt-5 flex flex-wrap items-center gap-2"><span className="text-xs text-white/70">Recommended next:</span><strong className="text-sm">{nextSkill?.name || 'Choose a new learning goal'}</strong><button type="button" className="career-outline-button" onClick={() => { setShowPathDetail(true); setActiveTab('explore'); if (nextSkill) setSelectedSkill(nextSkill) }}>Continue <ArrowRight size={14} /></button></div>
            </> : <EmptyNotice title="Choose a career path to get started" detail="Pick a direction that interests you. You can change it any time." />}
          </article>
          <div className="career-stat-stack">
            <div className="career-stat"><span><CheckCircle2 size={17} /></span><strong>{completedSkills.length}</strong><p>Skills completed</p></div>
            <div className="career-stat"><span><BriefcaseBusiness size={17} /></span><strong>{Object.values(data.projectProgress).filter(project => ['submitted', 'completed'].includes(project.status)).length}</strong><p>Projects submitted</p></div>
            <div className="career-stat"><span><Award size={17} /></span><strong>{data.certifications.length}</strong><p>Certifications added</p></div>
          </div>
        </div>
        <div className="career-recommendation-grid">
          <section><div className="career-section-heading"><div><p className="career-eyebrow">Explore</p><h3 className="career-display text-xl">Paths worth a look</h3></div><button type="button" className="career-text-button" onClick={() => { setShowPathDetail(false); setActiveTab('explore') }}>All paths <ArrowRight size={14} /></button></div>{renderCareerCards(data.paths.filter(path => path.id !== selectedPath?.id).slice(0, 3))}</section>
          <section className="career-next-panel"><p className="career-eyebrow">Recommended for you</p><h3 className="career-display text-xl">Small steps add up.</h3><p>Recommendations use your selected path, saved skill progress, and published campus listings. They are learning suggestions, not job suitability scores.</p>{nextSkill && <button type="button" onClick={() => { setShowPathDetail(true); setActiveTab('explore'); setSelectedSkill(nextSkill) }} className="career-next-link"><BookOpen size={16} />Learn {nextSkill.name}<ArrowRight size={15} /></button>}{data.opportunities[0] && <button type="button" onClick={() => setActiveTab('opportunities')} className="career-next-link"><BriefcaseBusiness size={16} />View campus opportunities<ArrowRight size={15} /></button>}{data.workshops[0] && <button type="button" onClick={() => setActiveTab('campus')} className="career-next-link"><CalendarDays size={16} />Upcoming campus workshop<ArrowRight size={15} /></button>}</section>
        </div>
      </section>}

      {activeTab === 'explore' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">Career roadmap</p><h2 className="career-display text-2xl">Explore career paths</h2></div><label className="career-filter"><span className="sr-only">Filter career category</span><select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>{categories.map(category => <option key={category}>{category}</option>)}</select></label></div>
        {showPathDetail && selectedPath ? <div className="career-path-detail">
          <div className="career-path-detail-head"><button type="button" className="career-back-button" onClick={() => { setShowPathDetail(false); setSelectedSkill(null); setSelectedStage('') }}><ArrowRight size={14} />All career paths</button><button type="button" className={`career-icon-button ${isBookmarked('career_path_id', selectedPath.id) ? 'is-saved' : ''}`} onClick={() => toggleBookmark('career_path_id', selectedPath.id)} aria-label="Bookmark career path"><Bookmark size={17} fill={isBookmarked('career_path_id', selectedPath.id) ? 'currentColor' : 'none'} /></button></div>
          <p className="career-eyebrow mt-5">{selectedPath.category} · Career guide</p><h2 className="career-display mt-1 text-3xl">{selectedPath.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{selectedPath.description}</p>
          <div className="career-roadmap-block"><div className="career-section-heading"><div><p className="career-eyebrow">Progressive roadmap</p><h3 className="career-display text-xl">Build one layer at a time</h3></div><span className="career-chip">{selectedPath.roadmap.length} levels</span></div><div className="career-roadmap">{selectedPath.roadmap.map((stage, index) => {
            const matchedSkill = selectedPath.skills.find(skill => stage.toLowerCase().includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(stage.toLowerCase().split(' + ')[0]))
            const stageProgress = matchedSkill ? progressFor(matchedSkill) : null
            return <button type="button" className={`career-roadmap-step ${selectedStage === stage ? 'selected' : ''}`} key={`${stage}-${index}`} onClick={() => { setSelectedStage(stage); setSelectedSkill(matchedSkill || null) }}><span className="career-step-number">{stageProgress?.status === 'completed' ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span><span><small>LEVEL {index + 1}</small><strong>{stage}</strong></span><ChevronRight size={15} /></button>
          })}</div>{selectedStage && <div className="career-stage-note"><strong>{selectedStage}</strong><p>{selectedSkill ? `Open the ${selectedSkill.name} guide below to learn, practice, and track this stage.` : 'This roadmap stage is a learning milestone. Use the skill list to open a related skill guide and record your progress.'}</p></div>}</div>
          <div className="career-section-heading mt-7"><div><p className="career-eyebrow">Skill library</p><h3 className="career-display text-xl">Skills in this path</h3></div><span className="career-chip">{selectedPath.skills.filter(skill => progressFor(skill).status === 'completed').length}/{selectedPath.skills.length} complete</span></div>
          <div className="career-skill-grid">{selectedPath.skills.map(skill => { const progress = progressFor(skill); return <button type="button" key={skill.id} className={`career-skill-row ${selectedSkill?.id === skill.id ? 'selected' : ''}`} onClick={() => setSelectedSkill(skill)}><span className="career-skill-check">{progress.status === 'completed' ? <Check size={14} /> : <BookOpen size={14} />}</span><span className="min-w-0 flex-1"><strong>{skill.name}</strong><span>{progress.status === 'completed' ? 'Completed' : progress.status === 'in_progress' ? 'In progress' : 'Ready to start'}</span></span><span className="text-xs font-semibold text-gray-600">{progress.progress || 0}%</span></button> })}</div>
          {renderSkillDetail(selectedSkill)}
        </div> : <>
          <div className="career-search-secondary"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search careers, skills, or tools" aria-label="Search career paths" /></div>
          {renderCareerCards(matchingPaths)}
        </>}
      </section>}

      {activeTab === 'projects' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">Project-based learning</p><h2 className="career-display text-2xl">Build something you can show</h2></div><div className="flex flex-wrap gap-2"><label className="career-filter"><span className="sr-only">Filter projects by career path</span><select value={selectedPathId} onChange={event => setSelectedPathId(event.target.value)}><option value="">All paths</option>{data.paths.map(path => <option value={path.id} key={path.id}>{path.title}</option>)}</select></label><label className="career-filter"><span className="sr-only">Filter project difficulty</span><select value={projectDifficulty} onChange={event => setProjectDifficulty(event.target.value)}><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div></div>
        <div className="career-search-secondary mb-3"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search projects, skills, or requirements" aria-label="Search projects" /></div>
        <div className="grid gap-3 lg:grid-cols-2">{visibleProjects.map(({ path, project }) => {
          const progress = data.projectProgress[project.id] || { status: 'not_started' }
          const expanded = details?.kind === 'project' && details.item.id === project.id
          return <article className="career-project-card" key={project.id}>
            <div className="flex items-start justify-between gap-3"><span className={`career-level career-level-${project.level?.toLowerCase()}`}>{project.level}</span><button type="button" className={`career-icon-button ${isBookmarked('career_project_id', project.id) ? 'is-saved' : ''}`} onClick={() => toggleBookmark('career_project_id', project.id)} aria-label="Bookmark project"><Bookmark size={16} fill={isBookmarked('career_project_id', project.id) ? 'currentColor' : 'none'} /></button></div>
            <p className="mt-3 text-xs font-semibold uppercase text-gray-500">{path.title}</p><h3 className="mt-1 text-lg font-bold text-gray-900">{project.title}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{project.description || project.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" className="career-button career-button-dark" disabled={busy === `project-${project.id}`} onClick={async () => { const saved = await saveProjectProgress(project, { status: progress.status === 'not_started' ? 'in_progress' : progress.status }); if (saved) toast('Project added to your workbench.', 'success') }}><Play size={14} />{progress.status === 'not_started' ? 'Start project' : 'Continue project'}</button><button type="button" className="career-button career-button-light" onClick={() => setDetails(expanded ? null : { kind: 'project', item: project, path })}>Requirements</button>{progress.status !== 'not_started' && progress.status !== 'completed' && <button type="button" className="career-button career-button-light" onClick={() => { setProjectDraft({ repository_url: progress.repository_url || '', live_url: progress.live_url || '', reflection: progress.reflection || '' }); setDetails({ kind: 'submit-project', item: project }) }}><Send size={14} />Submit</button>}{progress.status === 'submitted' && <button type="button" className="career-button career-button-light" onClick={async () => { const saved = await saveProjectProgress(project, { status: 'completed' }); if (saved) toast('Project marked complete and added to your profile.', 'success') }}><Check size={14} />Mark complete</button>}</div>
            {progress.status !== 'not_started' && <p className="mt-3 text-xs font-semibold text-teal-800">Status: {progress.status.replace('_', ' ')}</p>}
            {expanded && <div className="career-requirements"><p className="career-label">Project requirements</p><ul>{(project.requirements || []).map(requirement => <li key={requirement}><Check size={13} />{requirement}</li>)}</ul></div>}
          </article>
        })}</div>
        {!data.paths.some(path => path.projects.length) && <EmptyNotice title="Projects are being prepared" detail="An administrator can add project briefs in Career Management." />}
      </section>}

      {activeTab === 'professional' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">Professional skills</p><h2 className="career-display text-2xl">Work well with people</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Technical ability grows stronger when you can explain your thinking, work in a team, and learn from feedback.</p></div><div className="career-soft-score"><strong>{data.professionalSkills.filter(skill => progressFor(skill).status === 'completed').length}</strong><span>modules complete</span></div></div>
        <div className="career-module-grid">{data.professionalSkills.map(skill => { const progress = progressFor(skill); const current = progress.progress || 0; return <article className="career-module" key={skill.id}><div className="flex items-start justify-between gap-3"><span className="career-module-icon"><Users size={17} /></span><span className="text-xs font-bold text-gray-500">{progress.status === 'completed' ? 'Complete' : current ? `${current}%` : 'Not started'}</span></div><h3 className="mt-4 text-base font-bold text-gray-900">{skill.name}</h3><ul className="mt-3 space-y-2">{skill.topics.map(topic => <li key={topic} className="text-sm text-gray-600"><span />{topic}</li>)}</ul><div className="mt-4"><ProgressBar value={current} /></div><button type="button" className="career-text-button mt-4" onClick={() => advanceProfessional(skill)} disabled={progress.status === 'completed'}>{progress.status === 'completed' ? 'Completed' : current ? 'Continue learning' : 'Start module'}<ArrowRight size={14} /></button></article> })}</div>
      </section>}

      {activeTab === 'interview' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">Interview preparation</p><h2 className="career-display text-2xl">Practice a clear answer</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Self-guided practice only. Your notes and ratings are for reflection, not an automated hiring evaluation.</p></div><span className="career-chip">{data.interviewPractice.length} saved practices</span></div>
        <div className="career-interview-layout"><div className="career-question-list">{INTERVIEW_QUESTIONS.map(question => <button type="button" key={question.question} onClick={() => { setInterviewQuestion(question); const previous = data.interviewPractice.find(item => item.question === question.question); setInterviewAnswer(previous?.answer || '') }} className={interviewQuestion.question === question.question ? 'active' : ''}><span>{question.category}</span><strong>{question.question}</strong></button>)}</div><form className="career-interview-practice" onSubmit={saveInterviewPractice}><span className="career-chip">{interviewQuestion.category}</span><h3 className="career-display mt-4 text-2xl">{interviewQuestion.question}</h3><div className="career-tip-grid"><div><p className="career-label">Tips</p><ul>{interviewQuestion.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></div><div><p className="career-label">Example structure</p><p>{interviewQuestion.structure}</p></div></div><label className="career-label mt-5 block">Your practice answer<textarea required rows="6" value={interviewAnswer} onChange={event => setInterviewAnswer(event.target.value)} placeholder="Write or paste your practice answer…" className="career-textarea" /></label><div className="career-self-review">{Object.entries(interviewScores).map(([key, value]) => <label key={key}>{key}<span>{value}/5</span><input type="range" min="1" max="5" value={value} onChange={event => setInterviewScores(current => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-gray-500">Rate yourself on communication, clarity, and structure.</p><button type="submit" disabled={busy === 'interview'} className="career-button career-button-dark"><Check size={14} />Save practice</button></div>{selectedInterviewPractice && <p className="mt-3 rounded-md bg-teal-50 p-3 text-xs text-teal-900">Last self-review: communication {selectedInterviewPractice.communication_score}/5, clarity {selectedInterviewPractice.clarity_score}/5, structure {selectedInterviewPractice.structure_score}/5.</p>}</form></div>
      </section>}

      {activeTab === 'opportunities' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">Campus opportunity board</p><h2 className="career-display text-2xl">Latest opportunities</h2><p className="mt-2 text-sm text-gray-600">Skill-match percentages compare listed skills only. They are not automated hiring decisions.</p></div><span className="career-chip">{matchingOpportunities.length} listings</span></div>
        <div className="career-opportunity-toolbar"><div className="career-search-secondary"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Company, role, skill, or location" aria-label="Search opportunities" /></div><div className="career-filter-pills">{OPPORTUNITY_FILTERS.map(filter => <button type="button" key={filter} onClick={() => setOpportunityFilter(filter)} className={opportunityFilter === filter ? 'active' : ''}>{filter}</button>)}</div></div>
        <div className="space-y-3">{matchingOpportunities.length ? matchingOpportunities.map(renderOpportunityCard) : <EmptyNotice title="No published opportunities yet" detail="Only opportunities published by campus administrators appear here. Check again later or explore a project while you wait." />}</div>
      </section>}

      {activeTab === 'campus' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">Campus + career</p><h2 className="career-display text-2xl">Learn with your community</h2></div></div>
        <section className="career-campus-block"><div className="career-section-heading"><div><p className="career-eyebrow">Workshops</p><h3 className="career-display text-xl">Upcoming campus sessions</h3></div><span className="career-chip">{visibleWorkshops.length} listed</span></div>{visibleWorkshops.length ? <div className="grid gap-3 md:grid-cols-2">{visibleWorkshops.map(workshop => { const registration = data.registrations.find(item => item.workshop_id === workshop.id); const company = data.companies.find(item => item.id === workshop.company_id); const registered = registration?.status === 'registered'; const attended = registration?.status === 'attended'; return <article key={workshop.id} className="career-workshop"><div className="flex items-start justify-between gap-3"><span className="career-chip">{company ? <><CheckCircle2 size={12} />Verified partner</> : workshop.organizer || 'Campus'}</span><CalendarDays size={18} className="text-teal-800" /></div><h4 className="mt-3 text-lg font-bold text-gray-900">{workshop.title}</h4><p className="mt-1 text-sm text-gray-600">{workshop.description}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500"><span>{new Date(workshop.starts_at).toLocaleString()}</span>{workshop.location && <span>· {workshop.location}</span>}</div><div className="mt-3 flex flex-wrap gap-1.5">{(workshop.topics || []).map(topic => <span className="career-skill-chip" key={topic}>{topic}</span>)}</div><button type="button" className={`career-button mt-4 ${registered ? 'career-button-light' : 'career-button-dark'}`} disabled={busy === `workshop-${workshop.id}` || attended} onClick={() => registerWorkshop(workshop)}>{attended ? 'Attended' : registered ? 'Registered · cancel' : 'Register'}{registered ? <Check size={14} /> : <ArrowRight size={14} />}</button>{workshop.certificate_available && <p className="mt-2 text-xs text-gray-500">Certificate available after attendance is verified.</p>}</article> })}</div> : <EmptyNotice title={data.workshops.length ? 'No workshops match your search' : 'No upcoming workshops listed'} detail="Verified campus workshops will appear here once an administrator publishes them." />}</section>
        <div className="career-campus-grid">
          <section className="career-campus-block"><div className="career-section-heading"><div><p className="career-eyebrow">My certifications</p><h3 className="career-display text-xl">Keep your credentials together</h3></div></div><form className="career-form-grid" onSubmit={addCertification}><label>Certification name<input required value={certDraft.name} onChange={event => setCertDraft({ ...certDraft, name: event.target.value })} placeholder="Web development" /></label><label>Provider<input value={certDraft.provider} onChange={event => setCertDraft({ ...certDraft, provider: event.target.value })} placeholder="Provider" /></label><label>Issue date<input type="date" value={certDraft.issued_at} onChange={event => setCertDraft({ ...certDraft, issued_at: event.target.value })} /></label><label>Credential link<input type="url" value={certDraft.credential_url} onChange={event => setCertDraft({ ...certDraft, credential_url: event.target.value })} placeholder="https://…" /></label><label className="career-file-label">Certificate file<input name="certificate" type="file" accept="application/pdf,image/*" /></label><button type="submit" disabled={busy === 'certification'} className="career-button career-button-dark"><Upload size={14} />Add certification</button></form><div className="mt-4 space-y-2">{data.certifications.map(certification => <article key={certification.id} className="career-cert-row"><Award size={17} /><div className="min-w-0 flex-1"><strong>{certification.name}</strong><span>{certification.provider || 'Provider not listed'} · {certification.verification_status}</span></div>{certification.file_path && <button type="button" className="career-text-button" onClick={() => openPrivateFile(certification.file_path)}>View file <ExternalLink size={13} /></button>}</article>)}{!data.certifications.length && <p className="text-sm text-gray-500">No certifications added yet.</p>}</div></section>
          <section className="career-campus-block"><div className="career-section-heading"><div><p className="career-eyebrow">Career stories</p><h3 className="career-display text-xl">Learn from campus experiences</h3></div><BookOpen size={19} className="text-teal-800" /></div><div className="space-y-3">{data.articles.filter(article => article.status === 'published').map(article => <article key={article.id} className="career-story"><span className="career-chip">{article.category || 'Career story'}</span><h4>{article.title}</h4><p>{article.summary}</p><small>{article.author_display || 'Campus contributor'} · {article.project_count || 0} projects</small><details><summary>Read story</summary><p>{article.content}</p></details></article>)}{!data.articles.some(article => article.status === 'published') && <EmptyNotice title="No career stories published yet" detail="Students and faculty can share a story for campus review." />}</div><form className="career-story-form" onSubmit={submitStory}><p className="career-label">Share your experience</p><input required value={storyDraft.title} onChange={event => setStoryDraft({ ...storyDraft, title: event.target.value })} placeholder="How I learned…" /><input value={storyDraft.summary} onChange={event => setStoryDraft({ ...storyDraft, summary: event.target.value })} placeholder="Short summary" /><input value={storyDraft.skills_learned} onChange={event => setStoryDraft({ ...storyDraft, skills_learned: event.target.value })} placeholder="Skills learned, comma-separated" /><textarea required rows="4" value={storyDraft.content} onChange={event => setStoryDraft({ ...storyDraft, content: event.target.value })} placeholder="What did you try, learn, and build?" /><button type="submit" disabled={busy === 'story'} className="career-button career-button-dark"><Send size={14} />Submit story for review</button></form></section>
        </div>
      </section>}

      {activeTab === 'profile' && <section className="career-section">
        <div className="career-section-heading"><div><p className="career-eyebrow">My career profile</p><h2 className="career-display text-2xl">Show the work behind your goals</h2><p className="mt-2 text-sm text-gray-600">Your profile stays private to you unless you choose to share its links.</p></div><div className="career-profile-score"><strong>{getProfileCompletion(data.profile)}%</strong><span>profile complete</span></div></div>
        <div className="career-profile-layout"><form className="career-profile-form" onSubmit={saveCareerProfile}><div className="career-form-grid"><label>Career headline<input value={profileDraft.headline || ''} onChange={event => setProfileDraft({ ...profileDraft, headline: event.target.value })} placeholder={selectedPath?.title || 'What are you learning toward?'} /></label><label>Selected path<select value={selectedPathId || ''} onChange={event => { const path = data.paths.find(item => item.id === event.target.value); if (path) chooseCareer(path) }}><option value="">Choose a path</option>{data.paths.map(path => <option value={path.id} key={path.id}>{path.title}</option>)}</select></label><label className="career-form-full">About<textarea rows="4" value={profileDraft.about || ''} onChange={event => setProfileDraft({ ...profileDraft, about: event.target.value })} placeholder="A short introduction focused on what you are learning and building." /></label><label className="career-form-full">Skills<input value={profileDraft.skillsInput ?? (profileDraft.skills || []).join(', ')} onChange={event => setProfileDraft({ ...profileDraft, skillsInput: event.target.value })} placeholder="React, SQL, communication" /></label><label className="career-form-full">Projects and achievements<textarea rows="3" value={profileDraft.achievementsInput ?? (profileDraft.achievements || []).join('\n')} onChange={event => setProfileDraft({ ...profileDraft, achievementsInput: event.target.value })} placeholder="One achievement per line" /></label><label className="career-form-full">Internships and experience<textarea rows="3" value={profileDraft.internshipsInput ?? (profileDraft.internships || []).join('\n')} onChange={event => setProfileDraft({ ...profileDraft, internshipsInput: event.target.value })} placeholder="One experience per line" /></label><label>GitHub<input type="url" value={profileDraft.github_url || ''} onChange={event => setProfileDraft({ ...profileDraft, github_url: event.target.value })} placeholder="https://github.com/…" /></label><label>LinkedIn<input type="url" value={profileDraft.linkedin_url || ''} onChange={event => setProfileDraft({ ...profileDraft, linkedin_url: event.target.value })} placeholder="https://linkedin.com/in/…" /></label><label>Portfolio<input type="url" value={profileDraft.portfolio_url || ''} onChange={event => setProfileDraft({ ...profileDraft, portfolio_url: event.target.value })} placeholder="https://…" /></label><label className="career-file-label">Resume file<input type="file" accept="application/pdf,.doc,.docx" onChange={event => uploadResume(event.target.files?.[0])} />{data.profile.resume_path && <button type="button" className="career-text-button" onClick={() => openPrivateFile(data.profile.resume_path)}>View uploaded resume <ExternalLink size={13} /></button>}</label></div><div className="mt-5 flex flex-wrap gap-2"><button type="submit" disabled={busy === 'profile'} className="career-button career-button-dark"><Check size={14} />Save profile</button><button type="button" className="career-button career-button-light" onClick={downloadResume}><Download size={14} />Build resume draft</button><button type="button" className="career-button career-button-light" onClick={() => setDetails({ kind: 'portfolio' })}><ExternalLink size={14} />View portfolio</button></div></form><aside className="career-profile-aside"><span className="career-profile-icon"><GraduationCap size={23} /></span><p className="career-eyebrow">Learning footprint</p><h3 className="career-display text-xl">{selectedPath?.title || 'Choose a career path'}</h3><ProgressBar value={careerCompletion} label="Path progress" /><div className="career-profile-counts"><span><strong>{completedSkills.length}</strong> skills completed</span><span><strong>{Object.values(data.projectProgress).filter(item => ['submitted', 'completed'].includes(item.status)).length}</strong> projects shared</span><span><strong>{data.certifications.length}</strong> certifications listed</span></div><div className="mt-5 border-t border-gray-200 pt-4"><p className="career-label">Projects in your profile</p>{Object.entries(data.projectProgress).filter(([, item]) => ['submitted', 'completed'].includes(item.status)).map(([id, item]) => <p key={id} className="career-profile-project"><CheckCircle2 size={14} />{data.paths.flatMap(path => path.projects).find(project => project.id === id)?.title || 'Completed project'} <span>{item.status}</span></p>)}{!Object.values(data.projectProgress).some(item => ['submitted', 'completed'].includes(item.status)) && <p className="mt-2 text-sm text-gray-500">Submit a project to add it to your profile.</p>}</div></aside></div>
      </section>}

      {activeTab === 'companies' && <section className="career-section"><div className="career-section-heading"><div><p className="career-eyebrow">Verified campus network</p><h2 className="career-display text-2xl">Companies collaborating with campus</h2></div><span className="career-chip">{filteredCompanies.length} companies</span></div><div className="career-company-grid">{filteredCompanies.length ? filteredCompanies.map(company => <CompanyCard key={company.id} company={company} collaborations={data.collaborations} isBookmarked={isBookmarked('company_id', company.id)} onBookmark={() => toggleBookmark('company_id', company.id)} onOpen={() => setDetails({ kind: 'company', item: company })} />) : <EmptyNotice title="No verified campus partners listed" detail="Only companies verified by a campus administrator appear here." />}</div></section>}

      {details?.kind === 'submit-project' && <Dialog title={`Submit ${details.item.title}`} onClose={() => setDetails(null)}><form className="career-form-grid" onSubmit={async event => { event.preventDefault(); const saved = await saveProjectProgress(details.item, { ...projectDraft, status: 'submitted' }); if (saved) { setDetails(null); toast('Project submitted to your profile.', 'success') } }}><label>Repository URL<input type="url" value={projectDraft.repository_url} onChange={event => setProjectDraft({ ...projectDraft, repository_url: event.target.value })} placeholder="https://github.com/…" /></label><label>Live demo URL<input type="url" value={projectDraft.live_url} onChange={event => setProjectDraft({ ...projectDraft, live_url: event.target.value })} placeholder="https://…" /></label><label className="career-form-full">Reflection<textarea rows="4" value={projectDraft.reflection} onChange={event => setProjectDraft({ ...projectDraft, reflection: event.target.value })} placeholder="What did you build and learn?" /></label><button type="submit" className="career-button career-button-dark"><Send size={14} />Submit project</button></form></Dialog>}
      {selectedOpportunity && <Dialog title={selectedOpportunity.title} onClose={() => setDetails(null)}><div className="space-y-4"><span className="career-chip">{selectedOpportunity.opportunity_type}</span><p className="text-sm leading-6 text-gray-600">{selectedOpportunity.description || 'No additional description was provided.'}</p><div><p className="career-label">Organization</p><p className="mt-1 text-sm">{data.companies.find(item => item.id === selectedOpportunity.company_id)?.name || selectedOpportunity.organizer || 'Campus'}</p></div><div><p className="career-label">Required skills</p><div className="mt-2 flex flex-wrap gap-2">{(selectedOpportunity.required_skills || []).map(skill => <span key={skill} className="career-skill-chip">{skill}</span>)}{!selectedOpportunity.required_skills?.length && <span className="text-sm text-gray-500">Not listed</span>}</div></div><p className="text-sm text-gray-600">Eligibility: {selectedOpportunity.eligibility || 'See the official application details.'}</p>{selectedOpportunity.deadline && <p className="text-sm text-gray-600">Deadline: {new Date(`${selectedOpportunity.deadline}T00:00:00`).toLocaleDateString()}</p>}{selectedOpportunity.application_method && <p className="text-sm text-gray-600">{selectedOpportunity.application_method}</p>}{selectedOpportunity.application_url && <a className="career-button career-button-dark" href={selectedOpportunity.application_url} target="_blank" rel="noreferrer">Open official application <ExternalLink size={14} /></a>}</div></Dialog>}
      {selectedCompany && <Dialog title={selectedCompany.name} onClose={() => setDetails(null)}><div className="space-y-4"><span className="career-verified"><CheckCircle2 size={13} />Verified campus partner</span><p className="text-sm leading-6 text-gray-600">{selectedCompany.description || 'No company description provided.'}</p><div><p className="career-label">Industry</p><p className="mt-1 text-sm">{selectedCompany.industry || 'Not listed'}</p></div><div><p className="career-label">Verified collaborations</p><div className="mt-2 flex flex-wrap gap-2">{data.collaborations.filter(item => item.company_id === selectedCompany.id && item.verification_status === 'verified').map(item => <span key={item.id} className="career-chip">{item.collaboration_type}</span>)}</div></div><div><p className="career-label">Campus opportunities</p>{data.opportunities.filter(item => item.company_id === selectedCompany.id).map(item => <button type="button" key={item.id} className="career-next-link" onClick={() => setDetails({ kind: 'opportunity', item })}>{item.title}<ArrowRight size={14} /></button>)}{!data.opportunities.some(item => item.company_id === selectedCompany.id) && <p className="mt-1 text-sm text-gray-500">No current opportunities listed.</p>}</div>{selectedCompany.website && <a className="career-text-button" href={selectedCompany.website} target="_blank" rel="noreferrer">Company website <ExternalLink size={14} /></a>}</div></Dialog>}
      {details?.kind === 'portfolio' && <Dialog title="Portfolio preview" onClose={() => setDetails(null)} wide><article className="career-portfolio-preview"><p className="career-eyebrow">{user?.department || 'CampusPlus student'}</p><h2 className="career-display text-3xl">{user?.name || 'Student'}</h2><p className="mt-1 font-semibold text-teal-800">{profileDraft.headline || selectedPath?.title}</p><p className="mt-4 text-sm leading-6 text-gray-600">{profileDraft.about || 'Add a short introduction in your career profile.'}</p><div className="mt-5"><p className="career-label">Skills</p><div className="mt-2 flex flex-wrap gap-2">{(profileDraft.skills || []).map(skill => <span className="career-skill-chip" key={skill}>{skill}</span>)}</div></div><div className="mt-5"><p className="career-label">Selected projects</p>{Object.entries(data.projectProgress).filter(([, item]) => ['submitted', 'completed'].includes(item.status)).map(([id]) => { const project = data.paths.flatMap(path => path.projects).find(item => item.id === id); return project && <p key={id} className="mt-2 text-sm">{project.title}</p> })}</div><div className="mt-5 flex flex-wrap gap-4">{[[Code2, profileDraft.github_url], [Users, profileDraft.linkedin_url], [ExternalLink, profileDraft.portfolio_url]].filter(([, href]) => href).map(([Icon, href]) => <a key={href} className="career-text-button" href={href} target="_blank" rel="noreferrer"><Icon size={14} />{href}</a>)}</div></article></Dialog>}
    </div>
  )
}