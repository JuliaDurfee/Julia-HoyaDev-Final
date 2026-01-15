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
const addNewStudent = document.getElementById("add-student");
const newStudentInput = document.getElementById("new-student-input");
const studentList = document.getElementById("student-list");

const addNewClass = document.getElementById("add-class");
const newClassInput = document.getElementById("new-classes-input");
const classesList = document.getElementById("classes-list");


// Reference to our collection: "Computer Science" --- at least one class
const studentsColRef = collection(db, "student");
const classesColRef = collection(db, "classes");

// --------- STUDENT CREATION ---------
// addNewStudent.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const text = newStudentInput.value.trim();
//     if (!text) return;
//     try {    
//         await addDoc(studentsColRef, {
//             text,
//             absent: false,
//             createdAt: serverTimestamp(),
//         });
//         newStudentInput.value = "";
//     } catch (err) {
//         console.error("Error adding document: ", err);
//         alert("Error adding item, check console.");
//     }
// });

addNewClass.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = newClassInput.value.trim();
  if (!text) return;
  try {
    console.log("Sending to Firebase...");
    await addDoc(classesColRef, {
      text,
      done: false,
      createdAt: serverTimestamp()
    });
    newClassInput.value = "";
  } catch (err) {
    console.error("Error adding class: ", err);
  }
});

// async function addStudentToClass(studentName, studentID, studentEmail) {
//   try {
//     // Path: classes/{classId}/students/
//     const studentRef = collection(db, "classes", classId, "students");
//     await addDoc(studentRef, {
//       name: studentName,
//       studentID: studentID,
//       email: studentEmail,
//       joinedAt: serverTimestamp()
//     });
//     console.log(`Student ${studentName} added to class ${classId}`);
//   } catch (e) {
//     console.error("Error adding student: ", e);
//   }
// }


// 5. Real-time Read (listen to collection changes)
// const qStudent = query(studentsColRef, orderBy("createdAt", "asc"));
// onSnapshot(qStudent, (snapshot) => {
//   studentList.innerHTML = "";
//   snapshot.forEach((docSnap) => {
//     const data = docSnap.data();
//     const id = docSnap.id;
//     renderStudent(id, data);
//   });
// });
const qClasses = query(classesColRef, orderBy("createdAt", "asc"));
onSnapshot(qClasses, (snapshot) => {
  // Clear the list
  classesList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    renderClass(id, data);
  });
});


// 6. Render a single item (and wire up Update/Delete)
// function renderClass(id, data) {
//   const li = document.createElement("li");
//   li.className = "classes";
//   const left = document.createElement("div");
//   left.className = "classes-left";
//   const textP = document.createElement("p");
//   textP.className = "classes-text";
//   textP.textContent = data.text || "";
//   if (data.done) {
//     textP.classList.add("done");
//   }
//   left.appendChild(textP);
//   const buttons = document.createElement("div");
//   buttons.className = "student-buttons";
//   const toggleBtn = document.createElement("button");
//   toggleBtn.textContent = data.done ? "Took Attendance" : "Did not take attendance";
//   toggleBtn.className = "toggle-btn";
//   buttons.appendChild(toggleBtn);
//   li.appendChild(left);
//   li.appendChild(buttons);
//   classesList.appendChild(li);
//   toggleBtn.addEventListener("click", async () => {
//     try {
//       const docRef = doc(db, "classes", id);
//       await updateDoc(docRef, {done: !data.done,});
//     }catch (err) {
//       console.error("Error updating document: ", err);
//       alert("Error updating item, check console.");
//     }
//   });
// }
// function renderClass(id, data) {
//   const li = document.createElement("li");
//   li.className = "class";
//   const left = document.createElement("div");
//   left.className = "class-left";
//   const textP = document.createElement("p");
//   textP.className = "class-text";
//   textP.textContent = data.name || "";
//   left.appendChild(textP);
//   li.appendChild(left);  // Click listener for selecting the class
//   li.addEventListener("click", () => {
//     document.querySelectorAll('.class').forEach(el => el.classList.remove('active'));
//     li.classList.add('active');
    
//     // Update global variable for the "Section within a Section"
//     selectedClassId = id; 
//     loadStudentsForClass(id);
//   });

//   classesList.appendChild(li);
// }

function listenForClasses() {
    const tableBody = document.getElementById('dataTableBody');
    const classesCollection = collection(db, 'classes');

    onSnapshot(classesCollection, (snapshot) => {
        tableBody.innerHTML = ''; // Clear table before re-rendering

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Create the row element
            const row = document.createElement('tr');
            
            // Define the HTML structure for the row
            row.innerHTML = `
                <td class="${data.done ? 'done' : ''}">${data.text || data.name || 'N/A'}</td>
                <td>${data.numStudents || 'N/A'}</td>
                <td>
                    <label class="checkmark-container">
                        <input type="checkbox" ${data.done ? 'checked' : ''}>
                  <span class="checkmark"></span>
                </td>
            `;

            // Add the toggle event listener to the button inside this row
            const checkbox = row.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async () => {
                try {
                    const docRef = doc(db, "classes", id);
                    await updateDoc(docRef, { done: e.target.checked });
                } catch (err) {
                    console.error("Error updating status:", err);
                }
            });

            tableBody.appendChild(row);
        });
    });
}

// Call the listener on page load
listenForClasses();
// Call the function when the page loads
// window.onload = displayData;