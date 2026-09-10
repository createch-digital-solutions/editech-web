import Image from 'next/image';

const showcases = [
  {
    src: '/showcase-learning-on-the-go.png',
    alt: 'A young man looking out the window of a bus',
    title: 'Learning on the go',
    description: 'Offline-first, so Lagos traffic is never wasted time',
  },
  {
    src: '/showcase-build-creative-career.png',
    alt: 'A designer working on a laptop at her desk',
    title: 'Build your creative career',
    description: 'Design systems, UI/UX and brand strategy courses',
  },
  {
    src: '/showcase-community-powered-learning.png',
    alt: 'Learners collaborating together in a study group',
    title: 'Community-powered learning',
    description: 'Study groups, forums and peer reviews that actually work',
  },
];

export function ShowcaseGrid() {
  return (
    <section className="bg-[#fdf6ec] py-16">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-3 lg:px-8">
        {showcases.map((item) => (
          <div key={item.title} className="group relative overflow-hidden rounded-2xl">
            <Image
              src={item.src}
              alt={item.alt}
              width={480}
              height={360}
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-200">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
