// Import the functions you need from the SDKs you need
// Import Firebase from the official CDN
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { getDatabase, ref, set,get, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

// 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAA4UC7q9C12LuaDMaCh2uGDOap921dwyw",
  authDomain: "youraura-cb7a3.firebaseapp.com",
  databaseURL: "https://youraura-cb7a3-default-rtdb.asia-southeast1.firebasedatabase.app",
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
  console.log("Google login clicked");
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("User logged in:", user);
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

  if (isNaN(rating)) {
    alert('Please enter a valid number for the rating.');
    return;
  }

  if (rating < 0 || rating > 100) {
    alert('Rating must be between 0 and 100.');
    return;
  }

  console.log(`Submitting rating: ${rating} from ${raterEmail} to ${ratedUserEmail}`);
  // Update ratings
  const ratingsRef = ref(database, `ratings/${raterEmail}/${ratedUserEmail}`);
  set(ratingsRef, rating)
    .then(() => {
      console.log('Rating submitted successfully!');
      // Update user's total score and rating ratio
      updateUserScore(ratedUserEmail, rating);
      alert('Rating submitted successfully!');
    })
    .catch((error) => {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    });
});

// Update User's Total Score and Rating Ratio
function updateUserScore(userEmail, rating) {
  const userRef = ref(database, `users/${userEmail}`);
  runTransaction(userRef, (user) => {
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
    console.log('User inside transaction:', user);  // Log for debugging
    return user;
  })
  .then(() => {
    console.log('User score updated successfully!');
  })
  .catch((error) => {
    console.error('Error updating user score:', error);
  });
}

// Load User Data
function loadUserData(userEmail) {
  const userRef = ref(database, `users/${userEmail}`);
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        console.log('User data loaded:', user);
        ratingRatioSpan.textContent = user.ratingRatio;
      } else {
        console.log("No data available for user:", userEmail);
      }
    })
    .catch((error) => {
      console.error("Error getting user data:", error);
    });
}