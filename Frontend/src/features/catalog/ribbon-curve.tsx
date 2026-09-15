/**
 * Single lime ribbon behind the features cards — always visible, no wipe-in.
 */
const RIBBON_GUIDE = "M-80,158 C260,96 480,210 720,168 C960,126 1180,200 1520,140";

export function RibbonCurve({ className = "" }: { className?: string }) {
  return (
    <div className={`ribbon-curve ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" focusable="false">
        <path className="ribbon-curve-band" d={RIBBON_GUIDE} />
      </svg>
    </div>
  );
}
