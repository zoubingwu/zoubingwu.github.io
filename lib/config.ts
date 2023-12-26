export const config = {
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

export interface SeoConfig {
  title: string;
  description: string;
  url: string;
  next?: string;
  isArticle?: boolean;
  publishTime?: string;
}

export interface Post {
  url: string;
  date: string;
  title: string;
  description: string;
}

export default config;
