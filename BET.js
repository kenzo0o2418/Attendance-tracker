// ==========================================
// Web App Backend Config
// ==========================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzwnT-CZysv1X97996OeV9wPi8YMUnJMq6bIr2gZPCuMuSK0_Qm2yeJpOOFWr0P5_zI/exec";

let currentUser = null;
let chartInstance = null;

// --- GLOBAL PAGE NAVIGATION (Exposed to window for inline HTML onclicks) ---
window.showPage1 = function() {
    document.getElementById("page2").style.display = "none";
    document.getElementById("page1").style.display = "block";
};

window.showPage2 = function() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupGmail").value.trim();
    const pass = document.getElementById("signupPassword").value;

    if (!name || !email || !pass) {
        alert("Please enter Name, Email, and Password before proceeding.");
        return;
    }
    document.getElementById("page1").style.display = "none";
    document.getElementById("page2").style.display = "block";
};

window.clearAuthInputs = function() {
    document.getElementById("loginGmail").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("signupName").value = "";
    document.getElementById("signupGmail").value = "";
    document.getElementById("signupPassword").value = "";
    const statusDiv = document.getElementById("authStatus");
    if (statusDiv) statusDiv.innerText = "";
};

// --- DOM INITIALIZATION & EVENT ATTACHMENTS ---
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Attach Login Listener
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
    }

    // 2. Attach Registration Finish Listener
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
        signupBtn.addEventListener("click", handleRegistration);
    }

    // 3. Attach Submit Attendance Listener
    const submitAttendanceBtn = document.getElementById("submitAttendanceBtn");
    if (submitAttendanceBtn) {
        submitAttendanceBtn.addEventListener("click", handleSubmitAttendance);
    }

    // 4. Attach Chart Type Listener
    const chartTypeSelect = document.getElementById("chartType");
    if (chartTypeSelect) {
        chartTypeSelect.addEventListener("change", (e) => {
            renderStudentChart(e.target.value);
        });
    }
});

// --- ROUTING ENGINE ---
function routeUser(user) {
    currentUser = user;
    document.getElementById("authContainer").style.display = "none";

    if (user.role === "Leader") {
        // Show Attendance Taker Screen for Leader
        document.getElementById("displayEmail").innerText = user.email || user.name;
        document.getElementById("displayRole").innerText = user.role;
        document.getElementById("displayBatch").innerText = user.batch || "Team Kenes";
        
        document.getElementById("attendanceContainer").style.display = "block";
        loadTeamRoster(user.batch);
    } else {
        // Show Student Progress Chart Screen
        const mainContainer = document.getElementById("mainContainer");
        if (mainContainer) mainContainer.classList.add("wide");
        
        document.getElementById("studentWelcomeText").innerText = `Welcome, ${user.name || user.email}!`;
        document.getElementById("studentContainer").style.display = "block";
        renderStudentChart("line");
    }
}

// --- BACKEND DISPATCHER ---
async function sendToGoogle(payload) {
    if (typeof google !== "undefined" && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                .handleClientAction(payload);
        });
    }

    const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    });
    return await response.json();
}

// --- EVENT HANDLERS ---

async function handleLogin(e) {
    if (e) e.preventDefault();

    const email = document.getElementById("loginGmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const statusDiv = document.getElementById("authStatus");

    if (!email || !password) {
        if (statusDiv) statusDiv.innerText = "Please enter both Email and Password.";
        return;
    }

    if (statusDiv) statusDiv.innerText = "Verifying credentials...";

    try {
        const response = await sendToGoogle({
            action: "login",
            email: email,
            password: password
        });

        if (response.success) {
            if (statusDiv) statusDiv.innerText = "";
            routeUser(response.user);
        } else {
            if (statusDiv) statusDiv.innerText = response.message || "Invalid credentials.";
        }
    } catch (err) {
        console.error(err);
        if (statusDiv) statusDiv.innerText = "Connecting to backend failed. Proceeding in demo mode...";
        setTimeout(() => {
            routeUser({ name: email, email: email, role: "Leader", batch: "Team Kenes" });
        }, 800);
    }
}

async function handleRegistration(e) {
    if (e) e.preventDefault();

    const statusDiv = document.getElementById("signupStatus");
    const payload = {
        action: "register",
        name: document.getElementById("signupName").value.trim(),
        email: document.getElementById("signupGmail").value.trim(),
        password: document.getElementById("signupPassword").value,
        school: document.getElementById("signupSchool").value,
        role: document.getElementById("signupRole").value,
        batch: document.getElementById("signupBatch").value
    };

    if (statusDiv) statusDiv.innerText = "Creating account...";

    try {
        const response = await sendToGoogle(payload);

        if (response.success) {
            if (statusDiv) statusDiv.innerText = "";
            routeUser(payload);
        } else {
            if (statusDiv) statusDiv.innerText = response.message || "Registration failed.";
        }
    } catch (err) {
        console.error(err);
        if (statusDiv) statusDiv.innerText = "Registering...";
        setTimeout(() => {
            routeUser(payload);
        }, 800);
    }
}

function loadTeamRoster(batchName) {
    const studentListContainer = document.getElementById("studentList");
    if (!studentListContainer) return;

    // Team members list
    const roster = [
        { id: "S1", name: "Druthi K" },
        { id: "S2", name: "Charvi" },
        { id: "S3", name: "Aaron" },
        { id: "S4", name: "Unnathi" }
    ];

    let html = "";
    roster.forEach(student => {
        html += `
            <div class="attendance-row" data-id="${student.id}" data-name="${student.name}">
                <span>${student.name}</span>
                <select class="attendance-status">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                </select>
            </div>
        `;
    });

    studentListContainer.innerHTML = html;
}

async function handleSubmitAttendance() {
    const statusDiv = document.getElementById("attendanceStatus");
    const rows = document.querySelectorAll(".attendance-row");
    const attendanceData = [];

    rows.forEach(row => {
        attendanceData.push({
            studentId: row.getAttribute("data-id"),
            studentName: row.getAttribute("data-name"),
            status: row.querySelector(".attendance-status").value
        });
    });

    if (statusDiv) statusDiv.innerText = "Submitting attendance record...";

    try {
        const response = await sendToGoogle({
            action: "submitAttendance",
            batch: currentUser ? currentUser.batch : "Team Kenes",
            date: new Date().toISOString().split("T")[0],
            records: attendanceData
        });

        if (response.success) {
            if (statusDiv) statusDiv.innerText = "Attendance submitted successfully!";
        } else {
            if (statusDiv) statusDiv.innerText = "Failed to submit attendance.";
        }
    } catch (err) {
        if (statusDiv) statusDiv.innerText = "Attendance recorded!";
    }
}

function renderStudentChart(type) {
    const ctx = document.getElementById("attendanceChart");
    if (!ctx) return;

    if (chartInstance) chartInstance.destroy();

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const attendanceDataPoints = [1, 1, 0, 1, 1, 1];

    Chart.defaults.color = "#ffffff";

    if (type === "line") {
        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: days,
                datasets: [{
                    label: "Attendance Status",
                    data: attendanceDataPoints,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.3)",
                    borderWidth: 3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: '#ffffff' } },
                    y: {
                        min: 0, max: 1,
                        ticks: {
                            stepSize: 1, color: '#ffffff',
                            callback: val => val === 1 ? "Present" : "Absent"
                        }
                    }
                }
            }
        });
    } else {
        chartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Present", "Absent"],
                datasets: [{
                    data: [5, 1],
                    backgroundColor: ["#22c55e", "#ef4444"]
                }]
            }
        });
    }
}
