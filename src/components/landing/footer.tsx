import Link from 'next/link';
import { FacebookIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from './social-icons';

const columns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Learning Paths', href: '/paths' },
      { label: 'AI Coach', href: '/aria' },
      { label: 'Community', href: '/community' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'For instructors',
    links: [
      { label: 'Become an instructor', href: '/portal' },
      { label: 'Instructor Guide', href: '/portal/guide' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Resources', href: '/portal/resources' },
      { label: 'Success Stories', href: '/portal/success-stories' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'Twitter', href: 'https://twitter.com', Icon: TwitterIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: LinkedinIcon },
  { label: 'YouTube', href: 'https://youtube.com', Icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="bg-[#0f1730] py-14 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
                cE
              </span>
              <span className="text-lg font-bold text-white">
                Createch<span className="text-orange-500">Elevate</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              AI-powered learning for the next generation of African innovators.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold text-white">{column.heading}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm">&copy; {new Date().getFullYear()} CreatechElevate. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
