<template>
  <div id="app">
    <div class="admin-bar">
      <!-- auth section -->
      <form @submit.prevent="signIn">
        <fieldset v-if="!isSignIn">
          <input type="email" v-model="email" placeholder="email" required />
          <input
            type="password"
            v-model="password"
            placeholder="password"
            required
          />
          <button class="btn btn-primary" type="submit">sign in</button>
        </fieldset>
        <fieldset v-else>
          <button class="btn btn-primary" type="button" @click="signOut">sign out</button>
        </fieldset>
      </form>
      <!-- upload section -->
      <form ref="memeForm" @submit.prevent="uploadMeme" v-if="isSignIn">
        <fieldset>
          <tags-input
            element-id="tags"
            value-fields="value"
            v-model="memeData.tags"
            placeholder="標籤"
            :existing-tags="allTags"
            :typeahead-activation-threshold="0"
            typeahead-style="dropdown"
            :typeahead="true"
            :typeahead-hide-discard="true"
          ></tags-input>
          <input type="file" accept="image/*" @change="changeData" required />
          <button class="btn btn-primary" type="submit">upload</button>
        </fieldset>
      </form>
    </div>

    <meme-list :memes="memeList" :tags="allTags" :isAdmin="isSignIn"></meme-list>

  </div>
</template>

<script>
import * as API from './api';
import memeList from '@/components/memeList.vue';

export default {
  components: {
    memeList
  },
  data() {
    return {
      email: "",
      password: "",
      isSignIn: false,
      memeList: [],
      fileData: {
        file: null,
        filename: "",
      },
      memeData: {
        name: "",
        tags: [],
        url: "",
      },
      searchTags: [],
      allTags: [],
    };
  },
  methods: {
    async signIn() {
      try{
        await API.SIGNIN(this.email, this.password)
        this.email = '';
        this.password = '';
      }
      catch(error) {
        console.log(error.message);
      }
    },
    signOut() {
      API.SIGNOUT();
    },
    changeData(e) {
      if(e.target.files[0] === undefined) return;
      this.fileData.file = e.target.files[0];
      this.fileData.filename = this.fileData.file.name;
    },
    async uploadMeme() {
      try {
        const res = await API.UPLOAD_FILE(this.fileData.filename, this.fileData.file);
        const url = await API.GET_IMAGE_URL(res.metadata.fullPath);
        this.memeData.name = this.fileData.filename
        this.memeData.url = url;
        await API.CREATE_DOC('memes', this.memeData);
      }
      catch(error) {
        console.log(error.message);
      }
      // reset form input
      this.$refs.memeForm.reset();
      this.memeData = {
        name: '',
        tags: [],
        url: '',
      }
    },
    async deleteMeme(id, name) {
      try {
        await API.DELETE_DOC('memes', id);
        await API.DELETE_FILE(name);
      }
      catch(error) {
        console.log(error.message);
      }
    },
  },
  computed: {
    filterMemeList() {
      let searchTags = this.searchTags.map((tag) => tag.key);

      if(searchTags.length <= 0) return this.memeList;

      return this.memeList.filter((meme) => {
        let thisTags = meme.tags.map((tag) => tag.key);
        return searchTags.every((tag) => thisTags.includes(tag));
      })
    }
  },
  mounted() {
    API.CREATE_AUTH_STATE_LISTENER((user) => { this.isSignIn = user !== null })
    API.GET_COLLECTION_DOC('tags')
      .then((data) => {
        data.forEach((doc) => {
          this.allTags.push({
            key: doc.id,
            value: doc.data().name
          })
        })
      })
    
    API.CREATE_DOC_LISTENER('memes', (Snapshots) => {
      this.memeList = [];
      Snapshots.forEach((doc) => {
        let meme = Object.assign(doc.data(), { id: doc.id });
        this.memeList.push(meme);
      },(error) => {console.log(error)});
    });

  },
};
</script>
