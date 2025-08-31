// ================== Load organisation data ==================
window.onload = function () {
  let orgData = JSON.parse(localStorage.getItem("orgData"));

  if (!orgData) {
    alert("No organisation data found! Please register first.");
    window.location.href = "index.html";
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
  shiftList.innerHTML = "";
  orgData.shifts.forEach((s, i) => {
    let li = document.createElement("li");
    li.textContent = `Shift ${i + 1}: ${s.start} to ${s.end}`;
    shiftList.appendChild(li);
  });

  // Seats load karo
  renderSeats();
};

// ================== Logout ==================
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "../index.html";
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

// ================== Seats Rendering ==================
function renderSeats() {
  const seatContainer = document.getElementById("seatContainer");
  seatContainer.innerHTML = "";
  let seatsData = JSON.parse(localStorage.getItem("seatsData")) || {};

  for (let i = 1; i <= 50; i++) {
    let seatDiv = document.createElement("div");
    seatDiv.classList.add("seat");

    if (seatsData[i]) {
      seatDiv.classList.add("filled");
      seatDiv.innerHTML = `<strong>${i}</strong><br>${seatsData[i].name}<br>${seatsData[i].shift}`;
      seatDiv.onclick = () => showMemberDetails(i, seatsData[i]);
    } else {
      seatDiv.classList.add("vacant");
      seatDiv.innerHTML = `<strong>${i}</strong><br><em>Vacant</em>`;
      seatDiv.onclick = () => openAddMemberForm(i);
    }

    seatContainer.appendChild(seatDiv);
  }
}

// ================== Open Form ==================
function openAddMemberForm(seatNo) {
  currentSeat = seatNo;
  document.getElementById("addMemberForm").classList.remove("hidden");
  profileDataURL = null;

  // Start camera
  const video = document.getElementById("profileCamera");
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => video.srcObject = stream)
      .catch(err => console.log("Camera error:", err));
  }

  document.getElementById("memberForm").reset();
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
  const fee = document.getElementById("feeMethod").value;

  const aadhaarPhotoFile = document.getElementById("aadhaarPhoto").files[0];
  let reader = new FileReader();
  reader.onload = function() {
    const aadhaarPhotoData = reader.result;

    let seatsData = JSON.parse(localStorage.getItem("seatsData")) || {};
    seatsData[currentSeat] = {
      name, mobile, aadhaar, address, shift,
      joining, exit, fee,
      aadhaarPhoto: aadhaarPhotoData,
      profilePhoto: profileDataURL
    };
    localStorage.setItem("seatsData", JSON.stringify(seatsData));

    document.getElementById("addMemberForm").classList.add("hidden");
    renderSeats();
  };

  if(aadhaarPhotoFile){
    reader.readAsDataURL(aadhaarPhotoFile);
  } else {
    // No Aadhaar photo selected
    let seatsData = JSON.parse(localStorage.getItem("seatsData")) || {};
    seatsData[currentSeat] = {
      name, mobile, aadhaar, address, shift,
      joining, exit, fee,
      aadhaarPhoto: null,
      profilePhoto: profileDataURL
    };
    localStorage.setItem("seatsData", JSON.stringify(seatsData));
    document.getElementById("addMemberForm").classList.add("hidden");
    renderSeats();
  }
}

// ================== Cancel Form ==================
function cancelAddMember() {
  document.getElementById("memberForm").reset();
  document.getElementById("addMemberForm").classList.add("hidden");
  profileDataURL = null;
  const video = document.getElementById("profileCamera");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
}

// ================== Show Member Details ==================
function showMemberDetails(seatNo, member) {
  let info = `
Seat No: ${seatNo}
Name: ${member.name}
Mobile: ${member.mobile}
Aadhaar: ${member.aadhaar}
Address: ${member.address}
Shift: ${member.shift}
Joining: ${member.joining}
Exit: ${member.exit}
Fee: ${member.fee}
  `;
  alert(info);
}

// ================== Section Switching ==================
function showSection(id) {
  const sections = document.querySelectorAll("main .section");
  sections.forEach(sec => sec.classList.add("hidden"));
  const sec = document.getElementById(id);
  if (sec) sec.classList.remove("hidden");
}

// ================== Init ==================
document.addEventListener("DOMContentLoaded", () => {
  renderSeats();
  showSection("orgDetails");
});
