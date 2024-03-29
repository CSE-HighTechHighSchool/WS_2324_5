/*
Name: Thomas Sherlock, James, Bhargav
File Name: depth.js
Date: 1/10/24
Purpose: To supply the function of the depth page through accessing the FRD to 
update, set, get, create chart from, and delete a data point from the data in the FRD
It also will also track if the user is logged in and display the correct name
 */


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


// ----------------------- Get User's Name ------------------------------
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

// ------------------------Set (insert) data into FRD ------------------------
function setData(userID, year, month, day, depth){
    // Must use brackets around variable name to user it as a key
    set(ref(db, 'users/' + userID + '/data/' + year + '/' + month), {
        [day]: depth
    })
    .then(() => {
        alert("Data stored successfully.");
    })
    .catch((error) => {
        alert("There was an error. Error: " + error);
    });
}


// -------------------------Update data in database --------------------------
function updateData(userID, year, month, day, depth){
    // Must use brackets around variable name to user it as a key
    update(ref(db, 'users/' + userID + '/data/' + year + '/' + month), {
        [day]: depth
    })
    .then(() => {
        alert("Data updated successfully.");
    })
    .catch((error) => {
        alert("There was an error. Error: " + error);
    });
}


// ----------------------Get a datum from FRD (single data point)---------------
function getData(userID, year, month, day){

    let yearVal = document.getElementById('yearVal');
    let monthVal = document.getElementById('monthVal');
    let dayVal = document.getElementById('dayVal');
    let depthVal = document.getElementById('depthVal');

    const dbref = ref(db);  // Firebase parameter for getting data

    // Provide the path through the nodes to the data
    get(child(dbref, 'users/' + userID + '/data/' + year + '/' + month)).then((snap) => {
        if(snap.exists()){
            yearVal.textContent = year;
            monthVal.textContent = month;
            dayVal.textContent = day;

            // To get specific value from a key:    snapshot.val()[key]
            depthVal.textContent = snap.val()[day];
        }
        else {
            alert('No data found');
        }
    })
    .catch((error) => {
        alert('Unsuccessful, error: ' + error);
    });

}


// ---------------------------Get a month's data set --------------------------
// Must be an async function because you need to get all the data from FRD
// before you can process it for a table or graph
async function getDataSet(userID, year, month){

    let yearVal = document.getElementById('setYearVal');
    let monthVal = document.getElementById('setMonthVal');

    yearVal.textContent = `Year: ${year}`;
    monthVal.textContent = `Month: ${month}`;
    
    const days = [];
    const depths = [];

    const dbref = ref(db);  // Firebase parameter for requesting data

    // Wait for all data to be pulled from FRD
    // Must provide the path through the nodes to the data.

    await get(child(dbref, 'users/' + userID + '/data/' + year + '/' + month)).then((snapshot) => {
        if(snapshot.exists()){
            console.log(snapshot.val());

            snapshot.forEach(child => {
                console.log(child.key, child.val());
                // Push values to corresponding arrays
                days.push(child.key);
                depths.push(child.val());
            });
        }
        else{
            alert('No data found');
        }
    })
    .catch((error) => {
        alert('Unsuccessful, error: ' + error);
    });

    for(let i = 0; i < days.length; i++){
        console.log(days[i])
    }
    console.log('')
    for(let i = 0; i < depths.length; i++){
        console.log(depths[i])
    }

    return {days, depths};
};

//Function that will create the chart
async function createChart(userID, year, month) {
    const data = await getDataSet(userID, year, month);   // createChart will wait until getChartData() is finished processing
    const ctx = document.getElementById('depthChart');
    const depthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.days,
            datasets: [
                {
                    label: 'Depths (m)',
                    data: data.depths, 
                    fill: false,
                    backgroundColor: 'rgba(5, 29, 250, 0.2)',
                    borderColor: 'rgba(5, 29, 250, 1)',
                    borderWidth: 1
                },
                
            ]
        },
        options: {
            responsive: true,   // Re-size based on screen size
            showLine: false,
            maintainAspectRatio: false, // For responsive charts (keeps original width/height aspect ratio)
            scales: {           // Display options for x & y axes
                x: {
                    title: {
                        display: true,
                        text: 'Days in The Month',   // x-axis title
                        font: {         // font properties
                            size: 20
                        }
                    },
                    ticks: {
                        font: {
                            size: 16
                        },
                        min: 28
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Depth (m)',
                        font: {
                            size: 20
                        }
                    },
                    ticks: {
                        maxTicksLimit: data.depths.length,    //limit # of ticks
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {      //Display options
                title: {
                    display: true,
                    text: 'Depths (m) Reached by Submarines in The Selected Month',
                    font: {
                        size: 24
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    align: 'start',
                    position: 'bottom'
                }
            }
        }
    });
};


// -------------------------Delete a day's data from FRD ---------------------
function deleteData(userID, year, month, day){
    remove(ref(db, 'users/' + userID + '/data/' + year + '/' + month + '/' + day)).then(() => {
        alert('Data removed successfully')
    })
    .catch((error) => {
        alert('Unsuccessful, err: ' + error);
    });
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

        signOutLink.innerText="Sign In";
        signOutLink.classList.replace("nav-link", "btn");
        signOutLink.classList.add("btn-success");
        signOutLink.href = "signIn.html";
    }

    else{
        userLink.innerText = currentUser.firstname;
        userLink.classList.replace("btn", "nav-link");
        userLink.classList.add("btn-primary");
        userLink.href = "#"

        signOutLink.innerText="Sign Out";
        signOutLink.classList.replace("btn", "nav-link");
        signOutLink.classList.add("btn-success");
        document.getElementById('signOut').onclick = function(){
            signOutUser();
        }
    }








// Get, Set, Update, Delete Sharkriver Temp. Data in FRD
// Set (Insert) data function call
document.getElementById('set').onclick = function(){
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    const depth = document.getElementById('depth').value;
    const userID = currentUser.uid;

    setData(userID, year, month, day, depth);
}


// Update data function call
document.getElementById('update').onclick = function(){
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    const depth = document.getElementById('depth').value;
    const userID = currentUser.uid;

    updateData(userID, year, month, day, depth);
}


// Get a datum function call
document.getElementById('get').onclick = function(){
    const year = document.getElementById('getYear').value;
    const month = document.getElementById('getMonth').value;
    const day = document.getElementById('getDay').value;
    const userID = currentUser.uid;

    getData(userID, year, month, day);
};

// Get a data set function call
document.getElementById('getDataSet').onclick = function(){
    const year = document.getElementById('getSetYear').value;
    const month = document.getElementById('getSetMonth').value;
    const userID = currentUser.uid;   
    createChart(userID, year, month);
};

// Delete a single day's data function call
document.getElementById('delete').onclick = function(){
    const year = document.getElementById('delYear').value;
    const month = document.getElementById('delMonth').value;
    const day = document.getElementById('delDay').value;
    const userID = currentUser.uid;

    deleteData(userID, year, month, day);
};

}