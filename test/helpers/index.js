import Vue from 'vue'
import './service'
import './pages'
import './models'
import pageStack from '../../src/index'

Vue.use(pageStack, {
  pages: [
    {
      name: 'PageA',
      path: 'page/a',
      tabBar: true
    },
    {
      name: 'PageB',
      path: 'page/b',
      tabBar: true
    },
    {
      name: 'PageC',
      path: 'page/c'
    },
    {
      name: 'PageD',
      path: 'page/d'
    },
    {
      name: 'PageE',
      path: 'page/e'
    },
    {
      name: 'PageF',
      path: 'page/f',
      tabBar: true
    }
  ]
})
