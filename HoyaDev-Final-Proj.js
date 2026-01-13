import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// My Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyC9q_nZc9C68QGCOQUkHDLG1pgdbkt5Qa4",
  authDomain: "hoyadevfinalproject.firebaseapp.com",
  projectId: "hoyadevfinalproject",
  storageBucket: "hoyadevfinalproject.firebasestorage.app",
  messagingSenderId: "757320480584",
  appId: "1:757320480584:web:fc40e803d6fbbe15eae57d",
  measurementId: "G-7N6B17X4F6"
};
// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// DOM elements
const addClassForm = document.getElementById("add-class-form");
const newClassInput = document.getElementById("new-classes-input");
const classesList = document.getElementById("classes-list");
const collectionInput = document.getElementById("collection-name-input"); // NEW: Input for collection name


// Reference to our collection: "Computer Science" --- at least one class
const classesColRef = collection(db, "classes");

// --- CLASS CREATION ---
addClassForm.addEventListener("submit", async (e) => {
  e.preventDefault();
    const className = collectionInput.value.trim() || "classes"; // Default to 'classes' if empty
    // const text = newClassInput.value.trim();
    if (!text) return;
    try {     // If className doesn't exist, Firebase creates it automatically on this line
        const targetColRef = collection(db, className);
        await addDoc(targetColRef, {
            text,
            absent: false,
            createdAt: serverTimestamp(),
        });
        newClassInput.value = "";
    } catch (err) {
        console.error("Error adding document: ", err);
        alert("Error adding item, check console.");
    }
});
// 5. Real-time Read (listen to collection changes)
const qItems = query(classesColRef, orderBy("createdAt", "asc"));
onSnapshot(qItems, (snapshot) => {
  // Clear the list
  classesList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    renderItem(id, data);
  });
});
// 6. Render a single item (and wire up Update/Delete)
function renderItem(id, data, colName) {
  const li = document.createElement("li");
  li.className = "item";
  const left = document.createElement("div");
  left.className = "item-left";
  const textP = document.createElement("p");
  textP.className = "item-text";
  textP.textContent = data.text || "";
  if (data.absent) {
    textP.classList.add("absent");
  }
  left.appendChild(textP);
  const buttons = document.createElement("div");
  buttons.className = "item-buttons";
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = data.absent ? "Absent" : "not Absent";
  toggleBtn.className = "toggle-btn";
  const deleteBtn = document.createElement("button");
  buttons.appendChild(toggleBtn);
  li.appendChild(left);
  li.appendChild(buttons);
  classesList.appendChild(li);
//   Update: toggle absent
  toggleBtn.addEventListener("click", async () => {
    try {
      const docRef = doc(db, colName, id);
      await updateDoc(docRef, {absent: !data.absent,});
    } catch (err) {
      console.error("Error updating document: ", err);
      alert("Error updating item, check console.");
    }
  });
}