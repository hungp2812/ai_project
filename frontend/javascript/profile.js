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


  // Thông tin người dùng lấy được từ api
  /*
    "user_id": self.user.user_id,
    "username": self.user.username,
    "password": self.user.password,
    "email": self.user.email,
    "role": self.user.role.value,
    "latest_face_recognition": self.user.latest_face_recognition,
  */

    // Lay thông tin người dùng từ backend_api
  fetch("http://localhost:5000/user/profile", {
    credentials: "include" // Gửi cookie kèm theo (cần thiết nếu dùng session Flask)
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    })
    .then(data => {
      // Cập nhật thông tin người dùng
      // userData.user_id = data.user_id;
      userData.email = data.email;
      userData.username = data.username;
      userData.role = data.role;
      sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
    })
    .catch(error => {
      console.error("Error fetching user data:", error);
      alert("Có lỗi xảy ra khi tải thông tin người dùng.");
    });


  // Hiển thị thông tin tài khoản
  emailDisplay.textContent = userData.email;
  nameDisplay.textContent = userData.username;

  // Tạo nút Edit Info
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit Info";
  profileSection.appendChild(editBtn);

  editBtn.addEventListener("click", () => {
    const passwordModal = document.getElementById("passwordConfirmModal");
    const confirmBtn = document.getElementById("confirmPasswordBtn");
    const cancelBtn = document.getElementById("cancelPasswordBtn");
    const passwordInput = document.getElementById("confirmPasswordInput");
    const passwordError = document.getElementById("passwordError");

    passwordInput.value = "";
    passwordError.style.display = "none";
    passwordModal.style.display = "flex";

    const handleConfirm = () => {
      if (passwordInput.value === userData.password) {
        passwordModal.style.display = "none";

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

        cleanupListeners();
      } else {
        passwordError.style.display = "block";
      }
    };

    const handleCancel = () => {
      passwordModal.style.display = "none";
      cleanupListeners();
    };

    const cleanupListeners = () => {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
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
    document.getElementById("newUserName").value = "";
    document.getElementById("newUserPass").value = "";
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
    const username = document.getElementById("newUserName").value.trim();
    const password = document.getElementById("newUserPass").value.trim();
    const role = document.getElementById("newUserRole").value;

    if (!email) {
      alert("Please enter an email.");
      return;
    }

    if (!username) {
      alert("Please enter a username.");
      return;
    }

    if (!password) {
      alert("Please enter a password.");
      return;
    }

    // example request body:
    /*
  curl -X POST http://localhost:5000/admin/users/add \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "username": "amongus",
    "password": "anhbaolon",
    "email": "amongus@example.com",
    "role": "user"
  }'

    */

    // Gửi yêu cầu thêm user mới
    fetch("http://localhost:5000/admin/users/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // Gửi cookie kèm theo (cần thiết nếu dùng session Flask)
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
        role: role
      })
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to add user");
        return response.json();
      })
      .then(data => {
        alert("Thêm người dùng thành công!");
        loadUserTable(); // Tải lại bảng người dùng
      })
      .catch(error => {
        console.error("Error adding user:", error);
        alert("Có lỗi xảy ra khi thêm người dùng.");
      });

    // const row = document.createElement("tr");
    // row.innerHTML = `
    //   <td>${email}</td>
    //   <td>
    //     <select class="roleSelect">
    //       <option value="user" ${role === "user" ? "selected" : ""}>User</option>
    //       <option value="admin" ${role === "admin" ? "selected" : ""}>Admin</option>
    //     </select>
    //   </td>
    //   <td><button class="deleteUserBtn">Delete</button></td>
    // `;
    // document.getElementById("userTableBody").appendChild(row);

    // // Gắn sự kiện xóa với xác nhận
    // row.querySelector(".deleteUserBtn").addEventListener("click", () => {
    //   showDeleteModal(row);
    // });

    modal.style.display = "none";
  });
});

function loadUserTable() {
  const userTable = document.getElementById("userTableBody");

  fetch("http://localhost:5000/admin/users", {
    credentials: "include" // Gửi cookie kèm theo (cần thiết nếu dùng session Flask)
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    })
    .then(users => {
      userTable.innerHTML = ""; // Clear cũ

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
          showDeleteModal(u._id); // dùng ID thật để gửi request xóa
        });

        row.querySelector(".roleSelect").addEventListener("change", (e) => {
          const newRole = e.target.value;
          updateUserRole(u._id, newRole);
        });
      });
    })
    .catch(error => {
      console.error("Error fetching users:", error);
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