const RESOURCE_DOMAINS = {
  'HTML': ['https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content'],
  'CSS': ['https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics'],
  'JavaScript': ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'],
  'React': ['https://react.dev/learn'],
  'Node.js': ['https://nodejs.org/en/learn'],
  'Python': ['https://docs.python.org/3/tutorial/'],
  'SQL': ['https://www.postgresql.org/docs/current/tutorial.html'],
  'Git': ['https://git-scm.com/doc'],
  'C#': ['https://learn.microsoft.com/dotnet/csharp/'],
  'Unity': ['https://learn.unity.com/'],
  'TensorFlow': ['https://www.tensorflow.org/learn'],
  'PyTorch': ['https://pytorch.org/tutorials/'],
  'Linux': ['https://linuxjourney.com/'],
  'Docker': ['https://docs.docker.com/get-started/'],
  'Figma': ['https://help.figma.com/hc/en-us/categories/360002051613-Get-started'],
  'Kubernetes': ['https://kubernetes.io/docs/tutorials/'],
}

const TOPIC_GUIDES = {
  'HTML': ['Semantic structure', 'Forms and validation', 'Accessibility basics'],
  'CSS': ['Layout with Flexbox and Grid', 'Responsive design', 'Design tokens'],
  'JavaScript': ['Values and functions', 'Async JavaScript', 'DOM and browser APIs'],
  'React': ['Components and props', 'State and effects', 'Routing and data fetching'],
  'Node.js': ['Runtime fundamentals', 'HTTP servers', 'Modules and package management'],
  'Python': ['Data structures', 'Functions and modules', 'Testing and virtual environments'],
  'SQL': ['Filtering and joins', 'Constraints and relationships', 'Transactions and indexes'],
  'Git': ['Commits and branches', 'Pull requests', 'Resolving merge conflicts'],
  'Networking': ['TCP/IP and DNS', 'HTTP and TLS', 'Packet inspection'],
  'Linux': ['Files and permissions', 'Processes and shell tools', 'Services and logs'],
  'Docker': ['Images and containers', 'Volumes and networks', 'Multi-stage builds'],
  'Figma': ['Auto layout', 'Components and variants', 'Prototypes and handoff'],
  'Statistics': ['Distributions and sampling', 'Hypothesis testing', 'Communicating uncertainty'],
  'Machine Learning': ['Data splitting', 'Model evaluation', 'Feature engineering'],
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildSkill(name, careerTitle) {
  const topics = TOPIC_GUIDES[name] || ['Core concepts and terminology', 'Common tools and workflows', 'Testing, review, and a practical build']
  return {
    slug: slugify(name),
    name,
    why: `${name} helps ${careerTitle.toLowerCase()} build reliable, useful work and collaborate with a team.`,
    topics,
    resources: [{ title: `${name} documentation`, type: 'Documentation', url: RESOURCE_DOMAINS[name]?.[0] || `https://www.google.com/search?q=${encodeURIComponent(`${name} official documentation`)}` }],
    practice: `Build a small ${name} example, explain one design decision, and add a short README with what you learned.`,
  }
}

function buildCareer(slug, title, category, summary, skills, roadmap, projects, color) {
  return {
    slug,
    title,
    category,
    summary,
    skills: skills.map(name => buildSkill(name, title)),
    roadmap,
    projects,
    color,
  }
}

const FULL_STACK_ROADMAP = [
  'Programming fundamentals', 'HTML + CSS', 'JavaScript', 'React', 'Backend development',
  'Databases', 'APIs', 'Git + GitHub', 'Deployment', 'Full-stack projects',
]

export const CAREER_CATALOG = [
  buildCareer('full-stack-developer', 'Full Stack Developer', 'Software', 'Build both the frontend and backend of useful web applications.', ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'], FULL_STACK_ROADMAP, [
    { title: 'Personal Portfolio', level: 'Beginner', description: 'Create an accessible portfolio with responsive project pages.', requirements: ['Responsive layout', 'Project summaries', 'Contact form with validation'] },
    { title: 'College Complaint Management System', level: 'Intermediate', description: 'Build a role-aware workflow for submitting and tracking campus issues.', requirements: ['Student and admin views', 'Status history', 'Database-backed records'] },
    { title: 'Real-time Campus Management Platform', level: 'Advanced', description: 'Connect multiple campus workflows through a secure, real-time application.', requirements: ['Authentication and authorization', 'Realtime updates', 'Monitoring and deployment'] },
  ], 'teal'),
  buildCareer('software-developer', 'Software Developer', 'Software', 'Design, build, test, and maintain software that solves real problems.', ['Python', 'Java', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'Testing'], ['Programming foundations', 'Data structures', 'Algorithms', 'Object-oriented design', 'Databases', 'Testing', 'Team workflows', 'Build a complete application'], [
    { title: 'Student Planner', level: 'Beginner', description: 'A reliable command-line or web planner for classes and tasks.', requirements: ['Create and edit tasks', 'Persist data', 'Automated tests'] },
    { title: 'Campus Service API', level: 'Intermediate', description: 'Create a documented API for a small campus workflow.', requirements: ['Input validation', 'Authentication', 'API tests'] },
    { title: 'Open-source Contribution', level: 'Advanced', description: 'Make a reviewed contribution to a maintained open-source project.', requirements: ['Reproduce an issue', 'Submit a focused pull request', 'Respond to review'] },
  ], 'blue'),
  buildCareer('frontend-developer', 'Frontend Developer', 'Software', 'Turn product requirements into fast, accessible interfaces.', ['HTML', 'CSS', 'JavaScript', 'React', 'Accessibility', 'Testing', 'Git'], ['Web fundamentals', 'Semantic HTML', 'Responsive CSS', 'JavaScript', 'Component architecture', 'Accessibility', 'Performance', 'Ship a polished interface'], [
    { title: 'Accessible Campus Directory', level: 'Beginner', description: 'Build a searchable directory that works with keyboard and assistive technology.', requirements: ['Search and filters', 'Keyboard navigation', 'Responsive states'] },
    { title: 'Student Services Dashboard', level: 'Intermediate', description: 'Create a data-rich dashboard with reusable interface patterns.', requirements: ['Loading and empty states', 'Reusable components', 'Charts with labels'] },
    { title: 'Design System Starter', level: 'Advanced', description: 'Document a small component library and implement it in an app.', requirements: ['Tokens and components', 'Interaction states', 'Usage documentation'] },
  ], 'cyan'),
  buildCareer('backend-developer', 'Backend Developer', 'Software', 'Build the APIs, data systems, and services behind applications.', ['Python', 'Node.js', 'SQL', 'APIs', 'Networking', 'Security', 'Docker'], ['Programming foundations', 'HTTP and networking', 'API design', 'Data modeling', 'Authentication', 'Testing', 'Observability', 'Deploy a service'], [
    { title: 'Course Registration API', level: 'Beginner', description: 'Model courses and seats behind a small API.', requirements: ['CRUD endpoints', 'Validation', 'API documentation'] },
    { title: 'Queue and Notification Service', level: 'Intermediate', description: 'Process background work reliably with retries.', requirements: ['Idempotent jobs', 'Retry policy', 'Failure visibility'] },
    { title: 'Scalable Campus Service', level: 'Advanced', description: 'Design and load-test a service with a clear scaling strategy.', requirements: ['Performance baseline', 'Caching strategy', 'Operational runbook'] },
  ], 'indigo'),
  buildCareer('game-developer', 'Game Developer', 'Creative technology', 'Combine programming, art, and systems design to create interactive experiences.', ['C#', 'Unity', 'Game Design', '3D Mathematics', 'Game Physics', 'Blender', 'Git'], ['Programming foundations', 'Game loops', '2D and 3D mathematics', 'Engine workflows', 'Physics and input', 'Game feel', 'Optimization', 'Publish a playable build'], [
    { title: '2D Platformer', level: 'Beginner', description: 'Build a short platforming level with a clear start and finish.', requirements: ['Player movement', 'Collision and checkpoints', 'Playable build'] },
    { title: '3D Survival Game', level: 'Intermediate', description: 'Prototype a small 3D survival loop with readable feedback.', requirements: ['Resource loop', 'Enemy behavior', 'Save and restart flow'] },
    { title: 'Multiplayer Game', level: 'Advanced', description: 'Build a small multiplayer prototype and document its networking model.', requirements: ['Networked session', 'Latency handling', 'Abuse and disconnect cases'] },
  ], 'orange'),
  buildCareer('ai-ml-engineer', 'AI / ML Engineer', 'Data and AI', 'Turn data into tested machine-learning systems and explain their limitations.', ['Python', 'Statistics', 'Data Processing', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Generative AI'], ['Python and data tools', 'Statistics', 'Data preparation', 'Classical machine learning', 'Model evaluation', 'Deep learning', 'Responsible AI', 'Deploy and monitor a model'], [
    { title: 'Student Score Prediction', level: 'Beginner', description: 'Explore a small, consented dataset and establish a simple baseline.', requirements: ['Data quality notes', 'Baseline model', 'Limitations and fairness review'] },
    { title: 'Attendance Analysis', level: 'Intermediate', description: 'Analyze attendance trends without exposing identifiable student data.', requirements: ['Privacy-aware dataset', 'Visual analysis', 'Actionable findings'] },
    { title: 'AI Campus Assistant', level: 'Advanced', description: 'Prototype a grounded assistant with evaluation and safe fallbacks.', requirements: ['Curated knowledge source', 'Evaluation set', 'Privacy and failure handling'] },
  ], 'violet'),
  buildCareer('cybersecurity-engineer', 'Cybersecurity Engineer', 'Security', 'Protect systems by understanding threats, reducing risk, and testing responsibly.', ['Networking', 'Linux', 'Python', 'Web Security', 'Cryptography', 'Ethical Hacking', 'Security Tools'], ['Networking foundations', 'Linux and scripting', 'Threat modeling', 'Web security', 'Identity and cryptography', 'Defensive monitoring', 'Incident response', 'Practice in an authorized lab'], [
    { title: 'Password Strength Analyzer', level: 'Beginner', description: 'Evaluate password properties locally without storing submitted passwords.', requirements: ['No password logging', 'Explainable feedback', 'Unit tests'] },
    { title: 'Network Monitoring Tool', level: 'Intermediate', description: 'Summarize traffic metadata from an authorized lab capture.', requirements: ['Lab-only data', 'Useful alerts', 'Privacy notes'] },
    { title: 'Web Security Testing Lab', level: 'Advanced', description: 'Create a deliberately vulnerable local app and document defensive fixes.', requirements: ['Isolated local environment', 'Reproducible tests', 'Remediation guide'] },
  ], 'rose'),
  buildCareer('data-analyst', 'Data Analyst', 'Data and AI', 'Use careful analysis and clear communication to answer practical questions with data.', ['Excel', 'SQL', 'Python', 'Statistics', 'Power BI', 'Data Visualization', 'Communication'], ['Ask a useful question', 'Spreadsheet fundamentals', 'SQL', 'Data cleaning', 'Statistics', 'Visualization', 'Communicate findings', 'Publish an analysis'], [
    { title: 'Campus Food Survey', level: 'Beginner', description: 'Summarize an anonymous survey and explain sampling limitations.', requirements: ['Clean dataset', 'Two useful charts', 'Short written summary'] },
    { title: 'Attendance Analysis', level: 'Intermediate', description: 'Analyze aggregate attendance patterns with careful context.', requirements: ['SQL queries', 'Dashboard', 'Privacy safeguards'] },
    { title: 'Student Services Insights', level: 'Advanced', description: 'Develop a repeatable data pipeline and decision-ready report.', requirements: ['Documented pipeline', 'Data quality checks', 'Actionable report'] },
  ], 'amber'),
  buildCareer('cloud-engineer', 'Cloud Engineer', 'Infrastructure', 'Design secure, observable cloud infrastructure for reliable services.', ['Linux', 'Networking', 'Docker', 'AWS', 'Azure', 'GCP', 'Security', 'Infrastructure as Code'], ['Linux and networking', 'Cloud fundamentals', 'Identity and access', 'Compute and storage', 'Infrastructure as code', 'Observability', 'Resilience', 'Deploy a secure service'], [
    { title: 'Static Site Deployment', level: 'Beginner', description: 'Deploy a static project with a repeatable workflow.', requirements: ['HTTPS', 'Build workflow', 'Rollback notes'] },
    { title: 'Containerized API', level: 'Intermediate', description: 'Package and deploy a small API with configuration separated.', requirements: ['Container image', 'Health check', 'Secret handling'] },
    { title: 'Resilient Service Architecture', level: 'Advanced', description: 'Document and implement a resilient, observable service design.', requirements: ['Threat model', 'Recovery plan', 'Cost and scaling notes'] },
  ], 'blue'),
  buildCareer('devops-engineer', 'DevOps Engineer', 'Infrastructure', 'Improve the way teams build, release, and operate software.', ['Linux', 'Networking', 'Docker', 'CI/CD', 'Kubernetes', 'Git', 'Monitoring'], ['Linux and scripting', 'Version control', 'CI pipelines', 'Containers', 'Cloud basics', 'Infrastructure as code', 'Observability', 'Reliable release workflow'], [
    { title: 'Automated Test Pipeline', level: 'Beginner', description: 'Run tests and checks automatically on each change.', requirements: ['Fast feedback', 'Clear failures', 'Protected release branch'] },
    { title: 'Container Release Workflow', level: 'Intermediate', description: 'Build and publish a versioned container through CI.', requirements: ['Reproducible image', 'Scanning step', 'Rollback instructions'] },
    { title: 'Kubernetes Service Lab', level: 'Advanced', description: 'Deploy and observe a service in a local or authorized cluster.', requirements: ['Health probes', 'Resource limits', 'Incident drill'] },
  ], 'teal'),
  buildCareer('ui-ux-designer', 'UI/UX Designer', 'Design', 'Research user needs and turn them into coherent, accessible product experiences.', ['User Research', 'Information Architecture', 'Wireframing', 'Figma', 'Prototyping', 'Accessibility', 'Communication'], ['Research and listening', 'Information architecture', 'Interaction design', 'Visual foundations', 'Prototyping', 'Usability testing', 'Accessibility', 'Present a case study'], [
    { title: 'Campus Wayfinding Study', level: 'Beginner', description: 'Identify navigation friction and test a low-fidelity improvement.', requirements: ['Research notes', 'Wireframes', 'Usability findings'] },
    { title: 'Student Services Prototype', level: 'Intermediate', description: 'Design and test an end-to-end student service flow.', requirements: ['Task flow', 'Interactive prototype', 'Accessibility review'] },
    { title: 'Product Design Case Study', level: 'Advanced', description: 'Document a complete design process from problem framing to validation.', requirements: ['Evidence-based decisions', 'Test iterations', 'Clear portfolio narrative'] },
  ], 'pink'),
  buildCareer('mobile-app-developer', 'Mobile App Developer', 'Software', 'Create useful mobile experiences that work across devices and network conditions.', ['Kotlin', 'Swift', 'React Native', 'JavaScript', 'APIs', 'Mobile UX', 'Testing', 'Git'], ['Mobile platform foundations', 'Layout and navigation', 'State and data', 'Networking', 'Offline behavior', 'Accessibility', 'Testing', 'Ship a mobile app'], [
    { title: 'Campus Event Companion', level: 'Beginner', description: 'Create a mobile-first view of events and reminders.', requirements: ['Responsive screens', 'Accessible controls', 'Local preferences'] },
    { title: 'Offline Study Planner', level: 'Intermediate', description: 'Keep key planning actions available with unreliable connectivity.', requirements: ['Offline storage', 'Sync states', 'Conflict handling'] },
    { title: 'Cross-platform Campus App', level: 'Advanced', description: 'Build and test a production-style cross-platform experience.', requirements: ['Platform conventions', 'Crash handling', 'Release checklist'] },
  ], 'cyan'),
  buildCareer('embedded-systems-engineer', 'Embedded Systems Engineer', 'Hardware', 'Connect software to physical devices with careful attention to timing and safety.', ['C', 'C++', 'Electronics', 'Microcontrollers', 'Embedded Linux', 'Networking', 'Testing'], ['C and C++ foundations', 'Digital electronics', 'Microcontroller I/O', 'Timing and interrupts', 'Communication protocols', 'Embedded Linux', 'Testing and safety', 'Build a device prototype'], [
    { title: 'Sensor Data Logger', level: 'Beginner', description: 'Read a sensor and record measurements on a development board.', requirements: ['Safe voltage levels', 'Sampling notes', 'Readable output'] },
    { title: 'Campus Environment Monitor', level: 'Intermediate', description: 'Build a small monitor with clear data and reliability behavior.', requirements: ['Sensor calibration', 'Local display', 'Failure handling'] },
    { title: 'Connected Device Prototype', level: 'Advanced', description: 'Connect an embedded device to a service with secure update notes.', requirements: ['Protocol design', 'Secure credentials', 'Test plan'] },
  ], 'lime'),
  buildCareer('blockchain-developer', 'Blockchain Developer', 'Software', 'Understand distributed ledgers and build transparent, carefully scoped applications.', ['JavaScript', 'Solidity', 'Cryptography', 'Smart Contracts', 'Testing', 'Web Security', 'Git'], ['Distributed systems', 'Cryptographic primitives', 'Ledger concepts', 'Smart contract language', 'Contract testing', 'Wallet integration', 'Threat modeling', 'Local test deployment'], [
    { title: 'Local Token Ledger', level: 'Beginner', description: 'Explore ledger concepts in a local, non-production environment.', requirements: ['Local network only', 'Basic tests', 'Clear limitations'] },
    { title: 'Auditable Grant Registry', level: 'Intermediate', description: 'Prototype a transparent registry with explicit privacy boundaries.', requirements: ['Data minimization', 'Access rules', 'Threat review'] },
    { title: 'Smart Contract Security Lab', level: 'Advanced', description: 'Test and document common contract failure modes locally.', requirements: ['Test-only funds', 'Adversarial tests', 'Remediation notes'] },
  ], 'orange'),
  buildCareer('product-designer', 'Product Designer', 'Design', 'Connect user needs, product strategy, and polished interaction design.', ['Product Thinking', 'User Research', 'Figma', 'Prototyping', 'Accessibility', 'Analytics', 'Communication'], ['Understand the problem', 'Research users', 'Map journeys', 'Prototype options', 'Validate decisions', 'Design systems', 'Measure outcomes', 'Tell the product story'], [
    { title: 'Campus Service Improvement', level: 'Beginner', description: 'Choose one service and identify a measurable user problem.', requirements: ['Problem statement', 'User journey', 'Testable concept'] },
    { title: 'Cross-platform Product Flow', level: 'Intermediate', description: 'Design a consistent multi-device workflow.', requirements: ['Responsive behavior', 'Prototype', 'Usability feedback'] },
    { title: 'Product Strategy Case Study', level: 'Advanced', description: 'Connect research, prioritization, delivery, and outcome measurement.', requirements: ['Prioritization rationale', 'Success metric', 'Iteration plan'] },
  ], 'pink'),
  buildCareer('technical-writer', 'Technical Writer', 'Communication', 'Make complex systems understandable through accurate, useful documentation.', ['Technical Writing', 'Information Architecture', 'Markdown', 'Git', 'API Documentation', 'Research', 'Editing'], ['Audience and task analysis', 'Plain language', 'Information architecture', 'Markdown and Git', 'API documentation', 'Technical review', 'Accessibility', 'Publish a documentation set'], [
    { title: 'Getting Started Guide', level: 'Beginner', description: 'Help a new user complete one task from setup to success.', requirements: ['Tested steps', 'Expected results', 'Troubleshooting notes'] },
    { title: 'API Reference', level: 'Intermediate', description: 'Document endpoints with clear examples and error cases.', requirements: ['Request and response examples', 'Authentication notes', 'Error reference'] },
    { title: 'Documentation Site', level: 'Advanced', description: 'Create a versioned documentation set for a small software product.', requirements: ['Navigation structure', 'Review workflow', 'Content maintenance plan'] },
  ], 'slate'),
  buildCareer('digital-marketer', 'Digital Marketer', 'Business', 'Plan and evaluate digital campaigns with a strong focus on audience and evidence.', ['Marketing Strategy', 'Content Writing', 'SEO', 'Analytics', 'Social Media', 'Email Marketing', 'Communication'], ['Audience research', 'Campaign goals', 'Content strategy', 'Search fundamentals', 'Analytics', 'Experiment design', 'Ethical outreach', 'Present campaign results'], [
    { title: 'Student Club Campaign', level: 'Beginner', description: 'Plan a small campaign around a real campus event.', requirements: ['Audience and goal', 'Content calendar', 'Simple measurement plan'] },
    { title: 'Campus Opportunity Newsletter', level: 'Intermediate', description: 'Create a useful, consent-based newsletter and evaluate engagement.', requirements: ['Opt-in audience', 'Accessible content', 'Privacy-aware metrics'] },
    { title: 'Multi-channel Campaign', level: 'Advanced', description: 'Design a campaign with clear assumptions and an evaluation loop.', requirements: ['Channel strategy', 'Experiment plan', 'Results and next steps'] },
  ], 'amber'),
]

export const PROFESSIONAL_SKILLS = [
  { name: 'Communication', topics: ['Listen actively', 'Adapt to your audience', 'Structure a clear message'] },
  { name: 'English Speaking', topics: ['Everyday fluency', 'Useful technical vocabulary', 'Clear and confident delivery'] },
  { name: 'Public Speaking', topics: ['Open with a clear point', 'Use signposting', 'Practice delivery and pacing'] },
  { name: 'Presentation', topics: ['Audience and purpose', 'Readable slide design', 'Rehearsal and Q&A'] },
  { name: 'Interview Skills', topics: ['Prepare examples', 'Structure concise answers', 'Ask thoughtful questions'] },
  { name: 'Resume Writing', topics: ['Tailor to a role', 'Show evidence and outcomes', 'Proofread for clarity'] },
  { name: 'Email Writing', topics: ['Useful subject lines', 'Concise context and request', 'Professional follow-up'] },
  { name: 'Teamwork', topics: ['Agree on responsibilities', 'Share progress early', 'Resolve disagreement constructively'] },
  { name: 'Leadership', topics: ['Set a shared direction', 'Support participation', 'Reflect and adapt'] },
  { name: 'Problem Solving', topics: ['Define the problem', 'Compare options', 'Review the result'] },
  { name: 'Time Management', topics: ['Prioritize outcomes', 'Break work into steps', 'Review commitments'] },
  { name: 'Group Discussion', topics: ['Build on others’ points', 'Support claims with reasons', 'Invite balanced participation'] },
  { name: 'Professional Etiquette', topics: ['Respect time and boundaries', 'Communicate reliably', 'Handle feedback constructively'] },
].map((skill, index) => ({ ...buildSkill(skill.name, 'a professional'), ...skill, id: `professional-${index + 1}` }))

export const INTERVIEW_QUESTIONS = [
  { category: 'HR Interview', question: 'Tell me about yourself.', tips: ['Keep it relevant to the role.', 'Connect your background to one or two examples.', 'Finish with what you want to contribute next.'], structure: 'Present: your current focus. Past: one relevant project or experience. Future: why this opportunity fits what you want to learn and contribute.' },
  { category: 'Technical Interview', question: 'Describe a technical problem you solved.', tips: ['Explain the constraints before the solution.', 'Compare alternatives briefly.', 'Share what you would improve next time.'], structure: 'Context, constraints, options considered, decision, result, and reflection.' },
  { category: 'Aptitude', question: 'How would you approach a problem you have never seen before?', tips: ['Clarify the question.', 'State assumptions.', 'Check the result for reasonableness.'], structure: 'Clarify, break the problem into parts, work through a method, then verify.' },
  { category: 'Coding Interview', question: 'How do you make a solution easier to test and maintain?', tips: ['Start with a simple working approach.', 'Name edge cases.', 'Explain complexity and trade-offs.'], structure: 'Restate the task, outline a baseline, test edge cases, refine, and explain trade-offs.' },
  { category: 'Group Discussion', question: 'How would you help a group reach a decision when views differ?', tips: ['Summarize viewpoints fairly.', 'Bring the discussion back to shared criteria.', 'Invite quieter participants in.'], structure: 'Acknowledge, compare evidence against agreed criteria, invite perspectives, and summarize a next step.' },
  { category: 'Communication', question: 'Explain a project you built to someone outside your field.', tips: ['Lead with the user problem.', 'Avoid unexplained acronyms.', 'Use one concrete example.'], structure: 'Problem, what you built, how someone uses it, and what changed.' },
]

export const OPPORTUNITY_TYPES = ['Internship', 'Placement', 'Workshop', 'Hackathon', 'Certification', 'Competition', 'Training', 'Mentorship']
export const OPPORTUNITY_FILTERS = ['All', 'Internship', 'Placement', 'Workshop', 'Hackathon', 'Remote', 'On Campus']

export const DEMO_COMPANIES = [
  { id: 'google', name: 'Google', industry: 'Technology', verification_status: 'verified', website: 'https://careers.google.com', description: 'Google builds products used by billions — Search, Maps, YouTube, Android, and Cloud. They hire engineers, designers, analysts, and product managers across all experience levels.', logo_color: '#4285F4' },
  { id: 'amazon', name: 'Amazon', industry: 'E-commerce & Cloud', verification_status: 'verified', website: 'https://www.amazon.jobs', description: 'Amazon operates the world\'s largest e-commerce platform and AWS, the leading cloud provider. They offer internships and placements in software engineering, data science, operations, and more.', logo_color: '#FF9900' },
  { id: 'microsoft', name: 'Microsoft', industry: 'Technology', verification_status: 'verified', website: 'https://careers.microsoft.com', description: 'Microsoft builds Azure, Office 365, GitHub, and Xbox. They run one of the largest campus hiring programs globally with roles in engineering, design, research, and business.', logo_color: '#00A4EF' },
  { id: 'infosys', name: 'Infosys', industry: 'IT Services', verification_status: 'verified', website: 'https://www.infosys.com/careers', description: 'Infosys is one of India\'s largest IT services companies, offering campus placements in software engineering, consulting, and digital transformation across global clients.', logo_color: '#007CC3' },
  { id: 'tcs', name: 'TCS', industry: 'IT Services', verification_status: 'verified', website: 'https://www.tcs.com/careers', description: 'Tata Consultancy Services (TCS) is a global IT leader hiring thousands of campus graduates each year in software development, testing, analytics, and enterprise solutions.', logo_color: '#003087' },
  { id: 'wipro', name: 'Wipro', industry: 'IT Services', verification_status: 'verified', website: 'https://careers.wipro.com', description: 'Wipro provides IT, consulting, and business process services worldwide. Their campus program recruits engineers and analysts for projects across banking, healthcare, and retail.', logo_color: '#341C6E' },
  { id: 'hcl', name: 'HCL Technologies', industry: 'IT Services', verification_status: 'verified', website: 'https://www.hcltech.com/careers', description: 'HCL Technologies is a global technology company offering campus roles in software engineering, cloud, cybersecurity, and digital services for Fortune 500 clients.', logo_color: '#0076CE' },
  { id: 'accenture', name: 'Accenture', industry: 'Consulting & Technology', verification_status: 'verified', website: 'https://www.accenture.com/in-en/careers', description: 'Accenture is a global professional services company hiring campus talent in technology consulting, AI, cloud engineering, and digital transformation.', logo_color: '#A100FF' },
  { id: 'cognizant', name: 'Cognizant', industry: 'IT Services', verification_status: 'verified', website: 'https://careers.cognizant.com', description: 'Cognizant offers campus placements in software development, data analytics, and digital engineering, working with clients across healthcare, finance, and retail.', logo_color: '#1A6496' },
  { id: 'meta', name: 'Meta', industry: 'Social Technology', verification_status: 'verified', website: 'https://www.metacareers.com', description: 'Meta builds Facebook, Instagram, WhatsApp, and Reality Labs. They hire software engineers, data scientists, and product designers through internship and new grad programs.', logo_color: '#0866FF' },
  { id: 'flipkart', name: 'Flipkart', industry: 'E-commerce', verification_status: 'verified', website: 'https://www.flipkartcareers.com', description: 'Flipkart is India\'s leading e-commerce company offering campus roles in software engineering, data science, product management, and supply chain technology.', logo_color: '#F74D00' },
  { id: 'adobe', name: 'Adobe', industry: 'Software', verification_status: 'verified', website: 'https://www.adobe.com/careers.html', description: 'Adobe creates creative and document tools used by millions. They hire engineers, designers, and data scientists through internship and campus placement programs.', logo_color: '#FF0000' },
]

export const DEMO_OPPORTUNITIES = [
  { id: 'opp-1', company_id: 'google', title: 'Software Engineering Intern', opportunity_type: 'Internship', role: 'SWE Intern', location: 'Bangalore / Hyderabad', mode: 'on_campus', deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], required_skills: ['Python', 'Data Structures', 'Algorithms', 'Git'], description: 'Work on real Google products alongside full-time engineers. Interns contribute to production code and present their work at the end of the term.', eligibility: 'B.Tech / B.E. students in 3rd or 4th year. CGPA 7.5+', application_url: 'https://careers.google.com/students/', application_method: 'Apply via Google Careers portal. Shortlisting based on resume and coding assessment.', status: 'published' },
  { id: 'opp-2', company_id: 'amazon', title: 'SDE Intern — AWS', opportunity_type: 'Internship', role: 'Software Development Engineer', location: 'Hyderabad', mode: 'on_campus', deadline: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0], required_skills: ['Java', 'Python', 'Data Structures', 'SQL', 'Git'], description: 'Join an AWS team and build features used by millions of developers. Amazon interns work on real projects with full ownership and mentorship.', eligibility: 'Final year B.Tech / M.Tech students. Strong DSA fundamentals required.', application_url: 'https://www.amazon.jobs/en/teams/internships-for-students', application_method: 'Apply on Amazon Jobs. Online assessment followed by technical interviews.', status: 'published' },
  { id: 'opp-3', company_id: 'microsoft', title: 'Software Engineering Intern', opportunity_type: 'Internship', role: 'SWE Intern', location: 'Hyderabad / Noida', mode: 'on_campus', deadline: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], required_skills: ['C#', 'JavaScript', 'React', 'Git', 'Algorithms'], description: 'Microsoft interns work on Azure, Office, or Xbox teams. You will ship real features, get mentorship from senior engineers, and attend exclusive intern events.', eligibility: 'Pre-final and final year B.Tech / M.Tech. Open to all branches.', application_url: 'https://careers.microsoft.com/students/us/en/usuniversityinternship', application_method: 'Apply via Microsoft Careers. Resume screening + 2 technical rounds.', status: 'published' },
  { id: 'opp-4', company_id: 'infosys', title: 'Campus Placement — Systems Engineer', opportunity_type: 'Placement', role: 'Systems Engineer', location: 'Pan India', mode: 'on_campus', deadline: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], required_skills: ['Python', 'Java', 'SQL', 'Communication'], description: 'Infosys Systems Engineer role is the flagship campus hire position. You will work on client projects in software development, testing, and maintenance.', eligibility: 'B.Tech / B.E. / MCA / M.Sc. with 60%+ throughout. No active backlogs.', application_url: 'https://www.infosys.com/careers/campus.html', application_method: 'Apply via InfyTQ platform. Aptitude test + technical + HR interview.', status: 'published' },
  { id: 'opp-5', company_id: 'tcs', title: 'TCS National Qualifier Test — NQT', opportunity_type: 'Placement', role: 'Assistant System Engineer', location: 'Pan India', mode: 'on_campus', deadline: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0], required_skills: ['C', 'Java', 'Python', 'SQL', 'Aptitude'], description: 'TCS NQT is the gateway to TCS campus placements. Clearing NQT qualifies you for the TCS interview process for the Assistant System Engineer role.', eligibility: 'B.Tech / B.E. / M.Tech / MCA with 60%+ aggregate. 2025 and 2026 batch.', application_url: 'https://www.tcs.com/careers/tcs-nqt', application_method: 'Register on TCS iON portal. NQT exam + technical + HR interview.', status: 'published' },
  { id: 'opp-6', company_id: 'wipro', title: 'Elite National Talent Hunt', opportunity_type: 'Placement', role: 'Project Engineer', location: 'Pan India', mode: 'on_campus', deadline: new Date(Date.now() + 40 * 86400000).toISOString().split('T')[0], required_skills: ['Java', 'Python', 'SQL', 'Communication', 'Aptitude'], description: 'Wipro Elite NTH is a campus hiring program for top engineering talent. Selected candidates join as Project Engineers with a competitive package.', eligibility: 'B.Tech / B.E. with 6.5 CGPA or 65% aggregate. 2025 batch.', application_url: 'https://careers.wipro.com/careers-home/jobs', application_method: 'Apply via Wipro Careers. Online test + technical interview + HR round.', status: 'published' },
  { id: 'opp-7', company_id: 'accenture', title: 'Associate Software Engineer', opportunity_type: 'Placement', role: 'Associate Software Engineer', location: 'Pan India', mode: 'on_campus', deadline: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0], required_skills: ['JavaScript', 'Python', 'SQL', 'Communication'], description: 'Accenture hires campus talent as Associate Software Engineers to work on digital transformation projects for global clients across industries.', eligibility: 'B.Tech / B.E. / MCA / M.Sc. with 60%+ aggregate. No active backlogs.', application_url: 'https://www.accenture.com/in-en/careers/local/campus-hiring', application_method: 'Apply via Accenture campus portal. Cognitive + technical + communication assessment.', status: 'published' },
  { id: 'opp-8', company_id: 'flipkart', title: 'Software Development Engineer Intern', opportunity_type: 'Internship', role: 'SDE Intern', location: 'Bangalore', mode: 'on_campus', deadline: new Date(Date.now() + 22 * 86400000).toISOString().split('T')[0], required_skills: ['Data Structures', 'Algorithms', 'Java', 'Python', 'SQL'], description: 'Flipkart interns work on high-scale systems powering India\'s largest e-commerce platform. You will own a feature end-to-end with mentorship from senior engineers.', eligibility: 'Pre-final year B.Tech / M.Tech. Strong problem-solving skills required.', application_url: 'https://www.flipkartcareers.com', application_method: 'Apply via Flipkart Careers. Coding test + 2-3 technical interviews.', status: 'published' },
  { id: 'opp-9', company_id: 'meta', title: 'Software Engineer Intern', opportunity_type: 'Internship', role: 'SWE Intern', location: 'Remote / Hyderabad', mode: 'remote', deadline: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0], required_skills: ['Python', 'React', 'Data Structures', 'Algorithms', 'Git'], description: 'Meta interns work on Facebook, Instagram, or WhatsApp infrastructure. You will contribute to production systems and present your project to the team.', eligibility: 'B.Tech / M.Tech students. Strong CS fundamentals and coding skills.', application_url: 'https://www.metacareers.com/careerprograms/students/', application_method: 'Apply via Meta Careers. Coding assessment + 2 technical interviews.', status: 'published' },
  { id: 'opp-10', company_id: 'adobe', title: 'Research Intern — AI/ML', opportunity_type: 'Internship', role: 'AI/ML Research Intern', location: 'Noida / Bangalore', mode: 'on_campus', deadline: new Date(Date.now() + 32 * 86400000).toISOString().split('T')[0], required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Statistics'], description: 'Adobe Research interns work on cutting-edge AI projects in generative media, document intelligence, and creative tools. Publish-quality research is encouraged.', eligibility: 'M.Tech / PhD students with strong ML background. Publications are a plus.', application_url: 'https://www.adobe.com/careers.html', application_method: 'Apply via Adobe Careers. Research statement + technical interview.', status: 'published' },
  { id: 'opp-11', company_id: 'cognizant', title: 'Programmer Analyst Trainee', opportunity_type: 'Placement', role: 'Programmer Analyst Trainee', location: 'Pan India', mode: 'on_campus', deadline: new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0], required_skills: ['Java', 'Python', 'SQL', 'Communication', 'Aptitude'], description: 'Cognizant\'s campus hire program places fresh graduates as Programmer Analyst Trainees working on enterprise software projects for global clients.', eligibility: 'B.Tech / B.E. / MCA with 60%+ aggregate. 2025 batch. No active backlogs.', application_url: 'https://careers.cognizant.com/global/en/campus-hiring', application_method: 'Apply via Cognizant Careers. GenC assessment + technical + HR interview.', status: 'published' },
  { id: 'opp-12', company_id: 'hcl', title: 'Graduate Engineer Trainee', opportunity_type: 'Placement', role: 'Graduate Engineer Trainee', location: 'Pan India', mode: 'on_campus', deadline: new Date(Date.now() + 42 * 86400000).toISOString().split('T')[0], required_skills: ['Java', 'C++', 'SQL', 'Networking', 'Communication'], description: 'HCL Technologies hires Graduate Engineer Trainees for software development, cloud, and cybersecurity projects across global delivery centers.', eligibility: 'B.Tech / B.E. with 60%+ aggregate. All branches. 2025 batch.', application_url: 'https://www.hcltech.com/careers/campus-hiring', application_method: 'Apply via HCL Careers. Aptitude test + technical + HR interview.', status: 'published' },
]

export function getOpportunityMatch(requiredSkills = [], studentSkills = []) {
  const normalizedStudentSkills = new Set(studentSkills.map(skill => skill.toLowerCase().trim()))
  const required = [...new Set(requiredSkills.map(skill => skill.trim()).filter(Boolean))]
  const matched = required.filter(skill => normalizedStudentSkills.has(skill.toLowerCase()))
  const missing = required.filter(skill => !normalizedStudentSkills.has(skill.toLowerCase()))
  return { percent: required.length ? Math.round(matched.length / required.length * 100) : 0, matched, missing }
}

export function getProfileCompletion(profile = {}) {
  const fields = ['headline', 'about', 'skills', 'github_url', 'linkedin_url', 'portfolio_url', 'resume_path']
  return Math.round(fields.filter(field => Array.isArray(profile[field]) ? profile[field].length > 0 : Boolean(profile[field])).length / fields.length * 100)
}