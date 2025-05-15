document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!userData) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "login.html";
    return;
  }

  const emailDisplay = document.getElementById("emailDisplay");
  const profileSection = document.getElementById("profile");

  // Hiển thị dữ liệu
  emailDisplay.textContent = userData.email;

  // Tạo form chỉnh sửa email
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit Info";
  profileSection.appendChild(editBtn);

  editBtn.addEventListener("click", () => {
    profileSection.innerHTML = `
      <h2>Edit Account</h2>
      <label>Email:</label><br>
      <input type="email" id="editEmail" value="${userData.email}" /><br>
      <label>Password:</label><br>
      <input type="password" id="editPass" value="${userData.password}" /><br>
      <button id="saveBtn">Save</button>
    `;

    document.getElementById("saveBtn").addEventListener("click", () => {
      const newEmail = document.getElementById("editEmail").value.trim();
      const newPass = document.getElementById("editPass").value;

      if (!newEmail || !newPass) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
      }

      // Cập nhật vào sessionStorage
      userData.email = newEmail;
      userData.password = newPass;
      sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
      alert("Cập nhật thành công!");
      location.reload();
    });
  });

  // Quản trị admin
  if (userData.type === "admin") {
    document.getElementById("manageTab").style.display = "block";
    loadUserTable();
  }

  // Tab switching
  const tabItems = document.querySelectorAll(".tab-item");
  const tabContents = document.querySelectorAll(".tab-content");

  tabItems.forEach(item => {
    item.addEventListener("click", () => {
      tabItems.forEach(i => i.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(item.getAttribute("data-tab")).classList.add("active");
    });
  });

  // Thêm người dùng (giả lập)
  const addBtn = document.getElementById("addUserBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const email = prompt("Nhập email:");
      const role = prompt("Nhập vai trò (user/admin):");

      if (email && role) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${email}</td>
          <td>${role}</td>
          <td><button onclick="this.closest('tr').remove()">Delete</button></td>
        `;
        document.getElementById("userTableBody").appendChild(newRow);
      }
    });
  }
});

function loadUserTable() {
  const userTable = document.getElementById("userTableBody");
  const users = [
    { email: "user1@example.com", role: "user" },
    { email: "admin@example.com", role: "admin" },
  ];

  userTable.innerHTML = "";
  users.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td><button onclick="this.closest('tr').remove()">Delete</button></td>
    `;
    userTable.appendChild(row);
  });
}
