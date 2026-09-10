const colors = ['#e8562f', '#f2b632', '#2f9e44', '#2f6fb5', '#c92a2a'];

export function StripeDivider() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="h-2 w-full"
      style={{
        backgroundImage: `repeating-linear-gradient(120deg, ${colors
          .map((color, i) => `${color} ${i * 20}%, ${color} ${(i + 1) * 20}%`)
          .join(', ')})`,
      }}
    />
  );
}
