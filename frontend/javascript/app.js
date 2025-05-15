// Tabs chuyển đổi Login/Register
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-login");

tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        tabContents.forEach(c => c.classList.remove("active"));
        tabContents[index].classList.add("active");
    });
});

// === LOGIN CONTROL ===
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const type = document.getElementById("loginType").value;

      fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: email, 
          password: password, 
          role: type 
        })
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("loggedInUser", JSON.stringify({ username: email, type })); // Lưu thủ công

          alert("Đăng nhập thành công!");
          window.location.href = "homepage.html";
        } else {
          alert(body.error || "Đăng nhập thất bại");
        }
      })
      .catch(error => {
        console.error("Lỗi khi gọi API:", error);
        alert("Không thể đăng nhập lúc này. Vui lòng thử lại sau.");
      });  
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const accountMenu = document.querySelector('.account-menu');
  const accountBtn  = accountMenu.querySelector('.accountBtn');
  const dropdown    = accountMenu.querySelector('.dropdown');
  const isLoggedIn  = sessionStorage.getItem('isLoggedIn');

  // Khởi tạo text & hành vi nút
  if (isLoggedIn === 'true') {
    accountBtn.textContent = 'My Account';
    accountBtn.addEventListener('click', e => {
      e.stopPropagation();           // tránh luồng event bắn ra document
      dropdown.classList.toggle('show');
    });

    // Logout
    accountMenu.querySelector('#logoutLink')
      .addEventListener('click', e => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.reload();
        window.location.href = 'homepage.html';
      });

    // Click ra ngoài để đóng dropdown
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });

  } else {
    accountBtn.textContent = 'Login';
    accountBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
});

/* quét mặt */
document.addEventListener('DOMContentLoaded', () => {
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        window.location.href = 'scan.html'; // Đã đăng nhập -> đi tới trang quét
      } else {
        window.location.href = 'login.html'; // Chưa đăng nhập -> yêu cầu đăng nhập
      }
    });
  }
});

/* scan screen */ 
const webcamSection = document.getElementById('webcam-section');
const uploadSection = document.getElementById('upload-section');
const uploadOptionBtn = document.getElementById('upload-option');
const captureOptionBtn = document.getElementById('capture-option');

uploadOptionBtn.addEventListener('click', () => {
    webcamSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    uploadOptionBtn.classList.add('hidden');
    captureOptionBtn.classList.remove('hidden');
});

captureOptionBtn.addEventListener('click', () => {
    uploadSection.classList.add('hidden');
    webcamSection.classList.remove('hidden');
    captureOptionBtn.classList.add('hidden');
    uploadOptionBtn.classList.remove('hidden');
});

// Webcam activation
const activateBtn = document.getElementById('activate-webcam');
const video = document.getElementById('webcam');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');

activateBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    captureBtn.classList.remove('hidden');
    activateBtn.classList.add('hidden');
});

let hasCaptured = false;

captureBtn.addEventListener('click', () => {
    if (!hasCaptured) {
        // Capture the current webcam frame
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/png');
        capturedImage.src = dataURL;
        capturedImage.classList.remove('hidden');
        video.classList.add('hidden');
        captureBtn.textContent = 'Capture again';
        hasCaptured = true;
    } else {
        // Reset to show webcam feed again
        capturedImage.classList.add('hidden');
        video.classList.remove('hidden');
        captureBtn.textContent = 'Capture';
        hasCaptured = false;
    }
});

// Upload preview
const imageUpload = document.getElementById('imageUpload');
const uploadedPreview = document.getElementById('uploadedPreview');

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            uploadedPreview.src = reader.result;
            uploadedPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

navigator.mediaDevices
  .getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      aspectRatio: 16 / 9
    },
    audio: false
  })
  .then(stream => {
    const video = document.getElementById('webcam');
    video.srcObject = stream;
    video.play();
  })
  .catch(err => {
    console.error("Failed to access webcam:", err);
  });

// Lấy phần tử span để hiển thị tên
const userNameSpan = document.getElementById('userName');

// Lấy thông tin người dùng từ localStorage
const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

if (loggedInUser && loggedInUser.name) {
  userNameSpan.textContent = loggedInUser.name;
} else {
  userNameSpan.textContent = 'Guest';
}

// giả lập in ra kết quả

window.addEventListener("DOMContentLoaded", () => {
  // Tất cả code JS bên dưới được đảm bảo chạy khi DOM đã load xong

  const startScanBtn = document.getElementById("startScanBtn");
  const resultImages = document.getElementById("resultImages");
  const resultLogs = document.getElementById("resultLogs");
  const toggleBtn = document.getElementById("toggleLogBtn");

  let isShowingLog = false;

  toggleBtn.addEventListener("click", () => {
    isShowingLog = !isShowingLog;

    if (isShowingLog) {
      resultImages.classList.remove("active");
      resultLogs.classList.add("active");
      toggleBtn.textContent = "Show Analysis";
    } else {
      resultLogs.classList.remove("active");
      resultImages.classList.add("active");
      toggleBtn.textContent = "Show Log";
    }
  });

  startScanBtn.addEventListener("click", () => {
    startScanBtn.disabled = true;
    startScanBtn.textContent = "Analyzing...";

    setTimeout(() => {
      const analysisResults = {
        image1: '../Pictures/acne.jpg',
        image2: '../Pictures/acne.jpg',
        image3: '../Pictures/acne.jpg',
        log: 'Analysis complete! Detected acne, wrinkles, and age spots.'
      };

      document.getElementById("resultImage1").src = analysisResults.image1;
      document.getElementById("resultImage2").src = analysisResults.image2;
      document.getElementById("resultImage3").src = analysisResults.image3;

      document.getElementById("logContent").textContent = analysisResults.log;

      document.getElementById("resultItem1").classList.add("active");
      document.getElementById("resultItem2").classList.add("active");
      document.getElementById("resultItem3").classList.add("active");

      resultImages.classList.add("active");
      resultLogs.classList.remove("active");

      toggleBtn.textContent = "Show Log";
      isShowingLog = false;

      startScanBtn.disabled = false;
      startScanBtn.textContent = "Start scanning";
    }, 2000);
  });

  // Upload preview
  const imageUploadInput = document.getElementById("imageUpload");
  const uploadedPreview1 = document.getElementById("uploadedPreview");
  const clearUploadBtn = document.getElementById("clearUploadBtn");

  imageUploadInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedPreview1.src = e.target.result;
        uploadedPreview1.classList.remove("hidden");
        clearUploadBtn.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  clearUploadBtn.addEventListener("click", function () {
    imageUploadInput.value = "";
    uploadedPreview1.src = "";
    uploadedPreview1.classList.add("hidden");
    clearUploadBtn.classList.add("hidden");
  });
});
