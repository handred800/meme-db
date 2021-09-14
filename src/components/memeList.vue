<template>
  <div>
    <div class="taginput-bar">
      <tags-input
        element-id="tags"
        v-model="searchTags"
        placeholder="搜尋標籤"
        :existing-tags="tags"
        :typeahead="true"
        :typeahead-always-show="true"
        :typeahead-hide-discard="true"
      ></tags-input>
    </div>
    <transition-group name="meme-filter" tag="div" class="row" v-if="memes.length > 0">
      <div class="column meme-filter" v-for="meme in filterMemeList" :key="meme.id">
        <div class="thumbnail">
          <a
            @click="deleteMeme(meme.id, meme.name)"
            class="icon-delete"
            v-if="isAdmin"
            >×</a
          >
          <img :src="meme.url" alt="" />
          <!-- <input type="text" v-model="meme.path" readonly @click="copyvalue"> -->
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    tags: Array,
    memes: Array,
    isAdmin: Boolean,
  },
  data() {
    return {
      searchTags: [],
    }
  },
  computed: {
    filterMemeList() {
      let searchTags = this.searchTags.map((tag) => tag.key);

      if(searchTags.length <= 0) return this.memes;

      return this.memes.filter((meme) => {
        let thisTags = meme.tags.map((tag) => tag.key);
        return searchTags.every((tag) => thisTags.includes(tag));
      })
    }
  },
}
</script>
