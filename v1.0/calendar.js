const LESSON_KEY = "lessons";

function getLessons() {
  return JSON.parse(localStorage.getItem(LESSON_KEY)) || [];
}

function saveLessons(data) {
  localStorage.setItem(LESSON_KEY, JSON.stringify(data));
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
}

function addLesson() {
  const student = document.getElementById("student");
  const lessonName = document.getElementById("lessonName");
  const lessonNote = document.getElementById("lessonNote");
  const date = document.getElementById("date");

  const startTime = `${startHour.value}:${startMinute.value}`;
  const endTime = `${endHour.value}:${endMinute.value}`;

  if (!student.value || !lessonName.value || !date.value) {
    alert("All fields required");
    return;
  }

  if (startTime >= endTime) {
    alert("End time must be after start time");
    return;
  }

  const lesson = {
    id: Date.now(),
    studentId: student.value,
    lessonName: lessonName.value,
    date: date.value,
    startHour: startTime,
    endHour: endTime,
    note: lessonNote.value
  };

  const lessons = getLessons();
  lessons.push(lesson);
  saveLessons(lessons);
  renderCalendar();

  if (parent?.updateBadges) parent.updateBadges();
}

function removeLesson(id) {
  if (!confirm("Delete this lesson?")) return;
  saveLessons(getLessons().filter(l => l.id !== id));
  renderCalendar();

  if (parent?.updateBadges) parent.updateBadges();
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
    container.innerHTML += `<h3 style="margin-left:12px">${date}</h3>`;

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

            <button style="margin-top:10px" onclick="removeLesson(${l.id})">
              Remove
            </button>
          </div>
        `;
      });
  });
}

loadStudents();
loadTimeSelectors();
renderCalendar();
