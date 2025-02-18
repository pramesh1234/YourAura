// Import the functions you need from the SDKs you need
// Import Firebase from the official CDN
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

// 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAA4UC7q9C12LuaDMaCh2uGDOap921dwyw",
  authDomain: "youraura-cb7a3.firebaseapp.com",
  projectId: "youraura-cb7a3",
  storageBucket: "youraura-cb7a3.firebasestorage.app",
  messagingSenderId: "749809105267",
  appId: "1:749809105267:web:1a8ee968ef50355089ad06",
  measurementId: "G-8N59CDP4YB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);


// DOM Elements
const authDiv = document.getElementById('auth');
const appDiv = document.getElementById('app');
const userNameSpan = document.getElementById('userName');
const rateUserEmailInput = document.getElementById('rateUserEmail');
const ratingValueInput = document.getElementById('ratingValue');
const submitRatingButton = document.getElementById('submitRating');
const ratingRatioSpan = document.getElementById('ratingRatio');

// Google Login
document.getElementById('googleLogin').addEventListener('click', () => {
    console.log("data google login")
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
 .then((result) => {
      const user = result.user;
      authDiv.style.display = 'none';
      appDiv.style.display = 'block';
      userNameSpan.textContent = user.displayName;
      loadUserData(user.email.replace('.', '_'));
    })
    .catch((error) => {
      console.error('Login failed:', error);
    });
});

// Submit Rating
submitRatingButton.addEventListener('click', () => {
  const raterEmail = auth.currentUser.email.replace('.', '_');
  const ratedUserEmail = rateUserEmailInput.value.replace('.', '_');
  const rating = parseInt(ratingValueInput.value);

  if (rating < 0 || rating > 100) {
    alert('Rating must be between 0 and 100.');
    return;
  }

  // Update ratings
  database.ref(`ratings/${raterEmail}/${ratedUserEmail}`).set(rating)
    .then(() => {
      // Update user's total score and rating ratio
      updateUserScore(ratedUserEmail, rating);
      alert('Rating submitted successfully!');
    })
    .catch((error) => {
      console.error('Error submitting rating:', error);
    });
});

// Update User's Total Score and Rating Ratio
function updateUserScore(userEmail, rating) {
  const userRef = ref(database, 'users/' + userEmail);
  userRef.transaction((user) => {
    if (user) {
      user.totalScore = (user.totalScore || 0) + rating;
      user.totalRatings = (user.totalRatings || 0) + 1;
      user.ratingRatio = (user.totalScore / user.totalRatings).toFixed(2);
    } else {
      user = {
        name: userEmail,
        totalScore: rating,
        totalRatings: 1,
        ratingRatio: rating.toFixed(2)
      };
    }
    return user;
  });
}

// Load User Data
function loadUserData(userEmail) {
  const userRef = database.ref(`users/${userEmail}`);
  userRef.on('value', (snapshot) => {
    const user = snapshot.val();
    if (user) {
      ratingRatioSpan.textContent = user.ratingRatio;
    }
  });
}