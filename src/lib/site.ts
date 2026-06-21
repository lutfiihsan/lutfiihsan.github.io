export const SITE = {
  name: 'Lutfi Ihsan',
  title: 'Lutfi Ihsan — Full Stack Developer & SysAdmin',
  url: 'https://lutfiihsan.github.io',
  locale: 'id_ID',
  twitter: '@lawlieth404',
  defaultDescription:
    'Portfolio profesional Lutfi Ihsan — Full Stack Developer & SysAdmin dengan 7+ tahun pengalaman. Spesialisasi Laravel, PHP, JavaScript, MySQL, dan infrastruktur server.',
  defaultImage: '/assets/images/hero_anime.webp',
  author: 'Lutfi Ihsan',
};

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lutfi Ihsan',
  url: SITE.url,
  image: `${SITE.url}${SITE.defaultImage}`,
  sameAs: [
    'https://www.linkedin.com/in/lutfi-ihsan-44988b180/',
    'https://github.com/lutfiihsan',
    'https://facebook.com/lutfi.alwaysbdu',
    'https://www.instagram.com/lawlieth404',
  ],
  jobTitle: 'Full Stack Developer & SysAdmin',
  worksFor: {
    '@type': 'Organization',
    name: 'Ummi Foundation',
  },
  description: SITE.defaultDescription,
};

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.defaultDescription,
  author: {
    '@type': 'Person',
    name: SITE.name,
  },
};
