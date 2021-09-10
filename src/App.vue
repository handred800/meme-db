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
          <tags-input
            element-id="tags"
            v-model="memeData.tags"
            placeholder="標籤"
            :existing-tags="allTags"
            :typeahead-hide-discard="true"
          ></tags-input>
          <input type="file" accept="image/*" @change="changeData" required />
          <button class="btn" type="submit">upload</button>
        </fieldset>
      </form>
    </div>

    <div class="taginput-bar">
      <tags-input
        element-id="tags"
        v-model="selectedTags"
        placeholder="標籤"
        :existing-tags="allTags"
        :typeahead-activation-threshold="0"
        :typeahead="true"
        :typeahead-always-show="true"
        :typeahead-hide-discard="true"
      ></tags-input>
    </div>

    <!-- images section -->
    <div class="row" v-if="memeList.length > 0">
      <div class="column" v-for="meme in memeList" :key="meme.id">
        <div class="thumbnail">
          <a
            href="#"
            @click="deleteMeme(meme.id, meme.name)"
            class="icon-delete"
            >×</a
          >
          <img :src="meme.url" alt="" />
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
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";

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
        tags: [],
        name: "",
        url: "",
      },
      selectedTags: [],
      allTags: [],
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
          this.memeData.name = this.fileData.filename;
          this.memeData.url = url;
          this.createDoc();
        });
    },
    deleteMeme(id, name) {
      this.deleteDoc(id)
        .then(() => {
          return this.deleteFile(name);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // firebase api
    uploadFile() {
      return uploadBytes(
        ref(storage, `images/${this.fileData.filename}`),
        this.fileData.file
      );
    },
    deleteFile(name) {
      return deleteObject(ref(storage, `images/${name}`));
    },
    createDoc() {
      return addDoc(collection(db, "memes"), this.memeData);
    },
    deleteDoc(id) {
      return deleteDoc(doc(db, "memes", id));
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

    getDocs(collection(db, "tags"))
      .then((data) => {
        data.forEach((doc) => {
          this.allTags.push({
            key: doc.id,
            value: doc.data().name
          })
        })
      })

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
