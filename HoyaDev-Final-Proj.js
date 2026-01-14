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
const addStudentForm = document.getElementById("add-student");
const newStudentInput = document.getElementById("new-student-input");
const studentList = document.getElementById("student-list");
const addClassForm = document.getElementById("add-class");
const newClassInput = document.getElementById("new-class-input");
const classesList = document.getElementById("classes-list");


// Reference to our collection: "Computer Science" --- at least one class
const studentsColRef = collection(db, "student");
const classesColRef = collection(db, "classes");
// --- CLASS CREATION ---
addStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = newStudentInput.value.trim();
    // Default to 'classes' if empty
    // const text = newStudentInput.value.trim();
    if (!text) return;
    try {     // If className doesn't exist, Firebase creates it automatically on this line
        await addDoc(studentsColRef, {
            text,
            absent: false,
            createdAt: serverTimestamp(),
        });
        newStudentInput.value = "";
    } catch (err) {
        console.error("Error adding document: ", err);
        alert("Error adding item, check console.");
    }
});
// 5. Real-time Read (listen to collection changes)
const qItems = query(studentsColRef, orderBy("createdAt", "asc"));
onSnapshot(qItems, (snapshot) => {
  // Clear the list
  studentList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    renderStudent(id, data);
  });
});
// 6. Render a single item (and wire up Update/Delete)
function renderStudent(id, data) {
  const li = document.createElement("li");
  li.className = "student";
  const left = document.createElement("div");
  left.className = "student-left";
  const textP = document.createElement("p");
  textP.className = "student-text";
  textP.textContent = data.text || "";
  if (data.absent) {
    textP.classList.add("absent");
  }
  left.appendChild(textP);
  const buttons = document.createElement("div");
  buttons.className = "student-buttons";
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = data.absent ? "Absent" : "not Absent";
  toggleBtn.className = "toggle-btn";
  buttons.appendChild(toggleBtn);
  li.appendChild(left);
  li.appendChild(buttons);
  studentList.appendChild(li);
//   Update: toggle absent
  toggleBtn.addEventListener("click", async () => {
    try {
      const docRef = doc(db, "student", id);
      await updateDoc(docRef, {absent: !data.absent,});
    }catch (err) {
      console.error("Error updating document: ", err);
      alert("Error updating item, check console.");
    }
  });
}