export default function DashboardVideoShowcase({ videos = [], showAdminControls = false, onDelete = null }) {
  if (!videos.length) return null

  const [featured, secondary] = videos

  return (
    <div className="card overflow-hidden p-0">
      <div className="p-4 sm:p-5 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Campus Highlights</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Featured events</h2>
          </div>
          {showAdminControls && videos.length >= 2 && (
            <span className="text-xs font-medium text-gray-500">Max 2 videos</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
          {showAdminControls && (
            <button
              type="button"
              onClick={() => onDelete?.(featured.id)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-white"
            >
              Remove
            </button>
          )}
          <div className="relative aspect-video w-full">
            <iframe
              title={featured.title}
              src={featured.embedUrl}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="bg-white/90 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm font-semibold text-gray-900">{featured.title}</p>
          </div>
        </div>

        <div className="space-y-4">
          {secondary && (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
              {showAdminControls && (
                <button
                  type="button"
                  onClick={() => onDelete?.(secondary.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-white"
                >
                  Remove
                </button>
              )}
              <div className="relative aspect-video w-full">
                <iframe
                  title={secondary.title}
                  src={secondary.embedUrl}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="bg-white/90 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-gray-900">{secondary.title}</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Campus updates and event highlights shown here for students and admins.
          </div>
        </div>
      </div>
    </div>
  )
}
