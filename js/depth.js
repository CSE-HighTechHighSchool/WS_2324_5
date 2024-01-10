
// ----------------- Page Loaded After User Sign-in -------------------------//

// ----------------- Firebase Setup & Initialization ------------------------//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get, remove}
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlSTDINoPAB1QLvgpdwkzIg7uAyXMyQEg",
    authDomain: "submarine-eec39.firebaseapp.com",
    databaseURL: "https://submarine-eec39-default-rtdb.firebaseio.com/",
    projectId: "submarine-eec39",
    storageBucket: "submarine-eec39.appspot.com",
    messagingSenderId: "845236985328",
    appId: "1:845236985328:web:95ce2e143b7212dc065135"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();         

// Returns instance of your app's FRD
const db = getDatabase(app) 



// ---------------------// Get reference values -----------------------------
let userLink = document.getElementById('userLink');    // Username for navbar
let signOutLink = document.getElementById('signOut');  // Sign out link
let currentUser = null;  // Initialize currentUser to null
// ----------------------- Get User's Name'Name ------------------------------
function getUsername(){
    // Grab value for the 'keep logged in' switch
    let keepLoggedIn = localStorage.getItem("keepLoggedIn");

    // Grab user information passed from signIn.js
    if(keepLoggedIn == "yes"){
        currentUser = JSON.parse(localStorage.getItem('user'));
    }
    else{
        currentUser = JSON.parse(sessionStorage.getItem('user'));
    }
}
// Sign-out function that will remove user info from local/session storage and
// sign-out from FRD

function signOutUser(){
    sessionStorage.removeItem('user');       // clear session storage
    localStorage.removeItem('user');         // Clear local storage of user
    localStorage.removeItem('keepLoggedIn');

    signOutLink(auth).then(() => {
        // Sign-out successful
    }).catch((error) => {
        // Error occurred
    });

    window.location = "signIn.html";
}
// --------------------------- Home Page Loading -----------------------------
window.onload = function(){




    // ------------------------- Set Welcome Message -------------------------
    getUsername();      // Get current user's first name
    if(currentUser == null){
        userLink.innerText = "Create New Account";
        userLink.classList.replace("nav-link", "btn");
        userLink.classList.add("btn-primary");
        userLink.href = "register.html"

        console.log(userLink.outerHTML)

        signOutLink.innerText="Sign In";
        signOutLink.classList.replace("nav-link", "btn");
        signOutLink.classList.add("btn-success");
        signOutLink.href = "signIn.html";
    }

    else{
        document.getElementById('popup').hidden=true;
        userLink.innerText = currentUser.firstname;
        userLink.classList.replace("btn", "nav-link");
        userLink.classList.add("btn-primary");
        userLink.classList.add("username");
        userLink.href = "#"


        signOutLink.innerText="Sign Out";
        signOutLink.classList.replace("btn", "nav-link");
        signOutLink.classList.add("btn-success");
        document.getElementById('signOut').onclick = function(){
            signOutUser();
        }
    }
}
