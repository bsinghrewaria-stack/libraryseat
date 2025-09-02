let generatedOTP = "1234"; // Demo OTP

// ========= UI Functions =========
function showRegisterForm() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("registerSection").style.display = "block";
}

function backToLogin() {
  document.getElementById("registerSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("forgotPassSection").style.display = "none";
  document.getElementById("newPasswordSection").style.display = "none";
}

// ========= Country Code =========
function updateCountryCode() {
  let nation = document.getElementById("nation").value;
  document.getElementById("countryCode").value = nation;
}
updateCountryCode(); // default call

// ========= Mobile OTP =========
function sendMobileOTP() {
  alert("OTP sent to mobile (Use 1234 for demo)");
  document.getElementById("mobileOTP").style.display = "block";
  document.getElementById("verifyMobileBtn").style.display = "inline-block";
}
function verifyMobileOTP() {
  let otp = document.getElementById("mobileOTP").value;
  if (otp === generatedOTP) {
    alert("Mobile Verified ✅");
    localStorage.setItem("mobileVerified", "true");
  } else {
    alert("Invalid Mobile OTP ❌");
  }
}

// ========= Email OTP =========
function sendEmailOTP() {
  alert("OTP sent to Email (Use 1234 for demo)");
  document.getElementById("emailOTP").style.display = "block";
  document.getElementById("verifyEmailBtn").style.display = "inline-block";
}
function verifyEmailOTP() {
  let otp = document.getElementById("emailOTP").value;
  if (otp === generatedOTP) {
    alert("Email Verified ✅");
    localStorage.setItem("emailVerified", "true");
  } else {
    alert("Invalid Email OTP ❌");
  }
}

// ========= Shifts =========
function showShiftInputs() {
  let shiftCount = parseInt(document.getElementById("shifts").value);
  let container = document.getElementById("shiftInputs");
  container.innerHTML = ""; // reset

  for (let i = 1; i <= shiftCount; i++) {
    let div = document.createElement("div");
    div.innerHTML = `
      <p>Shift ${i} Timing:</p>
      <input type="time" id="shift${i}Start"> to 
      <input type="time" id="shift${i}End">
    `;
    container.appendChild(div);
  }
}

// ========= Register Organisation =========
function registerOrganisation() {
  let orgName = document.getElementById("orgName").value.trim();
  let adminName = document.getElementById("adminName").value.trim();
  let nation = document.getElementById("nation").options[document.getElementById("nation").selectedIndex].text;
  let state = document.getElementById("state").value;
  let district = document.getElementById("district").value;
  let city = document.getElementById("city").value;
  let countryCode = document.getElementById("countryCode").value;
  let mobile = document.getElementById("mobile").value;
  let email = document.getElementById("email").value;
  let shifts = parseInt(document.getElementById("shifts").value);
  let subscription = document.getElementById("subscription").value;

  if (!localStorage.getItem("mobileVerified") || !localStorage.getItem("emailVerified")) {
    alert("Please verify Mobile & Email before registering ❌");
    return;
  }

  if (!orgName || !adminName) {
    alert("Please fill Organisation and Admin Name ❌");
    return;
  }

  // collect shift timings
  let shiftData = [];
  for (let i = 1; i <= shifts; i++) {
    let start = document.getElementById(`shift${i}Start`).value;
    let end = document.getElementById(`shift${i}End`).value;
    shiftData.push({ start, end });
  }

  // generate credentials
  let prefix = orgName.replace(/\s+/g, "").substring(0, 4).toUpperCase();
  let userId = prefix + Math.floor(Math.random() * 10000);
  let userPass = "PASS" + Math.floor(Math.random() * 1000);

  // save all data
  let orgData = {
    orgName,
    adminName,
    address: { nation, state, district, city },
    mobile: countryCode + mobile,
    email,
    shifts: shiftData,
    subscription,
    userId,
    userPass,
    isTempPassword: true,
  };

  // get all users
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users.push(orgData);
  localStorage.setItem("users", JSON.stringify(users));

  // clear verification flags (so next org must verify again)
  localStorage.removeItem("mobileVerified");
  localStorage.removeItem("emailVerified");

  // Show registration success with Login ID + Org Name
  document.getElementById("registerSection").innerHTML = `
    <h2>✅ Registration Successful!</h2>
    <p><strong>Login ID -</strong> ${userId}</p>
    <p><strong>Organisation Name -</strong> ${orgName}</p>
    <p><strong>Admin Name -</strong> ${adminName}</p>
    <p><strong>Password (Temporary) -</strong> ${userPass}</p>
    <button onclick="backToLogin()">Go to Login</button>
  `;
}

// ========= Login =========
function login() {
  let id = document.getElementById("loginId").value.trim();
  let pass = document.getElementById("loginPass").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.userId === id && u.userPass === pass);

  if (user) {
    if (user.isTempPassword) {
      alert("Temporary password detected. Please create a new password before login.");
      localStorage.setItem("currentUser", user.userId); // only this user active
      document.getElementById("newPasswordSection").style.display = "block";
      document.getElementById("loginSection").style.display = "none";
    } else {
      localStorage.setItem("currentUser", user.userId); // only this user active
      window.location.href = "dashboard/dashboard.html";
    }
  } else {
    alert("Invalid ID or Password ❌");
  }
}

// ========= Forgot Password =========
function forgotPassword() {
  document.getElementById("forgotPassSection").style.display = "block";
  document.getElementById("loginSection").style.display = "none";
}
function sendForgotOTP() {
  alert("OTP Sent to Mobile (Use 1234)");
}
function resetPassword() {
  let otp = document.getElementById("forgotOTP").value;
  if (otp === generatedOTP) {
    alert("OTP Verified. Please create a new password.");
    document.getElementById("newPasswordSection").style.display = "block";
    document.getElementById("forgotPassSection").style.display = "none";
  } else {
    alert("Invalid OTP ❌");
  }
}

// ========= Create New Password =========
function createNewPassword() {
  let newPass = document.getElementById("newPass").value;
  if (newPass.trim() === "") {
    alert("Password cannot be empty!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUserId = localStorage.getItem("currentUser");

  let userIndex = users.findIndex(u => u.userId === currentUserId);
  if (userIndex !== -1) {
    users[userIndex].userPass = newPass;
    users[userIndex].isTempPassword = false;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Password Updated Successfully! Now you can login.");
    backToLogin();
  } else {
    alert("Error: User not found ❌");
  }
}
