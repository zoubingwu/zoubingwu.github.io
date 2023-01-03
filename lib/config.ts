const config = {
  name: "zoubingwu's blog",
  domain: 'https://zoubingwu.com',
  author: {
    twitter: 'chow_won',
    github: 'zoubingwu',
    email: 'zoubingwu@gmail.com',
  },
  copyright: {
    year: `2016-${new Date().getFullYear()}`,
    name: 'zoubingwu',
  },
  googleAnalytics: 'UA-100363260-1',
  timezone: 'Asia/Beijing',
  permalink: '/:year-:month-:day/:title/',
  paginate: 10,
  paginatePath: '/page:num',
  output: 'dist',
  shikiTheme: 'one-dark-pro',
};

export type SiteConfig = typeof config;

export default config;
