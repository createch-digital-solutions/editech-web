export function StripeDivider() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="h-[18px] w-full bg-repeat-x"
      style={{ backgroundImage: "url('/kente-strip.png')", backgroundSize: 'auto 18px' }}
    />
  );
}
