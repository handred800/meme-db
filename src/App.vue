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
          <button class="btn btn-primary" type="button" @click="signOut">
            sign out
          </button>
        </fieldset>
      </form>
      <!-- upload section -->
      <form ref="memeForm" @submit.prevent="submitData" v-if="isSignIn">
        <fieldset>
          <input
            type="file"
            accept="image/*"
            @change="changeData"
            multiple
          />
          <button class="btn btn-primary" type="submit">upload</button>
        </fieldset>
      </form>
      <div class="row">
        <div
          class="column"
          v-for="(fileData, index) in filesData"
          :key="`${fileData.file.lastModified}-${index}`"
        >
          <div class="thumbnail">
            <img :src="fileData.tempURL" :alt="fileData.name" />
            <a @click="filesData.splice(index, 1)" class="icon-delete">×</a>
            <tags-input
              v-model="filesData[index].tags"
              element-id="tags"
              value-fields="value"
              placeholder="標籤"
              :existing-tags="allTags"
              :typeahead-activation-threshold="0"
              typeahead-style="dropdown"
              :typeahead="true"
              :typeahead-hide-discard="true"
            ></tags-input>
          </div>
        </div>
      </div>
    </div>

    <meme-list
      :memes="memeList"
      :tags="allTags"
      :isAdmin="isSignIn"
    ></meme-list>
  </div>
</template>

<script>
import * as API from "./api";
import memeList from "@/components/memeList.vue";

export default {
  components: {
    memeList,
  },
  data() {
    return {
      email: "",
      password: "",
      isSignIn: false,
      memeList: [],
      filesData: [],
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
      try {
        await API.SIGNIN(this.email, this.password);
        this.email = "";
        this.password = "";
      } catch (error) {
        console.log(error.message);
      }
    },
    signOut() {
      API.SIGNOUT();
    },
    changeData(e) {
      if (e.target.files.length <= 0) {
        this.filesData = [];
        return;
      }
      const filesArray = Object.values(e.target.files);
      this.filesData = filesArray.map((data) => {
        return {
          file: data,
          fileName: data.name,
          tags: [],
          tempURL: URL.createObjectURL(data),
        };
      });

      this.$refs.memeForm.reset();
    },
    async submitData() {
      const promiseArray = this.filesData.map((fileData) => this.uploadMeme(fileData));

      Promise.all(promiseArray).then(() => {
        this.filesData = [];
      });
    },
    async uploadMeme(fileData) {
      try {
        console.log(fileData)
        const res = await API.UPLOAD_FILE(fileData.fileName, fileData.file);
        const url = await API.GET_IMAGE_URL(res.metadata.fullPath);
        return await API.CREATE_DOC("memes", {
          name: fileData.fileName,
          tags: fileData.tags,
          url,
        });
      } catch (error) {
        console.log(error.message);
      }
    },
  },
  computed: {
    filterMemeList() {
      let searchTags = this.searchTags.map((tag) => tag.key);

      if (searchTags.length <= 0) return this.memeList;

      return this.memeList.filter((meme) => {
        let thisTags = meme.tags.map((tag) => tag.key);
        return searchTags.every((tag) => thisTags.includes(tag));
      });
    },
  },
  mounted() {
    API.CREATE_AUTH_STATE_LISTENER((user) => {
      this.isSignIn = user !== null;
    });
    API.GET_COLLECTION_DOC("tags").then((data) => {
      data.forEach((doc) => {
        this.allTags.push({
          key: doc.id,
          value: doc.data().name,
        });
      });
    });

    API.CREATE_DOC_LISTENER("memes", (Snapshots) => {
      this.memeList = [];
      Snapshots.forEach(
        (doc) => {
          let meme = Object.assign(doc.data(), { id: doc.id });
          this.memeList.push(meme);
        },
        (error) => {
          console.log(error);
        }
      );
    });
  },
};
</script>
