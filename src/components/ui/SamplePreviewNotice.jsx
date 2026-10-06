export default function SamplePreviewNotice({ children = 'Example data only. This is not part of your live campus record.' }) {
  return <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    <span className="mr-1 font-semibold">Sample preview:</span>{children}
  </div>
}
