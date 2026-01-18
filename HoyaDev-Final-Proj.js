import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  doc,
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
const addNewClass = document.getElementById("add-class");
const newClassInput = document.getElementById("new-classes-input");
const classSelect = document.getElementById("class-select");

const addNewStudent = document.getElementById("add-student");
const newStudentInput = document.getElementById("new-student-input");
const studentForm = document.getElementById('studentForm');

const classTableBody = document.getElementById("dataTableBody");
const studentTableBody = document.getElementById("studentTableBody");
const studentAttendanceBody = document.getElementById("classStudentsTableBody");
const attendanceClassSelect = document.getElementById("attendanceClassSelect"); // separate dropdown for attendance
const loadStudentsBtn = document.getElementById("load-students-btn");
const tookAttendanceBtn = document.getElementById("took-attendance-btn");

const pastClassSelect = document.getElementById("pastClassSelect");
const pastDateSelect = document.getElementById("pastDateSelect");
const loadPastBtn = document.getElementById("loadPastBtn");
const pastAttendanceBody = document.getElementById("pastAttendanceBody");

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
if (attendanceClassSelect) {
  onSnapshot(classesColRef, (snapshot) => {
    attendanceClassSelect.innerHTML = `<option value="">Select a class</option>`;
    snapshot.forEach((docSnap) => {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = docSnap.data().name;
      attendanceClassSelect.appendChild(option);
    });
  });
}
if (attendanceClassSelect && studentAttendanceBody && loadStudentsBtn) {
  loadStudentsBtn.addEventListener("click", async () => {
    const classId = attendanceClassSelect.value;
    if (!classId) {
      studentAttendanceBody.innerHTML = "";
      return;
    }
    const today = new Date().toISOString().split("T")[0]; // "2026-01-18"
    const q = query(studentsColRef, where("classId", "==", classId));
    const studentSnap = await getDocs(q);
    studentAttendanceBody.innerHTML = "";
    studentSnap.forEach(async (docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const attendanceDocRef = doc(db, "students", id, "attendance", today);
        const attendanceSnap = await getDoc(attendanceDocRef);
        const present = attendanceSnap.exists() ? attendanceSnap.data().present : false;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.name}</td>
          <td>${data.className}</td>
          <td>
            <input type="checkbox" ${present ? "checked" : ""} />
          </td>
        `;
        const checkbox = row.querySelector("input[type='checkbox']");
        checkbox.addEventListener("change", async () => {
          try {
            await setDoc(attendanceDocRef, { 
              present: checkbox.checked, 
              // merge: true
            });
          } catch (err) {
            console.error("Error marking attendance:", err);
          }
        });
        studentAttendanceBody.appendChild(row);
      });
    });
}
if (tookAttendanceBtn && attendanceClassSelect) {
  tookAttendanceBtn.addEventListener("click", async () => {
    const classId = attendanceClassSelect.value;
    if (!classId) {
      alert("Please select a class first");
      return;
    }
    try {
      const classDocRef = doc(db, "classes", classId);
      await updateDoc(classDocRef, {
        done: true,
        lastAttendanceDate: new Date()
      });
      alert("Attendance recorded!");
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  });
}

  // ===============================
  // PAGE 4: PAST HISTORY
  // ===============================
if (pastClassSelect) {
  getDocs(classesColRef).then(snapshot =>{
    snapshot.forEach((docSnap) => {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = docSnap.data().name;
      pastClassSelect.appendChild(option);
    });
  });
}
if(pastAttendanceBody){
onSnapshot(studentsColRef, snapshot => {
  studentAttendanceBody.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = data.name;
    row.appendChild(nameCell);

    const today = new Date().toISOString().split('T')[0];
    const pastDates = Object.keys(data.attendance || {}).sort();

    pastDates.forEach(date => {
      const cell = document.createElement('td');
      cell.textContent = data.attendance[date] ? 'Present' : 'Absent';
      row.appendChild(cell);
    });

    studentAttendanceBody.appendChild(row);
  });
});
}
if(loadPastBtn){
loadPastBtn.addEventListener("click", async () => {
  const classId = pastClassSelect.value;
  const selectedDate = pastDateSelect.value; // format: "YYYY-MM-DD"
  if (!classId || !selectedDate) {
    alert("Please select a class and a date");
    return;
  }
  pastAttendanceBody.innerHTML = "";

  // Get all students in that class
  const studentsColRef = collection(db, "students");
  const q = query(studentsColRef, where("classId", "==", classId));
  const studentSnap = await getDocs(q);

  // For each student, get attendance for the selected date
  for (const studentDoc of studentSnap.docs) {
    const studentData = studentDoc.data();
    const studentId = studentDoc.id;

    const attendanceDocRef = doc(db, "students", studentId, "attendance", selectedDate);
    const attendanceSnap = await getDoc(attendanceDocRef);
    const present = attendanceSnap.exists() ? attendanceSnap.data().present : false;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${studentData.name}</td>
      <td>${studentData.className}</td>
      <td>${present ? "Yes" : "No"}</td>
    `;
    pastAttendanceBody.appendChild(row);
  }
});
}
});