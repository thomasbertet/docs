<template lang="pug">
  doc-view(v-bind:doc="doc")
    v-parallax(
      src="https://s-media-cache-ak0.pinimg.com/originals/e1/00/ef/e100ef3699fa021506561d41e392a148.jpg"
    )
    markup(slot="markup")
      |&lt;v-parallax src="..."&gt;&lt;/v-parallax&gt;
</template>

<script>
  export default {
    name: 'parallax-view',

    data () {
      return {
        doc: {
          stage: 'comp',
          title: 'Parallax',
          desc: 'The <code>v-parallax</code> component creates a 3d effect that makes an image appear to scroll slower than the window.',
          params: [
            [
              '<code>&lt;v-parallax&gt;</code>',
              '',
              'Base component'
            ],
            [
              '<code>src</code>',
              'The image to parallax',
              'Required: true'
            ],
            [
              '<code>height</code>',
              'The height of the parallax container',
              'Default: 500'
            ]
          ]
        }
      }
    },

    mounted () {
      this.$emit('view', this.meta())
    },

    preFetch () {
      return this.methods.meta()
    },

    methods: {
      meta () {
        return {
          title: 'Parallax Component | Vuetify',
          h1: 'Parallax',
          description: 'Parallax component for Vuetify Framework',
          keywords: 'vuetify, parallax, components'
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .parallax
    margin: 15rem 0
    
  .parallax__content    
    h1
      font-weight: 300
      white-space: nowrap
      
    p
      font-weight: 100
    h1
      margin: 2rem 0
      
    p
      font-size: 1.2rem      
      
    .btn
      border-radius: 0
      margin: 4rem 2rem 0 0
</style>