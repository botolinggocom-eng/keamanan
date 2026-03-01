importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAo-nP5XZGK8NqMsjSiHb64--qqUZgB_eM",
  databaseURL: "https://siagadesa10-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "siagadesa10",
  messagingSenderId: "24091093796",
  appId: "1:24091093796:web:6773efecd9f7a6f4e0a1b1"
});

const messaging = firebase.messaging();
