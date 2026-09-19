export default function Ambient3DBackground({ variant = 'dashboard' }) {
  return (
    <div className={`ambient-3d ambient-3d-${variant}`} aria-hidden="true">
      <div className="ambient-3d-grid ambient-3d-grid-back" />
      <div className="ambient-3d-grid ambient-3d-grid-floor" />
      <div className="ambient-3d-panel ambient-3d-panel-one">
        <span />
        <span />
        <span />
      </div>
      <div className="ambient-3d-panel ambient-3d-panel-two">
        <span />
        <span />
      </div>
      <div className="ambient-3d-data-card">
        <div className="ambient-3d-data-heading" />
        <div className="ambient-3d-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="ambient-3d-orbit">
        <i />
        <i />
        <i />
      </div>
      <div className="ambient-3d-cube">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="ambient-3d-public-shape ambient-3d-public-shape-one" />
      <div className="ambient-3d-public-shape ambient-3d-public-shape-two" />
      <div className="ambient-3d-public-object">
        <div className="ambient-3d-public-object-core" />
        <div className="ambient-3d-public-object-ring ambient-3d-public-object-ring-one" />
        <div className="ambient-3d-public-object-ring ambient-3d-public-object-ring-two" />
      </div>
      <div className="ambient-3d-ring ambient-3d-ring-one" />
      <div className="ambient-3d-ring ambient-3d-ring-two" />
      <div className="ambient-3d-core" />
    </div>
  )
}
