console.log("app.js loaded");
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


document.addEventListener('DOMContentLoaded', () => {
const addNewStudent = document.getElementById("add-student");
const newStudentInput = document.getElementById("new-student-input");
const studentList = document.getElementById("student-list");

const addNewClass = document.getElementById("add-class");
const newClassInput = document.getElementById("new-classes-input");
const classesList = document.getElementById("classes-list");
const classSelect = document.getElementById("class-select");
const studentForm = document.getElementById('studentForm');
const tableBody = document.getElementById("dataTableBody");
const studentTableBody = document.getElementById("studentTableBody");



// Reference to our collections
const classesColRef = collection(db, "classes");
const studentsColRef = collection(db, "student");


  // ===============================
  // PAGE 1: CLASSES TABLE PAGE
  // ===============================
  if (addNewClass && newClassInput && tableBody) {
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
// function listenForClasses() {
//   const tableBody = document.getElementById('dataTableBody');
//    if (!tableBody) return;
    onSnapshot(classesColRef, (snapshot) => {
    tableBody.innerHTML = ''; 

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
            checkbox.addEventListener('change', async (e) => {
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
  // ===============================
  // PAGE 2: ADD STUDENT PAGE
  // ===============================
    if (classSelect) {
    onSnapshot(collection(db, "classes"), (snapshot) => {
    // classesList.innerHTML = "";
    classSelect.innerHTML = `<option value="">Select a class</option>`;

    snapshot.forEach((docSnap) => {
      const classData = docSnap.data();

      // dropdown
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

      if (!studentName || !selectedClassId) {
        alert("Please enter a student name and select a class.");
        return;
      }

      try {
        // Get the class name from the dropdown
        const className = classSelect.options[classSelect.selectedIndex].text;

        // Add student to Firestore
        await addDoc(studentsColRef, {
          name: studentName,
          classId: selectedClassId,
          className: className,
          absent: false,
          createdAt: new Date()
        });

        // Increment numStudents in the class
        const classDocRef = doc(db, "classes", selectedClassId);
        await updateDoc(classDocRef, {
          numStudents: increment(1)
        });

        newStudentInput.value = "";
        classSelect.value = "";
        console.log(`Student "${studentName}" added to class "${className}"`);
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
            let addedAt = 'N/A'; // default

      if (data.createdAt) {
    if (data.createdAt.seconds) {
      // Firestore Timestamp
      addedAt = new Date(data.createdAt.seconds * 1000).toLocaleString();
    } else {
      // JS Date object
      addedAt = new Date(data.createdAt).toLocaleString();
    }
  }
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.name || 'N/A'}</td>
        <td>${data.className || 'N/A'}</td>
        <td>${addedAt}</td>
      `;

      studentTableBody.appendChild(row);
    });
  });
}
});
// --------- STUDENT CREATION ---------
// addNewStudent.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const studentName = newStudentInput.value.trim();
//   const activeClassId = classSelect.value;
//     if (!studentName || !activeClassId){
//       alert("Please enter a name and select a class.");
//       return;
//     }
//   const className =
//     classSelect.options[classSelect.selectedIndex].text;

//   const student = {
//     name: studentName,
//     classId,
//     className,
//     createdAt: new Date()
//   };

//   await addDoc(collection(db, "students"), student);

//   newStudentInput.value = "";  
// });


// const qClasses = query(classesColRef, orderBy("createdAt", "asc"));
// onSnapshot(qClasses, (snapshot) => {
//   // Clear the list
//   classesList.innerHTML = "";
//   snapshot.forEach((docSnap) => {
//     const data = docSnap.data();
//     const id = docSnap.id;
//     renderClass(id, data);
//   });
// });


// Call the listener on page load


// 1. POPULATE DROPDOWN IN REAL-TIME
// onSnapshot(collection(db, "classes"), (snapshot) => {
//     // classesList.innerHTML = "";
//     classSelect.innerHTML = `<option value="">Select a class</option>`;

//     snapshot.forEach((doc) => {
//       const classData = doc.data();

//       const option = document.createElement("option");
//       option.value = doc.id;
//       option.textContent = classData.name;
//       classSelect.appendChild(option);

//       const li = document.createElement("li");
//       li.className = "class";
//       li.textContent = classData.name;
//       if (classesList) {
//         classesList.appendChild(li);
//       } else {
//         console.warn("Element with ID 'classes-list' not found. Cannot populate the UI list.");
//       }
//     });
//   });

// studentForm.addEventListener('submit', (e) => {
//     e.preventDefault();
    
//     const studentName = document.getElementById('new-student-input').value;
//     const selectedClassId = classSelect.value; // This gets the doc.id from the dropdown

//     console.log(`Adding ${studentName} to class ID: ${selectedClassId}`);
    
//     // Here you would add the student to your 'students' collection in Firestore
// });

// listenForClasses();
// onSnapshot(classesColRef, (snapshot) => {
//     // Clear the dropdown and add the placeholder
//     classSelect.innerHTML = '<option value="" disabled selected>Select a class...</option>';
    
//     snapshot.forEach((docSnap) => {
//         const data = docSnap.data();
//         const id = docSnap.id;
        
//         const option = document.createElement('option');
//         option.value = id; 
//         option.textContent = data.name || "Unnamed Class"; 
//         classSelect.appendChild(option); // Use the variable name we defined above
//     });
// });



// This ensures that as soon as you add a class, it appears in the dropdown.


// 2. UPDATED STUDENT ADDITION
// addNewStudent.addEventListener("submit", async (e) => {
//   e.preventDefault();
  
//   const studentName = newStudentInput.value.trim();
//   const selectedClassId = classDropdown.value; // Get ID from the dropdown

  // if (!studentName || !selectedClassId) {
  //   alert("Please select a class and enter a name.");
  //   return;
  // }

  // try {
    // Add to the subcollection of the selected class
//     const studentSubColRef = collection(db, "classes", selectedClassId, "students");
    
//     await addDoc(studentSubColRef, {
//       name: studentName,
//       absent: false,
//       createdAt: serverTimestamp(),
//     });

//     newStudentInput.value = "";
//     console.log(`Student added to class: ${selectedClassId}`);
//   } catch (err) {
//     console.error("Error adding student: ", err);
//   }
// });
// ADD 'e' HERE inside the parentheses
// checkbox.addEventListener('change', async (e) => { 
//     try {
//         const docRef = doc(db, "classes", id);
        // Now e.target.checked will work correctly
//         await updateDoc(docRef, { done: e.target.checked });
//     } catch (err) {
//         console.error("Error updating status:", err);
//     }
// });

// async function addStudentToClass(classId, studentName) {
//   try {
//     // Reference the specific subcollection for THIS class
//     // Path: classes/{classId}/students
//     const studentSubColRef = collection(db, "classes", classId, "students");

//     // Add a new student document
//     const docRef = await addDoc(studentSubColRef, {
//       name: studentName,
//       absent: false,
//       createdAt: serverTimestamp()
//     });

//     console.log("Student added with ID:", docRef.id);
//   } catch (err) {
//     console.error("Error adding student to class:", err);
//   }
// }

// let selectedClassId = null;

// // Updated form listener for adding students
// addNewStudent.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const name = newStudentInput.value.trim();

//   if (!name) return;
//   if (!selectedClassId) {
//     alert("Please select a class from the list first!");
//     return;
//   }

//   // Call the function with the active class ID
//   await addStudentToClass(selectedClassId, name);
//   newStudentInput.value = "";
// });

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
// const qClasses = query(classesColRef, orderBy("createdAt", "asc"));
// onSnapshot(qClasses, (snapshot) => {
//   // Clear the list
//   classesList.innerHTML = "";
//   snapshot.forEach((docSnap) => {
//     const data = docSnap.data();
//     const id = docSnap.id;
//     renderClass(id, data);
//   });
// });


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