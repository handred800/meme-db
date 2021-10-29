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
    <transition-group v-masonry item-selector=".column" name="meme-filter" tag="div" class="row">
      <div v-masonry-tile class="column meme-filter" v-for="meme in filterMemeList" :key="meme.id">
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
import * as API from "../api";
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
  methods: {
    async deleteMeme(id, name) {
      try {
        await API.DELETE_DOC("memes", id);
        await API.DELETE_FILE(name);
      } catch (error) {
        console.log(error.message);
      }
    },
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
