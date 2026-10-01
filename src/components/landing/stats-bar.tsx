const stats = [
  { value: '50k+', label: 'Learners' },
  { value: '500k+', label: 'Courses' },
  { value: '4.9', label: 'Average rating' },
  { value: '100+', label: 'Instructors' },
];

export function StatsBar() {
  return (
    <section className="bg-[#fdf6ec] px-0 lg:px-[31px]">
      <div className="mx-auto max-w-[1338px] bg-brand-night">
        <dl className="grid max-w-[1220px] grid-cols-2 gap-y-6 py-6 text-center sm:grid-cols-4 lg:px-[18px]">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-body text-[34px] font-bold leading-[48px] text-white sm:text-[44px]">
                {stat.value}
              </dd>
              <div className="mt-[11px] font-body text-lg leading-6 text-white/85">{stat.label}</div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
