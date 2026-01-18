# Julia-HoyaDev-Final
## Overview
A web-based attendance tracking application built with **HTML, CSS, JavaScript**, and **Firebase Firestore**.  
This app allows users to create classes, add students, mark daily attendance, and view past attendance records — all in real time.

---

## Features

### Class Management
- Create new classes
- View all classes in a table
- Track number of students per class
- Mark when attendance has been taken for a class

### Student Management
- Add students to a specific class
- Automatically updates the count of students in each class
- View all students with their associated class
- Students displayed alphabetically by name

### Attendance Tracking
- Select a class and load all the enrolled students
- Use a checkmark box to mark students as Present or not
- Attendance is stored per student **per date**
- Displays the current attendance date

### Past Attendance History
- View attendance records by:
  - Class
  - Date
- Displays student name, class name, and attendance status
- Supports viewing attendance history before filtering

### Menu
- Switch between html files to display only relevant data
- Appears at the top of each page with the same appearance 

---

## Assumptions

### Class Assumptions
- Each class has a unique Firestore docment ID
- Class names are unique 
- A class exists before a student is added to it

### Student Assumptions
- Each student belongs to only one class
- Students 
- Duplicate students can exist but they are treated as two different students

### Attendance Assumptions
- Dates are formatted as YYYY-MM-DD
- If no attendance record exists for a student on a given date, the student is assumed to be absent
- No late or excused absence states

### No Deleting 
- Cannot delete a class or student
- If want to do so, have to manually delete on Firebase
- Teacher needs to take attendance for all the classes and students already existing

---

## Firestore Data Structures

### `classes` Collection
classes {
  name: string,
  numStudents: number,
  done: boolean,
  createdAt: timestamp,
  lastAttendanceDate: timestamp
}

### `students` Collection
students {
  name: string,
  classId: string,       
  className: string,
  createdAt: timestamp,
}

### `attendance` Subcollection
attendance{
  present: boolean  
}