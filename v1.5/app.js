const STORAGE_KEY = "students";

function getStudents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveStudents(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addOrUpdateStudent() {
  const idEl = document.getElementById("editingId");
  const firstNameEl = document.getElementById("firstName");
  const lastNameEl = document.getElementById("lastName");
  const ageEl = document.getElementById("age");
  const phoneEl = document.getElementById("phone");
  const noteEl = document.getElementById("note");
  const regEl = document.getElementById("regDate");
  const expEl = document.getElementById("expDate");
  const photoEl = document.getElementById("photo");

  if (!firstNameEl.value || !lastNameEl.value || !phoneEl.value) {
    alert("First Name, Last Name and phone are required");
    return;
  }

  if (ageEl.value <= 0) {
    alert("Invalid age");
    return;
  }

  if (regEl.value && expEl.value && regEl.value > expEl.value) {
    alert("Expiration must be after registration");
    return;
  }

  const students = getStudents();

  const saveStudent = (photoData = "") => {
    if (idEl.value) {
      // EDIT
      const s = students.find(st => st.id == idEl.value);
      Object.assign(s, {
        firstName: firstNameEl.value,
        lastName: lastNameEl.value,
        age: ageEl.value,
        phone: phoneEl.value,
        note: noteEl.value,
        registrationDate: regEl.value,
        expirationDate: expEl.value,
        photo: photoData || s.photo
      });
    } else {
      // ADD
      students.push({
        id: Date.now(),
        firstName: firstNameEl.value,
        lastName: lastNameEl.value,
        age: ageEl.value,
        phone: phoneEl.value,
        note: noteEl.value,
        registrationDate: regEl.value,
        expirationDate: expEl.value,
        photo: photoData
      });
    }

    saveStudents(students);
    resetForm();
    renderStudents();
    if (parent?.updateBadges) parent.updateBadges();
  };

  if (photoEl.files[0]) {
    const reader = new FileReader();
    reader.onload = () => saveStudent(reader.result);
    reader.readAsDataURL(photoEl.files[0]);
  } else {
    saveStudent();
  }
}

function editStudent(id) {
  const s = getStudents().find(st => st.id === id);

  editingId.value = s.id;
  firstName.value = s.firstName;
  lastName.value = s.lastName;
  age.value = s.age;
  phone.value = s.phone;
  note.value = s.note;
  regDate.value = s.registrationDate;
  expDate.value = s.expirationDate;

  document.querySelector(".students-top h3").innerText = "Edit Student";
}

function resetForm() {
  editingId.value = "";
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
  document.querySelector(".students-top h3").innerText = "Add Student";
}

function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  saveStudents(getStudents().filter(s => s.id !== id));
  renderStudents();
  if (parent?.updateBadges) parent.updateBadges();
}

function renderStudents() {
  const container = document.getElementById("students");
  container.innerHTML = "";

  getStudents().forEach(s => {
    container.innerHTML += `
      <div class="card">
        ${s.photo ? `<img src="${s.photo}" width="80" style="border-radius:50%">` : ""}
        <strong>${s.firstName} ${s.lastName}</strong><br>
        Age: ${s.age}<br>
        Phone: ${s.phone}<br>
        <details><summary>Notes</summary>${s.note}</details>
        <small>${s.registrationDate || ""} → ${s.expirationDate || ""}</small>

        <div class="lesson-actions">
          <button onclick="editStudent(${s.id})">Edit</button>
          <button onclick="deleteStudent(${s.id})">Delete</button>
        </div>
      </div>
    `;
  });
}

renderStudents();
