<template lang="pug">
  doc-view(v-bind:doc="doc")
    component-example(header="Short")
      v-pagination(
        v-bind:length.number="5",
        v-model="page"
      )
    component-example(header="Long")
      v-pagination(
        v-bind:length.number="15",
        v-model="page2"
      )
    component-example(header="Round")
      v-pagination(
        v-bind:length.number="4",
        v-model="page3"
        circle
      )
    div(slot="markup")
      markup
        |&lt;v-pagination v-bind:length="length" v-model="page"&gt;&lt;/v-pagination&gt;
      markup
        |data () {
        |   return {
        |     length: 5,
        |     page: 1
        |   }
        |}
</template>

<script>
  export default {
    data () {
      return {
        doc: {
          stage: 'comp',
          title: 'Pagination',
          desc: 'The <code>v-pagination</code> component is used to separate long sets of data so that it is easier for a user to consume information. Depending on the length provided, the pagination component will automatically scale. To maintain the current page, simply supply a v-model attribute.',
          params: [
            [
              '<code>&lt;v-pagination&gt;</code>',
              '',
              'Base component'
            ],
            [
              '<code>length</code>',
              'The length of the paginator',
              'Default: 0'
            ],
            [
              '<code>round</code>',
              'Applies the pagination--round class',
              'Default: false'
            ],
            [
              '<code>model</code>',
              '',
              'Accepts Vue v-model'
            ],
          ]
        },
        page: 3,
        page2: 7,
        page3: 4
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
          title: 'Pagination Component | Vuetify',
          h1: 'Pagination',
          description: 'Pagination component for Vuetify Framework',
          keywords: 'vuetify, pagination, components'
        }
      }
    }
  }
</script>