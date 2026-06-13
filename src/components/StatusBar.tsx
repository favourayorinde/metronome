export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-[22px] pt-[11px] pb-[2px] flex-shrink-0"
         style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.04em', color: 'var(--color-muted)' }}>
      <span>9:41</span>
      <div className="flex items-center gap-[7px]">
        <span>METRONOME</span>
        <div className="flex" style={{ width: 22, height: 11, border: '1px solid var(--color-muted)', borderRadius: 3, padding: 1.5 }}>
          <div className="flex-1 rounded-[1px]" style={{ background: 'var(--color-muted)' }} />
        </div>
      </div>
    </div>
  );
}
