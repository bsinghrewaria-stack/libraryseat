// ================== Load organisation data ==================
window.onload = function () {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUserId = localStorage.getItem("currentUser");

  if (!currentUserId) {
    alert("Please login first!");
    window.location.href = "./index.html";
    return;
  }

  let orgData = users.find(u => u.userId === currentUserId);

  if (!orgData) {
    alert("Organisation not found!");
    window.location.href = "index.html";
    return;
  }

  // Current Org ID (unique identifier - userId based)
  window.currentOrgId = orgData.userId;

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
  shiftList.innerHTML = "";
  (orgData.shifts || []).forEach((s, i) => {
    let li = document.createElement("li");
    li.textContent = `Shift ${i + 1}: ${s.start} to ${s.end}`;
    shiftList.appendChild(li);
  });

  // Seats load karo
  renderSeats();
};

// ================== Logout ==================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "./index.html";
});

// ================== Clock ==================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("clock").textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

let currentSeat = null;
let profileDataURL = null; // Captured profile picture
let editingSeatNo = null; // for editing modal
let editMode = false; // member modal state

// ================== Helper: Get Seats Key ==================
function getSeatsKey() {
  return `seatsData_${window.currentOrgId}`;
}

// ================== Seats Rendering ==================
function renderSeats() {
  const seatContainer = document.getElementById("seatContainer");
  if (!seatContainer) return;
  seatContainer.innerHTML = "";

  let totalSeats = parseInt(localStorage.getItem("totalSeats")) || 50; // default 50
  let seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};

  for (let i = 1; i <= totalSeats; i++) {
    let seatDiv = document.createElement("div");
    seatDiv.classList.add("seat");

    if (seatsData[i]) {
      seatDiv.classList.add("filled");
      seatDiv.innerHTML = `<strong>${i}</strong><br>${seatsData[i].name}<br>${seatsData[i].shift}`;
      seatDiv.onclick = () => openMemberModal(i);
    } else {
      seatDiv.classList.add("vacant");
      seatDiv.innerHTML = `<strong>${i}</strong><br><em>Vacant</em>`;
      seatDiv.onclick = () => openAddMemberForm(i);
    }

    seatContainer.appendChild(seatDiv);
  }

  // ================== Add "Add Seats" button ==================
  let addBtn = document.createElement("button");
  addBtn.textContent = "+ Add More Seats";
  addBtn.classList.add("add-seat-btn");
  addBtn.onclick = addSeats;
  seatContainer.appendChild(addBtn);

  // ================== Add "Remove Seats" button ==================
  let removeBtn = document.createElement("button");
  removeBtn.textContent = "− Remove Seats";
  removeBtn.classList.add("remove-seat-btn");
  removeBtn.onclick = removeSeats;
  seatContainer.appendChild(removeBtn);
}

// ================== Add Seats ==================
function addSeats() {
  let extra = prompt("How many seats do you want to add?");
  if (!extra) return;
  extra = parseInt(extra);
  if (isNaN(extra) || extra <= 0) {
    alert("Please enter a valid number!");
    return;
  }

  let totalSeats = parseInt(localStorage.getItem("totalSeats")) || 50;
  totalSeats += extra;
  localStorage.setItem("totalSeats", totalSeats);
  renderSeats();
  alert(extra + " seats added successfully!");
}

// ================== Remove Seats ==================
function removeSeats() {
  let removeCount = prompt("How many seats do you want to remove?");
  if (!removeCount) return;
  removeCount = parseInt(removeCount);

  if (isNaN(removeCount) || removeCount <= 0) {
    alert("Please enter a valid number!");
    return;
  }

  let totalSeats = parseInt(localStorage.getItem("totalSeats")) || 50;

  if (totalSeats - removeCount < 50) {
    alert("You must keep at least 50 seats!");
    return;
  }

  totalSeats -= removeCount;
  localStorage.setItem("totalSeats", totalSeats);
  renderSeats();
  alert(removeCount + " seats removed successfully!");
}


// ================== Open Add Member Form (Modal + Blur) ==================
function openAddMemberForm(seatNo) {
  currentSeat = seatNo;
  profileDataURL = null;

  document.getElementById("memberForm").reset();

  const video = document.getElementById("profileCamera");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream)
      .catch(err => console.log("Camera error:", err));
  }

  document.getElementById("addMemberModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
}

// ================== Capture Profile ==================
function captureProfile() {
  const video = document.getElementById("profileCamera");
  const canvas = document.getElementById("profileCanvas");
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  profileDataURL = canvas.toDataURL("image/png");
  canvas.classList.remove("hidden");
  alert("Profile photo captured!");
}

// ================== Save Member ==================
function saveMember() {
  const name = document.getElementById("memberName").value.trim();
  const mobile = document.getElementById("memberMobile").value.trim();
  const aadhaar = document.getElementById("memberAadhaar").value.trim();
  const address = document.getElementById("memberAddress").value.trim();
  const shift = document.getElementById("memberShift").value;
  const joining = document.getElementById("joiningDate").value;
  const exit = document.getElementById("exitDate").value;
  const feeAmount = document.getElementById("feeAmount").value.trim();
  const feeMethod = document.getElementById("feeMethod").value;

  if (!feeAmount) {
    alert("Please enter Total Fee (₹)");
    return;
  }

  const aadhaarPhotoFile = document.getElementById("aadhaarPhoto").files[0];
  let seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};

  function saveData(aadhaarPhotoData) {
    seatsData[currentSeat] = {
      name, mobile, aadhaar, address, shift,
      joining, exit,
      feeAmount: Number(feeAmount),
      feeMethod,
      feePaid: true,
      aadhaarPhoto: aadhaarPhotoData,
      profilePhoto: profileDataURL
    };
    localStorage.setItem(getSeatsKey(), JSON.stringify(seatsData));

    closeAddMemberModal();
    renderSeats();
  }

  if (aadhaarPhotoFile) {
    let reader = new FileReader();
    reader.onload = function () {
      saveData(reader.result);
    };
    reader.readAsDataURL(aadhaarPhotoFile);
  } else {
    saveData(null);
  }
}

// ================== Cancel / Close Add Member Modal ==================
function closeAddMemberModal() {
  document.getElementById("addMemberModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
  profileDataURL = null;

  const video = document.getElementById("profileCamera");
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// ================== Member Modal (View-first, then Edit) ==================
function openMemberModal(seatNo) {
  const seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};
  const member = seatsData[seatNo];
  if (!member) return;

  editingSeatNo = seatNo;
  editMode = false;

  populateMemberView(member, seatNo);
  fillEditForm(member);

  document.getElementById("memberDetailsView").classList.remove("hidden");
  document.getElementById("editMemberForm").classList.add("hidden");

  document.getElementById("memberDetailsModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function populateMemberView(member, seatNo) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString() : "N/A";
  document.getElementById("viewSeatNo").textContent = seatNo;
  document.getElementById("viewName").textContent = member.name || "N/A";
  document.getElementById("viewMobile").textContent = member.mobile || "N/A";
  document.getElementById("viewAadhaar").textContent = member.aadhaar || "N/A";
  document.getElementById("viewAddress").textContent = member.address || "N/A";
  document.getElementById("viewShift").textContent = member.shift || "N/A";
  document.getElementById("viewJoining").textContent = fmt(member.joining);
  document.getElementById("viewExit").textContent = fmt(member.exit);
  document.getElementById("viewFee").textContent = member.feeAmount ?? "N/A";
  document.getElementById("viewMethod").textContent = member.feeMethod || "N/A";
  document.getElementById("viewStatus").textContent = member.feePaid ? "Paid" : "Pending";

  const profileImg = document.getElementById("viewProfileImg");
  profileImg.src = member.profilePhoto || "";
  profileImg.style.display = member.profilePhoto ? "block" : "none";

  const aadhaarImg = document.getElementById("viewAadhaarImg");
  aadhaarImg.src = member.aadhaarPhoto || "";
  aadhaarImg.style.display = member.aadhaarPhoto ? "block" : "none";
}

function fillEditForm(member) {
  document.getElementById("editMemberName").value = member.name || "";
  document.getElementById("editMemberMobile").value = member.mobile || "";
  document.getElementById("editMemberAadhaar").value = member.aadhaar || "";
  document.getElementById("editMemberAddress").value = member.address || "";
  document.getElementById("editMemberShift").value = member.shift || "Full Day";
  document.getElementById("editJoiningDate").value = member.joining || "";
  document.getElementById("editExitDate").value = member.exit || "";
  document.getElementById("editFeeAmount").value = member.feeAmount || 0;
  document.getElementById("editFeeMethod").value = member.feeMethod || "Cash";
}

// Switch to edit mode
function enableEditMode() {
  if (!editingSeatNo) return;
  editMode = true;
  document.getElementById("memberDetailsView").classList.add("hidden");
  document.getElementById("editMemberForm").classList.remove("hidden");
}

// Cancel editing → back to view
function cancelEdit() {
  editMode = false;
  const seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};
  const member = seatsData[editingSeatNo];
  populateMemberView(member, editingSeatNo);
  document.getElementById("editMemberForm").classList.add("hidden");
  document.getElementById("memberDetailsView").classList.remove("hidden");
}

function closeMemberModal() {
  document.getElementById("memberDetailsModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
  editingSeatNo = null;
  editMode = false;
}

// Update and remain in modal (show view again)
function updateMember() {
  if (!editingSeatNo) return;
  const seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};
  const member = seatsData[editingSeatNo];
  if (!member) return;

  member.name = document.getElementById("editMemberName").value.trim();
  member.mobile = document.getElementById("editMemberMobile").value.trim();
  member.aadhaar = document.getElementById("editMemberAadhaar").value.trim();
  member.address = document.getElementById("editMemberAddress").value.trim();
  member.shift = document.getElementById("editMemberShift").value;
  member.joining = document.getElementById("editJoiningDate").value;
  member.exit = document.getElementById("editExitDate").value;
  member.feeAmount = Number(document.getElementById("editFeeAmount").value);
  member.feeMethod = document.getElementById("editFeeMethod").value;

  seatsData[editingSeatNo] = member;
  localStorage.setItem(getSeatsKey(), JSON.stringify(seatsData));

  renderSeats();
  if (document.getElementById("feeDetails") && !document.getElementById("feeDetails").classList.contains("hidden")) {
    showFeeClassification(currentFeeClassification);
  }

  populateMemberView(member, editingSeatNo);
  document.getElementById("editMemberForm").classList.add("hidden");
  document.getElementById("memberDetailsView").classList.remove("hidden");
  editMode = false;
}
function deleteMember() {
  if (!editingSeatNo) return;

  if (!confirm("Are you sure you want to delete this member?")) return;

  let seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};

  delete seatsData[editingSeatNo]; // member remove
  localStorage.setItem(getSeatsKey(), JSON.stringify(seatsData));

  renderSeats();
  closeMemberModal();

  alert("Member deleted successfully! Seat is now vacant.");
}
function changeSeat() {
  if (!editingSeatNo) return;

  let newSeat = prompt("Enter new seat number:");
  if (!newSeat) return;

  newSeat = parseInt(newSeat);
  let seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};

  if (seatsData[newSeat]) {
    alert("This seat is already occupied!");
    return;
  }

  // Move data
  seatsData[newSeat] = seatsData[editingSeatNo];
  delete seatsData[editingSeatNo];

  localStorage.setItem(getSeatsKey(), JSON.stringify(seatsData));

  renderSeats();
  closeMemberModal();

  alert(`Seat changed from ${editingSeatNo} to ${newSeat}`);
}

// ================== Section Switching & Fee Details ==================
let currentFeeClassification = 'status';

function showSection(id) {
  const sections = document.querySelectorAll("main .section");
  sections.forEach(sec => sec.classList.add("hidden"));
  const sec = document.getElementById(id);
  if (sec) sec.classList.remove("hidden");

  if (id === "feeDetails") {
    showFeeClassification(currentFeeClassification);
  }
}

// ================== Fee Details Logic with Auto Fee Reset ==================
function showFeeClassification(type) {
  currentFeeClassification = type;
  const container = document.getElementById('feeDisplayContainer');
  if (!container) return;
  container.innerHTML = '';
  const seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};
  const today = new Date();

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function addMonths(date, months) {
    let d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  Object.entries(seatsData).forEach(([seatNo, member]) => {
    let show = false;
    let highlight = false;

    if (!member.joining) return;
    const joinDate = new Date(member.joining);
    let nextFeeDate = addMonths(joinDate, 1);

    if (member.feePaid && today >= nextFeeDate) {
      member.feePaid = false; 
      seatsData[seatNo] = member;
      localStorage.setItem(getSeatsKey(), JSON.stringify(seatsData));
    }

    if (type === 'status') show = true;
    if (type === 'tomorrow') {
      const diff = Math.ceil((nextFeeDate - today) / (1000 * 60 * 60 * 24));
      if (diff === 1) { show = true; highlight = true; }
    }
    if (type === '5days') {
      const diff = Math.ceil((nextFeeDate - today) / (1000 * 60 * 60 * 24));
      if (diff > 0 && diff <= 5) show = true;
    }
    if (type === 'remainder' && !member.feePaid) show = true;

    if (show) {
      const div = document.createElement('div');
      div.classList.add('fee-seat-card');
      if (highlight) div.classList.add('highlight');
      div.classList.add(member.feePaid ? 'paid' : 'pending');

      div.innerHTML = `<strong>Seat ${seatNo}</strong><br>
        ${member.name}<br>
        Fee: ₹${member.feeAmount || "N/A"} (${member.feeMethod || "N/A"})<br>
        Status: ${member.feePaid ? 'Paid' : 'Pending'}<br>
        Joining: ${formatDate(member.joining)}<br>
        Next Fee Due: ${formatDate(nextFeeDate)}`;

      if (type === 'remainder' || highlight) {
        const btn = document.createElement('button');
        btn.textContent = 'Send Reminder';
        btn.classList.add('reminder-btn');
        btn.onclick = () => sendReminder('individual', seatNo);
        div.appendChild(btn);
      }

      container.appendChild(div);
    }
  });
}

// ================== Send Reminder ==================
function sendReminder(type, seatNo = null) {
  const seatsData = JSON.parse(localStorage.getItem(getSeatsKey())) || {};

  if (type === 'all') {
    Object.entries(seatsData).forEach(([seat, member]) => {
      if (!member.feePaid) {
        alert(`Reminder Sent to ${member.name} (Seat ${seat})\nFee Pending: ₹${member.feeAmount || "N/A"}`);
      }
    });
  } else if (type === 'individual' && seatNo) {
    const member = seatsData[seatNo];
    if (member) {
      alert(`Reminder Sent to ${member.name} (Seat ${seatNo})\nFee Pending: ₹${member.feeAmount || "N/A"}`);
    }
  }
}

// ================== Init ==================
document.addEventListener("DOMContentLoaded", () => {
  renderSeats();
  showSection("orgDetails");
});
