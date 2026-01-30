const LESSON_KEY = "lessons";
const PAST_KEY = "pastLessons";
let assignFormVisible = false;

function getLessons() {
  return JSON.parse(localStorage.getItem(LESSON_KEY)) || [];
}
function saveLessons(d) {
  localStorage.setItem(LESSON_KEY, JSON.stringify(d));
}
function getPastLessons() {
  return JSON.parse(localStorage.getItem(PAST_KEY)) || [];
}
function savePastLessons(d) {
  localStorage.setItem(PAST_KEY, JSON.stringify(d));
}

function toggleAssignForm() {
  const form = document.getElementById("assignForm");
  const btn = document.querySelector(".toggle-btn");

  assignFormVisible = !assignFormVisible;

  if (assignFormVisible) {
    form.classList.remove("collapsed");
    btn.innerText = "Hide";
  } else {
    form.classList.add("collapsed");
    btn.innerText = "Show";
  }
}

function getStudents() {
  return JSON.parse(localStorage.getItem("students")) || [];
}

function loadStudents() {
  const students = getStudents();
  const select = document.getElementById("student");

  select.innerHTML = `<option value="">Select Student</option>`;
  students.forEach(s => {
    select.innerHTML += `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`;
  });
}

function resetLessonForm() {
  editingLessonId.value = "";
  lessonName.value = "";
  lessonNote.value = "";

  // Reset date to today
  document.getElementById("date").value = new Date().toISOString().split("T")[0];

  const sh = document.getElementById("startHour");
  const sm = document.getElementById("startMinute");
  const eh = document.getElementById("endHour");
  const em = document.getElementById("endMinute");
  
  // DEFAULT TIMES
  sh.value = "10";
  sm.value = "00";
  eh.value = "11";
  em.value = "00";

  // Reset student dropdown
  if (student.options.length > 0) {
    student.selectedIndex = 0;
  }
}

function loadTimeSelectors() {
  const sh = document.getElementById("startHour");
  const sm = document.getElementById("startMinute");
  const eh = document.getElementById("endHour");
  const em = document.getElementById("endMinute");

  for (let h = 0; h < 24; h++) {
    const val = String(h).padStart(2, "0");
    sh.innerHTML += `<option value="${val}">${val}</option>`;
    eh.innerHTML += `<option value="${val}">${val}</option>`;
  }

  ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].forEach(m => {
    sm.innerHTML += `<option value="${m}">${m}</option>`;
    em.innerHTML += `<option value="${m}">${m}</option>`;
  });

  // DEFAULT TIMES
  sh.value = "10";
  sm.value = "00";
  eh.value = "11";
  em.value = "00";

  document.getElementById("date").value = new Date().toISOString().split("T")[0];
}

function addLesson() {
  const id = editingLessonId.value;
  const startTime = `${startHour.value}:${startMinute.value}`;
  const endTime = `${endHour.value}:${endMinute.value}`;

  if (startTime >= endTime) {
    alert("End time must be after start time");
    return;
  }

  const lessons = getLessons();

  if (id) {
    const l = lessons.find(x => x.id == id);
    Object.assign(l, {
      studentId: student.value,
      lessonName: lessonName.value,
      date: date.value,
      startHour: startTime,
      endHour: endTime,
      note: lessonNote.value
    });
  } else {
    lessons.push({
      id: Date.now(),
      studentId: student.value,
      lessonName: lessonName.value,
      date: date.value,
      startHour: startTime,
      endHour: endTime,
      note: lessonNote.value
    });
  }

  saveLessons(lessons);
  resetLessonForm();
  renderCalendar();

  if (parent?.updateBadges) parent.updateBadges();
}

function editLesson(id) {
  const l = getLessons().find(x => x.id === id);

  editingLessonId.value = l.id;
  student.value = l.studentId;
  lessonName.value = l.lessonName;
  date.value = l.date;

  [startHour.value, startMinute.value] = l.startHour.split(":");
  [endHour.value, endMinute.value] = l.endHour.split(":");

  lessonNote.value = l.note || "";
}

function deleteLesson(id) {
  if (!confirm("Delete this lesson?")) return;
  saveLessons(getLessons().filter(l => l.id !== id));
  renderCalendar();

  if (parent?.updateBadges) parent.updateBadges();
}

function completeLesson(id) {
  const note = prompt("Completion note (optional)");

  if (note === null) return;

  const lessons = getLessons();
  const l = lessons.find(x => x.id === id);

  const start = parseInt(l.startHour.split(":")[0]) * 60 + parseInt(l.startHour.split(":")[1]);
  const end = parseInt(l.endHour.split(":")[0]) * 60 + parseInt(l.endHour.split(":")[1]);

  const completed = {
    ...l,
    completedAt: new Date().toISOString(),
    completionNote: note,
    durationMins: end - start
  };

  savePastLessons([completed, ...getPastLessons()]);
  saveLessons(lessons.filter(x => x.id !== id));

  renderCalendar();
  parent?.updateBadges();
}

function renderCalendar() {
  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const lessons = getLessons();
  const students = getStudents();

  const grouped = {};

  lessons.forEach(l => {
    if (!grouped[l.date]) grouped[l.date] = [];
    grouped[l.date].push(l);
  });

  Object.keys(grouped).sort().forEach(date => {
    container.innerHTML += `<h3 style="margin-left:12px;color:#ffffff">${date}</h3>`;

    grouped[date]
      .sort((a, b) => a.startHour.localeCompare(b.startHour))
      .forEach(l => {
        const s = students.find(st => st.id == l.studentId);

        container.innerHTML += `
          <div class="lesson">
            <div class="lesson-header">
              ${l.startHour} – ${l.endHour} | ${l.lessonName}
            </div>

            <div style="display:flex;align-items:center;margin-top:8px">
              ${s?.photo ? `<img src="${s.photo}">` : ""}
              <div>
                <strong>${s?.firstName || ""} ${s?.lastName || ""}</strong><br>
                📞 ${s?.phone || ""}<br>
                📝 <em>${l.note || "No lesson note"}</em><br>
                👤 <small>${s?.note || ""}</small>
              </div>
            </div>

            <div class="lesson-actions">
              <button onclick="editLesson(${l.id})">Edit</button>
              <button onclick="deleteLesson(${l.id})">Delete</button>
              <button onclick="completeLesson(${l.id})">Complete</button>
            </div>
          </div>
        `;
      });
  });
}

loadStudents();
loadTimeSelectors();
renderCalendar();
