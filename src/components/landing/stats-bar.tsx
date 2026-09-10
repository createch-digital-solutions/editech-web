const stats = [
  { value: '50k+', label: 'Learners' },
  { value: '500k+', label: 'Courses' },
  { value: '4.9', label: 'Average rating' },
  { value: '100+', label: 'Instructors' },
];

export function StatsBar() {
  return (
    <section className="bg-gradient-to-br from-[#241a12] via-[#1e2740] to-[#1a2a52] py-14">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="text-4xl font-extrabold text-white">{stat.value}</dd>
            <div className="mt-1 text-sm text-gray-300">{stat.label}</div>
          </div>
        ))}
      </dl>
    </section>
  );
}
