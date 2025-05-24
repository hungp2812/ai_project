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

      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;

      fetch("http://localhost:5000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          username: username, 
          password: password, 
        })
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("loggedInUser", JSON.stringify({ 
            user_id: body.user_id,
            username: body.username,
            email: body.email,
            role: body.role
          })); // Lưu thủ công

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

// Request API đăng ký
document.addEventListener("DOMContentLoaded", () => {
  // Lấy phần tử form đăng ký
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Ngăn form submit mặc định (reload page)

    // Lấy dữ liệu từ form
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("loginType").value;

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    // Chuẩn bị dữ liệu gửi API
    // Theo ví dụ API bạn cho, API cần username, password, email
    // Mình dùng 'name' làm username nếu bạn muốn, hoặc bạn có thể thêm trường username riêng
    const data = {
      username: name,
      password: password,
      email: email,
      // role: role // nếu backend hỗ trợ role, còn không thì bỏ dòng này (Mặc định là user thôi)
    };

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include" // Nếu backend dùng session/cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng ký thất bại");
      }

      const result = await response.json();
      alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      // Có thể chuyển hướng sang trang login
      window.location.href = "login.html";

    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert("Lỗi đăng ký: " + error.message);
    }
  });
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
const startScanBtn = document.getElementById("startScanBtn");
const resultImages = document.getElementById("resultImages");
const resultLogs = document.getElementById("resultLogs");
const toggleBtn = document.getElementById("toggleLogBtn");

activateBtn.addEventListener('click', async () => {
  startScanBtn.classList.remove("hidden");
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

// Lấy phần tử span để hiển thị tên
const userNameSpan = document.getElementById('userName');

// Lấy thông tin người dùng từ localStorage
const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

if (loggedInUser && loggedInUser.username) {
  userNameSpan.textContent = loggedInUser.username;
} else {
  userNameSpan.textContent = 'Guest';
}

// === PHẦN GỌI API ĐẾN BACKEND CỦA MODEL, GỬI ẢNH QUÉT ĐƯỢC VỀ BACKEND
// LOAD MODEL FACEAPI ĐỂ DETECT MẶT
const MODEL_URL = './models';

// LOGIC xử lý việc quét mặt thông qua gọi API đến BACKEND
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
])
.then(() => {
  console.log("Models loaded.");
  startScanBtn.addEventListener("click", () => {
    console.log("Starting face detection...");
    startScanBtn.disabled = true;
    startScanBtn.textContent = "Analyzing...";
    canvas.classList.remove("hidden");

    // Đảm bảo canvas khớp kích thước
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("[SocketIO] Connected", socket.id);
      socket.emit("start_scan");
      
      // Lắng nghe kết quả phân tích từ backend
      socket.on("prediction", ({ model, result }) => {
        console.log("[SocketIO] Received prediction from model:", model);
        console.log("Prediction result:", result);

        if (model === "acne") {
          document.getElementById("resultImage1").src = result.image;
          document.getElementById("resultItem1").classList.add("active");
        } else if (model === "wrinkle") {
          document.getElementById("resultImage2").src = result.image;
          document.getElementById("resultItem2").classList.add("active");
        } else if (model === "darkspot") {
          document.getElementById("resultImage3").src = result.image;
          document.getElementById("resultItem3").classList.add("active");
        }

        // Ghi log kết quả phân tích
        const log = document.getElementById("logContent");
        log.innerHTML += `<p><strong>${model}</strong>: ${result.message || 'Processed'}</p>`;
      });

      // Khi 1 model đã xử lý xong
      socket.on("done", ({model, results}) => {
        const log = document.getElementById("logContent");
        log.innerHTML += `<p style="color: green;"><strong>${model}</strong> analysis complete ✅</p>`;
      });

      //Nếu có lỗi
      socket.on("error", ({message}) => {
        console.error("[SocketIO] Error:", message);
        const log = document.getElementById("logContent");
        log.innerHTML += `<p style="color:red;"><strong>Error:</strong> ${message}</p>`;
      })
    });

    let sendInterval = 1000; // gửi ảnh về backend mỗi 1 giây nếu phát hiện mặt
    let lastSent = 0;

    // Bắt đầu quét liên tục
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );
      const resized = faceapi.resizeResults(detections, displaySize);
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        console.log("Face detected:", detections);
      }
      faceapi.draw.drawDetections(canvas, resized);

      const now = Date.now();
      if (detections.length > 0 && now - lastSent > sendInterval) {
        const face = detections[0].box;  // Lấy bounding box đầu tiên
        const x = face.x;
        const y = face.y;
        const width = face.width;
        const height = face.height;

        // Tạo một canvas tạm để crop phần khuôn mặt
        const faceCanvas = document.createElement("canvas");
        faceCanvas.width = width;
        faceCanvas.height = height;
        const faceCtx = faceCanvas.getContext("2d");

        // Vẽ phần khuôn mặt vào canvas tạm
        faceCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
        
        // Chuyển thành base64
        const croppedImage = faceCanvas.toDataURL("image/jpeg");

        // Gửi qua socket
        socket.emit("image", { image: croppedImage });
        console.log("[SocketIO] Sent cropped face image");

        lastSent = now;
      }
    }, 100);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  // Tất cả code JS bên dưới được đảm bảo chạy khi DOM đã load xong
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

  // Upload preview
  const clearUploadBtn = document.getElementById("clearUploadBtn");

  imageUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedPreview.src = e.target.result;
        uploadedPreview.classList.remove("hidden");
        clearUploadBtn.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  clearUploadBtn.addEventListener("click", function () {
    imageUpload.value = "";
    uploadedPreview.src = "";
    uploadedPreview.classList.add("hidden");
    clearUploadBtn.classList.add("hidden");
  });
});