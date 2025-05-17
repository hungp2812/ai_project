document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!userData) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "login.html";
    return;
  }

  const emailDisplay = document.getElementById("emailDisplay");
  const nameDisplay = document.getElementById("userName");
  const profileSection = document.getElementById("profile");
  const modal = document.getElementById("addUserModal");

  // Hiển thị thông tin tài khoản
  emailDisplay.textContent = userData.email;
  nameDisplay.textContent = userData.name;

  // Tạo nút Edit Info
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit Info";
  profileSection.appendChild(editBtn);

  editBtn.addEventListener("click", () => {
    profileSection.innerHTML = `
      <div class="edit-container">
        <h2>Edit Account</h2>
        <label>Email:</label>
        <p>${userData.email}</p>
        <label>User name:</label>
        <input type="text" id="editUserName" value="${userData.name}" />
        <label>New password:</label>
        <input type="password" id="editPass" value="${userData.password}" />
        <button id="saveBtn">Save</button>
      </div>
    `;

    document.getElementById("saveBtn").addEventListener("click", () => {
      const newPass = document.getElementById("editPass").value;
      const newUserName = document.getElementById("editUserName").value;

      if (!newPass || !newUserName) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
      }

      userData.password = newPass;
      userData.name = newUserName;
      sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
      alert("Cập nhật thành công!");
      location.reload();
    });
  });

  // Nếu là admin, hiển thị tab quản lý người dùng
  if (userData.type === "admin") {
    document.getElementById("manageTab").style.display = "block";
    loadUserTable();
  }

  // Chuyển tab
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

  // Mở modal thêm user
  document.getElementById("addUserBtn").addEventListener("click", () => {
    document.getElementById("newUserEmail").value = "";
    document.getElementById("newUserRole").value = "user";
    modal.style.display = "flex";
  });

  // Hủy modal
  document.getElementById("cancelAddUser").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Thêm user mới từ modal
  document.getElementById("confirmAddUser").addEventListener("click", () => {
    const email = document.getElementById("newUserEmail").value.trim();
    const role = document.getElementById("newUserRole").value;

    if (!email) {
      alert("Please enter an email.");
      return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${email}</td>
      <td>
        <select class="roleSelect">
          <option value="user" ${role === "user" ? "selected" : ""}>User</option>
          <option value="admin" ${role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </td>
      <td><button class="deleteUserBtn">Delete</button></td>
    `;
    document.getElementById("userTableBody").appendChild(row);

    // Gắn sự kiện xóa với xác nhận
    row.querySelector(".deleteUserBtn").addEventListener("click", () => {
      showDeleteModal(row);
    });

    modal.style.display = "none";
  });
});

// Load danh sách người dùng
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
      <td>
        <select class="roleSelect">
          <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
          <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </td>
      <td><button class="deleteUserBtn">Delete</button></td>
    `;
    userTable.appendChild(row);

    row.querySelector(".deleteUserBtn").addEventListener("click", () => {
      showDeleteModal(row);
    });
  });
}

// Modal xác nhận xóa user
function showDeleteModal(rowToDelete) {
  const deleteModal = document.getElementById("deleteConfirmModal");
  deleteModal.style.display = "flex";

  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  const handleConfirm = () => {
    rowToDelete.remove();
    closeModal();
  };

  const closeModal = () => {
    deleteModal.style.display = "none";
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", closeModal);
  };

  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn.addEventListener("click", closeModal);
}