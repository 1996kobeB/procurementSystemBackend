const areaList = [
  {
    name: '广西',
    url: 'http://www.ccgp-guangxi.gov.cn/reformColumn/ZcyAnnouncement10016/index.html',
    ul:'div.list-container ul',
    box: 'li.list-item',
    area: ['a', '.district'],
    time: ['span.date'],
    title: ['a', 'title'],
    href: ['http://www.ccgp-guangxi.gov.cn','a','href']
  },
  {
    name: '海南',
    url: 'https://www.ccgp-hainan.gov.cn/cgw/cgw_list.jsp',
    ul:'div.index07_07_02 ul',
    box: 'li',
    area: ['span', 'p'],
    time: ['em'],
    title: ['a'],
    href: ['https://www.ccgp-hainan.gov.cn','a','href']
  },

]
export { areaList }