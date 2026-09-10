import Image from 'next/image';
import { Star } from 'lucide-react';

const courses = [
  {
    src: '/course-react-for-beginners.png',
    alt: 'Bestseller: instructor teaching React for Beginners at a computer',
    title: 'React for Beginners',
    instructor: 'Kofi Mensah',
    rating: 4.7,
    students: '2.3k',
    price: '₦15,000',
  },
  {
    src: '/course-financial-literacy-savings.png',
    alt: 'New: instructor for Financial Literacy & Savings at her desk',
    title: 'Financial Literacy & Savings',
    instructor: 'Amara Osei',
    rating: 4.7,
    students: '2.3k',
    price: '₦25,000',
  },
  {
    src: '/course-nodejs-fundamentals.png',
    alt: 'Instructor teaching Node.js Fundamentals to students',
    title: 'Node.js Fundamentals',
    instructor: 'Bola James',
    rating: 4.7,
    students: '2.3k',
    price: '₦18,000',
  },
  {
    src: '/course-uiux-design-systems.png',
    alt: 'Free: instructor teaching UI/UX Design Systems at a laptop',
    title: 'UI/UX Design Systems',
    instructor: 'Chidi Eze',
    rating: 4.7,
    students: '2.3k',
    price: 'Free',
  },
];

export function PopularCourses() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
          Popular Courses
        </h2>

        {/* TODO: Connect to backend GET /courses?sort=popular endpoint */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <article
              key={course.title}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <Image
                src={course.src}
                alt={course.alt}
                width={524}
                height={292}
                className="aspect-video w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-bold text-gray-900">{course.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{course.instructor}</p>

                <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" aria-hidden="true" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-gray-400">&middot; {course.students} students</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={
                      'font-bold ' +
                      (course.price === 'Free' ? 'text-green-600' : 'text-gray-900')
                    }
                  >
                    {course.price}
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
