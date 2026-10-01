import Image from 'next/image';

const showcases = [
  {
    src: '/showcase-learning-on-the-go.png',
    alt: 'A young man looking out the window of a bus',
    title: 'Learning on the go',
    description: 'Offline-first, so Lagos traffic is\nnever wasted time',
  },
  {
    src: '/showcase-build-creative-career.png',
    alt: 'A designer working on a laptop at her desk',
    title: 'Build your creative\ncareer',
    description: 'Design systems, UI/UX and\nbrand strategy courses',
  },
  {
    src: '/showcase-community-powered-learning.png',
    alt: 'Learners collaborating together in a study group',
    title: 'Community-powered\nlearning',
    description: 'Study groups, forums and\npeer reviews that actually\nwork',
  },
];

export function ShowcaseGrid() {
  return (
    <section className="bg-[#fdf6ec] px-6 pt-[72px]">
      <div className="mx-auto grid max-w-[1090px] gap-5 sm:grid-cols-3">
        {showcases.map((item) => (
          <div key={item.title} className="group relative overflow-hidden rounded-xl">
            <Image
              src={item.src}
              alt={item.alt}
              width={350}
              height={200}
              unoptimized
              className="aspect-[7/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Warm dark panel over the left 61% only — its hard right edge is part of the design. */}
            <div className="absolute inset-y-0 left-0 w-[61%] bg-gradient-to-t from-[#1c1008]/[0.72] to-transparent to-50%" />
            <div className="absolute bottom-0 left-0 px-5 pb-[18px]">
              <h3 className="whitespace-pre-line font-display text-[15px] font-bold leading-[22px] text-white">
                {item.title}
              </h3>
              <p className="whitespace-pre-line font-body text-xs leading-[18px] text-white/70">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
