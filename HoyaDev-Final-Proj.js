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
  increment,
  where,
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


document.addEventListener('DOMContentLoaded', () => {
const addNewStudent = document.getElementById("add-student");
const newStudentInput = document.getElementById("new-student-input");
// const studentList = document.getElementById("student-list");
const studentForm = document.getElementById('studentForm');

const addNewClass = document.getElementById("add-class");
const newClassInput = document.getElementById("new-classes-input");
// const classesList = document.getElementById("classes-list");
const classSelect = document.getElementById("class-select");

const classTableBody = document.getElementById("dataTableBody");
const studentTableBody = document.getElementById("studentTableBody");
const studentAttendanceBody = document.getElementById("classStudentsTableBody");

const attendanceClassSelect = document.getElementById("attendanceClassSelect"); // separate dropdown for attendance
const loadStudentsBtn = document.getElementById("load-students-btn");
// Reference to collections
const classesColRef = collection(db, "classes");
const studentsColRef = collection(db, "students");


  // ===============================
  // PAGE 1: CLASSES TABLE PAGE
  // ===============================
if (addNewClass && newClassInput && classTableBody) {
  addNewClass.addEventListener("submit", async (e) => {
    e.preventDefault();
    const className = newClassInput.value.trim();
    if (!className) return;
    try {
      await addDoc(classesColRef, {
        name: className,
        done: false,
        numStudents: 0,
        createdAt: new Date()
      });
      newClassInput.value = "";
    } catch (err) {
      console.error("Error adding class: ", err);
    }
  });
  onSnapshot(classesColRef, (snapshot) => {
    classTableBody.innerHTML = ''; 
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="${data.done ? 'done' : ''}">${data.text || data.name || 'N/A'}</td>
        <td>${data.numStudents ?? 0}</td>
        <td>
          <label class="checkmark-container">
            <input type="checkbox" ${data.done ? 'checked' : ''}>
            <span class="checkmark"></span>
        </td>
      `;
      const checkbox = row.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', async (e) => {
        try {
          const docRef = doc(db, "classes", id);
          await updateDoc(docRef, { done: e.target.checked });
        } catch (err) {
          console.error("Error updating status:", err);
        }
      });
      classTableBody.appendChild(row);
      });
    });
}

  // ===============================
  // PAGE 2: ADD STUDENT PAGE
  // ===============================
if (classSelect) {
  onSnapshot(collection(db, "classes"), (snapshot) => {
    classSelect.innerHTML = `<option value="">Select a class</option>`;
    snapshot.forEach((docSnap) => {
      const classData = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = classData.name;
      classSelect.appendChild(option);
    });
  });
}
if (studentForm && newStudentInput && classSelect) {
  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentName = newStudentInput.value.trim();
    const selectedClassId = classSelect.value;
    if (!studentName || !selectedClassId) return;
    try {
      const className = classSelect.options[classSelect.selectedIndex].text;
      await addDoc(studentsColRef, {
        name: studentName,
        classId: selectedClassId,
        className: className,
        present: false,
        createdAt: new Date()
      });
      const classDocRef = doc(db, "classes", selectedClassId);
      await updateDoc(classDocRef, {
        numStudents: increment(1)
      });

        newStudentInput.value = "";
        classSelect.value = "";
    } catch (err) {
      console.error("Error adding student:", err);
    }
  });
}
if (studentTableBody) {
  onSnapshot(studentsColRef, (snapshot) => {
    studentTableBody.innerHTML = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.name || 'N/A'}</td>
        <td>${data.className || 'N/A'}</td>
      `;
      studentTableBody.appendChild(row);
    });
  });
}
async function countStudentsInClass(classId) {
  const q = query(studentsColRef, where("classId", "==", classId));
  const snapshot = await getDocs(q);
  return snapshot.size; // number of students
}

  // ===============================
  // PAGE 3: ATTENDANCE PAGE
  // ===============================
let unsubscribeStudents = null;
if (attendanceClassSelect && studentAttendanceBody && loadStudentsBtn) {
  onSnapshot(classesColRef, (snapshot) => {
    attendanceClassSelect.innerHTML = `<option value="">Select a class</option>`;
    snapshot.forEach((docSnap) => {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = docSnap.data().name;
      attendanceClassSelect.appendChild(option);
    });
  });

  // Load students when the button is clicked
  loadStudentsBtn.addEventListener("click", () => {
    const classId = attendanceClassSelect.value;

    if (unsubscribeStudents) {
      unsubscribeStudents(); // detach previous listener
      unsubscribeStudents = null;
    }

    if (!classId) {
      studentAttendanceBody.innerHTML = "";
      return;
    }

    const q = query(studentsColRef, where("classId", "==", classId));

    unsubscribeStudents = onSnapshot(q, (snapshot) => {
      studentAttendanceBody.innerHTML = "";

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.name}</td>
          <td>${data.className}</td>
          <td>
            <input type="checkbox" ${data.present ? "checked" : ""} />
          </td>
        `;

        // Update attendance when checkbox is clicked
        const checkbox = row.querySelector("input[type='checkbox']");
        checkbox.addEventListener("change", async () => {
          try {
            await updateDoc(doc(db, "students", id), { present: checkbox.checked });
          } catch (err) {
            console.error("Error updating attendance:", err);
          }
        });

        studentAttendanceBody.appendChild(row);
      });
    });
  });
}
});