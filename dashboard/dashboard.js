// Load organisation data
window.onload = function () {
  let orgData = JSON.parse(localStorage.getItem("orgData"));

  if (!orgData) {
    alert("No organisation data found! Please register first.");
    window.location.href = "../index.html";
    return;
  }

  // Header Org Name
  document.getElementById("orgNameDisplay").textContent = orgData.orgName;

  // Organisation Details
  document.getElementById("orgName").textContent = orgData.orgName;
  document.getElementById("adminName").textContent = orgData.adminName;
  document.getElementById("address").textContent =
    `${orgData.address.city}, ${orgData.address.district}, ${orgData.address.state}, ${orgData.address.nation}`;
  document.getElementById("mobile").textContent = orgData.mobile;
  document.getElementById("email").textContent = orgData.email;
  document.getElementById("subscription").textContent = orgData.subscription;

  // Shifts
  let shiftList = document.getElementById("shiftsList");
  orgData.shifts.forEach((s, i) => {
    let li = document.createElement("li");
    li.textContent = `Shift ${i + 1}: ${s.start} to ${s.end}`;
    shiftList.appendChild(li);
  });
};

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "../index.html"; 
});

// Clock
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("clock").textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// Navigation
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}
