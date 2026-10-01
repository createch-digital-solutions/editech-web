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
    <footer className="bg-[#101828] font-body text-[#99a1af]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 px-6 pb-[45px] pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:pl-[107px] lg:pr-[89px]">
          <div>
            <div className="flex items-center gap-[15px]">
              <span className="flex h-[43px] w-[43px] items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
                cE
              </span>
              <span className="font-display text-base font-bold text-white">
                Createch<span className="text-[#cf7d0b]">Elevate</span>
              </span>
            </div>
            <p className="mt-[24px] max-w-[245px] text-[15px] leading-7">
              AI-powered learning for the next generation of African innovators
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-[17px] font-semibold leading-6 text-white">{column.heading}</h3>
              <ul className="mt-[22px] space-y-[12px] text-[15px] leading-[22px]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#1e2939] px-6 pb-3 pt-[21px] sm:flex-row lg:mr-[162px] lg:pl-[62px] lg:pr-[42px]">
          <p className="text-[15px]">&copy; {new Date().getFullYear()} CreatechElevate. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-[#1e2939] text-white transition-colors hover:bg-[#2a3648]"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
