import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Code2, Zap, Shield, Users, Brain, Globe } from 'lucide-react'
import AppLogo from '../components/AppLogo'
import Ambient3DBackground from '../components/Ambient3DBackground'

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const TEAM = [
  {
    name: 'Bikas Nahak',
    role: 'Full Stack Developer & Project Lead',
    desc: 'Architected the entire platform — from Supabase schema to React UI. Passionate about building tools that solve real campus problems.',
    avatar: 'BN',
    color: 'from-violet-600 to-purple-800',
    github: '#',
    linkedin: '#',
    email: 'bikashnahak011@gmail.com',
  },
  {
    name: 'Asish Khadanga',
    role: 'UI/UX Designer',
    desc: 'Designed the user experience and visual identity of NexCampus. Focused on accessibility and mobile-first design.',
    avatar: 'AK',
    color: 'from-fuchsia-500 to-violet-700',
    github: '#',
    linkedin: '#',
    email: 'member2@nexcampus.dev',
  },
  {
    name: 'K Praveen Kumar',
    role: 'Backend & AI Integration',
    desc: 'Built the AI complaint routing system and Supabase integrations. Loves turning complex problems into elegant solutions.',
    avatar: 'KPK',
    color: 'from-purple-500 to-fuchsia-700',
    github: '#',
    linkedin: '#',
    email: 'member3@nexcampus.dev',
  },
  {
    name: 'Bamudi Madhumita',
    role: 'Mobile & PWA Specialist',
    desc: 'Implemented PWA features, offline support, and ensured the platform works seamlessly on all devices and network conditions.',
    avatar: 'BM',
    color: 'from-pink-500 to-purple-700',
    github: '#',
    linkedin: '#',
    email: 'bamudimadhumita07@gmail.com',
  },
   {
    name: 'CH Nainika',
    role: 'Presentation Creator',
    desc: 'Explains the website and hackathon challenge through clear, engaging presentation design and storytelling.',
    avatar: 'CHN',
    color: 'from-indigo-500 to-violet-700',
    github: '#',
    linkedin: '#',
    email: 'member5@nexcampus.dev',
  },
]

const STATS = [
  { value: '15+', label: 'Features Built' },
  { value: '2', label: 'User Roles' },
  { value: '1', label: 'Unified Platform' },
  { value: '∞', label: 'Campus Problems Solved' },
]

const TECH = [
  { name: 'React + Vite', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Tailwind CSS v4', color: 'bg-teal-100 text-teal-700' },
  { name: 'Supabase', color: 'bg-green-100 text-green-700' },
  { name: 'React Router v7', color: 'bg-amber-100 text-amber-700' },
  { name: 'Google OAuth', color: 'bg-red-100 text-red-700' },
  { name: 'PWA', color: 'bg-orange-100 text-orange-700' },
  { name: 'AI / Gemini', color: 'bg-lime-100 text-lime-700' },
  { name: 'Lucide Icons', color: 'bg-yellow-100 text-yellow-700' },
]

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="public-page page-shell min-h-screen flex flex-col bg-violet-50">
      <Ambient3DBackground variant="public" />
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/landing')} className="flex items-center gap-2 text-violet-800 hover:text-violet-950 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <AppLogo size={32} showText />
          <button onClick={() => navigate('/login')} className="primary-button text-sm px-4 py-2">Sign In</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-100 via-white to-fuchsia-100 text-violet-950 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/75 border border-violet-200 rounded-full px-4 py-1.5 text-sm mb-6">
            <Users size={14} className="text-violet-700" /> Meet the Team
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-fuchsia-500">NexCampus</span>
          </h1>
          <p className="text-xl text-violet-800 max-w-2xl mx-auto">
            Built by students, for students. NexCampus was born from the frustration of managing campus life across dozens of disconnected tools.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black text-emerald-700 mb-1">{value}</p>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Zap size={14} /> Our Mission
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">One Campus. One Platform. Zero Confusion.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                NexCampus was created to replace the chaos of WhatsApp groups, paper forms, notice boards, and phone calls with a single, intelligent platform.
              </p>
              <p className="text-gray-500 leading-relaxed">
                From filing a complaint to checking attendance, from requesting documents to tracking hostel maintenance — everything a student or administrator needs is now in one place, accessible from any device, even on slow networks.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Brain, title: 'AI-Powered', desc: 'Smart complaint routing and insights powered by AI', color: 'bg-emerald-50 text-emerald-700' },
                { icon: Shield, title: 'Secure by Default', desc: 'Google OAuth + Supabase RLS for data protection', color: 'bg-amber-50 text-amber-700' },
                { icon: Globe, title: 'Works Everywhere', desc: 'PWA with offline support and lite mode for slow networks', color: 'bg-teal-50 text-teal-700' },
                { icon: Code2, title: 'Open Architecture', desc: 'Built on modern, scalable open-source technologies', color: 'bg-lime-50 text-lime-700' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:shadow-md transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-gray-500 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">The Team</h2>
            <p className="text-gray-500 text-lg">The people who built NexCampus</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-3xl p-6 shadow-sm border border-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Avatar */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg`}>
                  {member.avatar}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-0.5">{member.name}</h3>
                <p className="text-emerald-700 text-xs font-semibold mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">{member.desc}</p>
                {/* Links */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <a href={member.github} className="text-gray-400 hover:text-gray-700 transition-colors" title="GitHub">
                    <GithubIcon />
                  </a>
                  <a href={member.linkedin} className="text-gray-400 hover:text-emerald-700 transition-colors" title="LinkedIn">
                    <LinkedinIcon />
                  </a>
                  <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-emerald-700 transition-colors" title="Email">
                    <Mail size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Built With</h2>
          <p className="text-gray-500 mb-10">Modern, production-grade technologies</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH.map(({ name, color }) => (
              <span key={name} className={`${color} px-4 py-2 rounded-full text-sm font-semibold`}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Ready to experience NexCampus?</h2>
          <p className="text-violet-100 mb-8">Join your campus on the platform built to make student life simpler.</p>
          <button onClick={() => navigate('/login')} className="bg-white text-violet-900 font-bold px-8 py-4 rounded-2xl hover:bg-violet-50 transition-all hover:shadow-xl hover:-translate-y-0.5 duration-200 text-base">
            Get Started →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 text-violet-800 py-8 border-t border-violet-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AppLogo size={20} />
            <span className="text-violet-950 font-bold">NexCampus</span>
            <span className="text-violet-600 text-sm">— One Campus. One Platform. Zero Confusion.</span>
          </div>
          <p className="text-sm">Developed By CodeCampus Team.</p>
        </div>
      </footer>
    </div>
  )
}
