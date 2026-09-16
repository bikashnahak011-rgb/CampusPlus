import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { useApp } from '../../contexts/AppContext'

const COLORS = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4']

export default function AdminAnalytics() {
  const { complaints, requests, leaveRequests, messFeedback } = useApp()

  // Complaints by category
  const catMap = {}
  complaints.forEach(c => { catMap[c.category] = (catMap[c.category]||0)+1 })
  const catData = Object.entries(catMap).map(([name,value])=>({name,value}))

  // Complaints by status
  const statusMap = {}
  complaints.forEach(c => { statusMap[c.status] = (statusMap[c.status]||0)+1 })
  const statusData = Object.entries(statusMap).map(([name,value])=>({name,value}))

  // Monthly complaints (simulated)
  const monthlyData = [
    {month:'Jul',complaints:12,resolved:10},{month:'Aug',complaints:18,resolved:15},
    {month:'Sep',complaints:22,resolved:19},{month:'Oct',complaints:complaints.length,resolved:complaints.filter(c=>c.status==='Resolved').length},
  ]

  // Mess ratings
  const ratingDist = [1,2,3,4,5].map(r=>({rating:`${r}★`,count:messFeedback.filter(f=>f.rating===r).length}))

  // Requests by type
  const reqMap = {}
  requests.forEach(r=>{ reqMap[r.type]=(reqMap[r.type]||0)+1 })
  const reqData = Object.entries(reqMap).map(([name,value])=>({name,value}))

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Analytics</h1><p className="text-gray-500 text-sm mt-1">Campus data insights and trends</p></div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          {label:'Total Complaints',value:complaints.length,color:'text-red-600'},
          {label:'Resolved',value:complaints.filter(c=>c.status==='Resolved').length,color:'text-green-600'},
          {label:'High Priority',value:complaints.filter(c=>c.priority==='High').length,color:'text-orange-600'},
          {label:'Avg Resolution',value:'4.2 hrs',color:'text-blue-600'},
        ].map(({label,value,color})=>(
          <div key={label} className="card text-center"><p className={`text-2xl font-bold ${color} mb-1`}>{value}</p><p className="text-gray-500 text-xs">{label}</p></div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Complaints by Category</h2>
          {catData.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Complaints by Status</h2>
          {statusData.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Complaint Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:11}} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={2} dot={{r:4}} name="Complaints" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{r:4}} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Mess Ratings Distribution</h2>
          {messFeedback.length === 0
            ? <div className="flex items-center justify-center h-[220px]"><p className="text-gray-400 text-sm">No feedback yet. Students can rate meals from the Mess page.</p></div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ratingDist} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="rating" tick={{fontSize:11}} />
                  <YAxis tick={{fontSize:11}} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6,6,0,0]} name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {reqData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Document Requests by Type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reqData} layout="vertical" margin={{top:0,right:20,left:80,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{fontSize:11}} />
              <YAxis dataKey="name" type="category" tick={{fontSize:11}} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0,6,6,0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
