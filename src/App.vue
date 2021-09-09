<template>
  <div id="app">
    <div class="admin-bar">
      <!-- auth section -->
      <form @submit.prevent="signIn">
        <fieldset v-if="this.uid === ''">
          <input type="email" v-model="email" placeholder="email" required />
          <input
            type="password"
            v-model="password"
            placeholder="password"
            required
          />
          <button class="btn" type="submit">sign in</button>
        </fieldset>
        <fieldset v-else>
          <button class="btn" type="button" @click="signOut">sign out</button>
        </fieldset>
      </form>
      <!-- upload section -->
      <form @submit.prevent="uploadMeme" v-if="this.uid !== ''">
        <fieldset>
          <input type="file" accept="image/*" @change="changeData" />
          <button class="btn" type="submit">upload</button>
        </fieldset>
      </form>
    </div>

    <div class="taginput-bar">
      <tags-input
        element-id="tags"
        v-model="selectedTags"
        :existing-tags="allTags"
        :typeahead="true"
        :typeahead-always-show="true"
      ></tags-input>
    </div>

    <!-- images section -->
    <div class="row" v-if="memeList.length > 0">
      <div class="column" v-for="meme in memeList" :key="meme.id">
        <div class="thumbnail">
          <img :src="meme.path" alt="" />
          <!-- <input type="text" v-model="meme.path" readonly @click="copyvalue"> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseApp = initializeApp({
  apiKey: process.env.VUE_APP_APIKEY,
  authDomain: "lizz-meme.firebaseapp.com",
  projectId: "lizz-meme",
  storageBucket: "lizz-meme.appspot.com",
  messagingSenderId: process.env.VUE_APP_SENDERID,
  appId: process.env.VUE_APP_APPID,
  measurementId: process.env.VUE_APP_GTAG,
});
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export default {
  data() {
    return {
      email: "",
      password: "",
      uid: "",
      memeList: [],
      fileData: {
        file: null,
        filename: "",
      },
      memeData: {
        tags: [""],
        path: "",
      },
      selectedTags: [],
      allTags: [
        { key: "web-development", value: "Web Development" },
        { key: "php", value: "PHP" },
        { key: "javascript", value: "JavaScript" },
      ],
    };
  },
  methods: {
    signIn() {
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then(() => {
          // const user = userCredential.user;
          // console.log(user);
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    signOut() {
      signOut(auth)
        .then(() => {})
        .catch((error) => {
          console.log(error.message);
        });
    },
    changeData(e) {
      this.fileData.file = e.target.files[0];
      this.fileData.filename = this.fileData.file.name;
    },
    uploadMeme() {
      this.uploadFile()
        .then((snapshot) => {
          // console.log(snapshot)
          return this.getImageUrl(snapshot.metadata.fullPath);
        })
        .catch((error) => {
          console.log(error.message);
        })
        .then((url) => {
          this.memeData.path = url;
          return this.createDoc();
        });
    },
    uploadFile() {
      return uploadBytes(
        ref(storage, `images/${this.fileData.filename}`),
        this.fileData.file
      );
    },
    createDoc() {
      return addDoc(collection(db, "memes"), this.memeData);
    },
    getImageUrl(path) {
      return getDownloadURL(ref(storage, path));
    },
    copyvalue(e) {
      e.target.select();
      document.execCommand("copy");
    },
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      // console.log('auth has changed')
      this.uid = user ? user.uid : "";
    });

    onSnapshot(collection(db, "memes"), (Snapshots) => {
      this.memeList = [];
      Snapshots.forEach((doc) => {
        let meme = Object.assign(doc.data(), { id: doc.id });
        this.memeList.push(meme);
      });
    });
  },
};
</script>