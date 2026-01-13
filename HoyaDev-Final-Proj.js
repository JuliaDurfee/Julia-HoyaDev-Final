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

// 1. Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyC9q_nZc9C68QGCOQUkHDLG1pgdbkt5Qa4",
  authDomain: "hoyadevfinalproject.firebaseapp.com",
  projectId: "hoyadevfinalproject",
  storageBucket: "hoyadevfinalproject.firebasestorage.app",
  messagingSenderId: "757320480584",
  appId: "1:757320480584:web:fc40e803d6fbbe15eae57d",
  measurementId: "G-7N6B17X4F6"
};
// 2. Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// 3. DOM elements
const addForm = document.getElementById("add-form");
const newItemInput = document.getElementById("new-item-input");
const itemsList = document.getElementById("items-list");
// Reference to our collection: "items"
const itemsColRef = collection(db, "items");
// 4. Handle Create (add new item)
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = newItemInput.value.trim();
  if (!text) return;
  try {
    await addDoc(itemsColRef, {
      text,
      done: false,
      createdAt: serverTimestamp(),
    });
    newItemInput.value = "";
  } catch (err) {
    console.error("Error adding document: ", err);
    alert("Error adding item, check console.");
  }
});
// 5. Real-time Read (listen to collection changes)
const qItems = query(itemsColRef, orderBy("createdAt", "asc"));
onSnapshot(qItems, (snapshot) => {
  // Clear the list
  itemsList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    renderItem(id, data);
  });
});
// 6. Render a single item (and wire up Update/Delete)
function renderItem(id, data) {
  const li = document.createElement("li");
  li.className = "item";
  const left = document.createElement("div");
  left.className = "item-left";
  const textP = document.createElement("p");
  textP.className = "item-text";
  textP.textContent = data.text || "";
  if (data.done) {
    textP.classList.add("done");
  }
  left.appendChild(textP);
  const buttons = document.createElement("div");
  buttons.className = "item-buttons";
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = data.done ? "Mark not done" : "Mark done";
  toggleBtn.className = "toggle-btn";
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  buttons.appendChild(toggleBtn);
  buttons.appendChild(deleteBtn);
  li.appendChild(left);
  li.appendChild(buttons);
  itemsList.appendChild(li);
  // Update: toggle done
  toggleBtn.addEventListener("click", async () => {
    try {
      const docRef = doc(db, "items", id);
      await updateDoc(docRef, {
        done: !data.done,
      });
    } catch (err) {
      console.error("Error updating document: ", err);
      alert("Error updating item, check console.");
    }
  });
  // Delete
  deleteBtn.addEventListener("click", async () => {
    try {
      const docRef = doc(db, "items", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting document: ", err);
      alert("Error deleting item, check console.");
    }
  });
}