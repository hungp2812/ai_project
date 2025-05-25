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

uploadOptionBtn.addEventListener('click', () => {
    webcamSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    uploadOptionBtn.classList.add('hidden');
    streamOptionBtn.classList.remove('hidden');

    if (video.srcObject) {
      currentStream = video.srcObject;
      const tracks = currentStream.getTracks();
      tracks.forEach(track => track.stop());  // Tắt từng track
      video.srcObject = null;  // Dừng phát video
    }

    startScanBtn.classList.remove("hidden");
});

// Webcam activation
const activateBtn = document.getElementById('activate-webcam');
const video = document.getElementById('webcam');
const stopScanBtn = document.getElementById('stopScanBtn');
const canvas = document.getElementById('canvas');
const startScanBtn = document.getElementById("startScanBtn");
const resultImages = document.getElementById("resultImages");
const resultLogs = document.getElementById("resultLogs");
const toggleBtn = document.getElementById("toggleLogBtn");
const streamOptionBtn = document.getElementById('stream-option');

activateBtn.addEventListener('click', async () => {
  startScanBtn.classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  activateBtn.classList.add('hidden');
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

let intervalId = null;
let lastDetectedFace = null;

// LOGIC xử lý việc quét mặt thông qua gọi API đến BACKEND
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
]).then(() => {
  console.log("Models loaded.");
  startScanBtn.addEventListener("click", () => {
    startScanBtn.disabled = true;
    startScanBtn.textContent = "Analyzing...";

    // Kiểm tra nếu là chế độ upload
    if (!uploadSection.classList.contains("hidden")) {
      const uploadedImageSrc = uploadedPreview.src;

      if (!uploadedImageSrc || uploadedImageSrc === "") {
        alert("Please upload an image first!");
        return;
      }

      console.log("Sending uploaded image to backend...");
      sendImageToBackend(uploadedImageSrc);
    } else {
      canvas.classList.remove("hidden");
      stopScanBtn.classList.remove("hidden");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const socket = io("http://localhost:5000");
      socket.on("connect", () => {
        console.log("[SocketIO] Connected", socket.id);
        socket.emit("start_scan");

        let sendInterval = 1000;
        let lastSent = 0;
        // Bắt đầu quét liên tục
        intervalId = setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );
          const resized = faceapi.resizeResults(detections, displaySize);
          const context = canvas.getContext("2d");
          context.clearRect(0, 0, canvas.width, canvas.height);

          faceapi.draw.drawDetections(canvas, resized);

          const now = Date.now();
          if (detections.length > 0) {
            lastDetectedFace = detections[0].box;

            if (now - lastSent > sendInterval) {
              const { x, y, width, height } = lastDetectedFace;

              const faceCanvas = document.createElement("canvas");
              faceCanvas.width = width;
              faceCanvas.height = height;
              const faceCtx = faceCanvas.getContext("2d");
              faceCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
              const croppedImage = faceCanvas.toDataURL("image/jpeg");

              socket.emit("image", { image: croppedImage });
              console.log("[SocketIO] Sent cropped face image");

              lastSent = now;
            }
          }
        }, 100);
      });

      socket.on("prediction", ({ model, image, box_count, has_wrinkle, count }) => {
        console.log("[SocketIO] Received prediction from model:", model);

        // Cập nhật ảnh tương ứng
        if (model === "acne") {
          document.getElementById("resultImage1").src = image;
          document.getElementById("resultItem1").classList.add("active");
        } else if (model === "wrinkle") {
          document.getElementById("resultImage2").src = image;
          document.getElementById("resultItem2").classList.add("active");
        } else if (model === "darkspot") {
          document.getElementById("resultImage3").src = image;
          document.getElementById("resultItem3").classList.add("active");
        }

        // Ghi log
        const log = document.getElementById("logContent");
        let message = "";

        if (model === "acne") {
          message = box_count > 0
            ? `Đã phát hiện ${box_count} vùng nghi ngờ là mụn.`
            : `Không phát hiện mụn.`;
        } else if (model === "darkspot") {
          message = box_count > 0
            ? `Đã phát hiện ${box_count} vết thâm trên da.`
            : `Không phát hiện vết thâm.`;
        } else if (model === "wrinkle") {
          message = has_wrinkle
            ? `Phát hiện dấu hiệu của nếp nhăn.`
            : `Không phát hiện nếp nhăn.`;
        }

        log.innerHTML += `<p><strong>${model.charAt(0).toUpperCase() + model.slice(1)}:</strong> ${message}</p>`;
      });

      
      socket.on("done", ({model, results}) => {
        const log = document.getElementById("logContent");
        log.innerHTML += `<p style="color: green;"><strong>${model}</strong> Analysis complete ✅</p>`;
      });
      
      socket.on("disconnect", () => {
        console.log("[SocketIO] Disconnected");
        clearInterval(intervalId);
        intervalId = null;
      });

    }
  });
});

// Hàm xử lý cho nút Stop scanning
stopScanBtn.addEventListener("click", () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Scanning stopped.");

    // if (lastDetectedFace) {
    //   const { x, y, width, height } = lastDetectedFace;

    //   const faceCanvas = document.createElement("canvas");
    //   faceCanvas.width = width;
    //   faceCanvas.height = height;
    //   const faceCtx = faceCanvas.getContext("2d");
    //   faceCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
    //   const finalImage = faceCanvas.toDataURL("image/jpeg");

    //   const socket = io("http://localhost:5000");
    //   socket.emit("image", { image: finalImage });
    //   console.log("[SocketIO] Sent final face image after stop");
    // }

    stopScanBtn.classList.add("hidden");
    startScanBtn.disabled = false;
    startScanBtn.textContent = "Start scanning";
  }
});

async function sendImageToBackend(base64Image) {
  const log = document.getElementById("logContent");
  // log.innerHTML = ""; // Xóa log cũ trước mỗi lần gửi ảnh
  log.innerHTML = `<p><strong>Sending image to /analyze...</strong></p>`;

  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      credentials: "include", // Đảm bảo gửi cookie nếu cần
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();
    console.log("Received response from backend:", data);

    ["acne", "wrinkle", "darkspot"].forEach((model, index) => {
      const result = data[model];
      if (result && result.success) {
        // add prefix image format to result.image
        image = result.image.startsWith("data:image/jpeg;base64,") ? result.image : `data:image/jpeg;base64,${result.image}`;

        document.getElementById(`resultImage${index + 1}`).src = image;
        document.getElementById(`resultItem${index + 1}`).classList.add("active");

        let message = "";
        const box_count = result.meta?.box_count || 0;
        const has_wrinkle = result.meta?.has_wrinkle || false;

        if (model === "acne") {
          message = box_count > 0
            ? `Đã phát hiện ${box_count} vùng nghi ngờ là mụn.`
            : `Không phát hiện mụn.`;
        } else if (model === "darkspot") {
          message = box_count > 0
            ? `Đã phát hiện ${box_count} vết thâm trên da.`
            : `Không phát hiện vết thâm.`;
        } else if (model === "wrinkle") {
          message = has_wrinkle
            ? `Phát hiện dấu hiệu của nếp nhăn.`
            : `Không phát hiện nếp nhăn.`;
        }

        log.innerHTML += `<p><strong>${model}:</strong> ${message}</p>`;
      } else {
        log.innerHTML += `<p style="color:red;"><strong>${model} error:</strong> ${result?.error || "Unknown error"}</p>`;
      }
    });

    startScanBtn.disabled = false;
    startScanBtn.textContent = "Start scanning";

  } catch (err) {
    console.error("Error sending image to backend:", err);
    log.innerHTML += `<p style="color:red;"><strong>Request failed:</strong> ${err.message}</p>`;
  }
}

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
    startScanBtn.disabled = false;
    startScanBtn.textContent = "Start scanning";
  });

  streamOptionBtn.addEventListener('click', () => {
    webcamSection.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    uploadOptionBtn.classList.remove('hidden');
    streamOptionBtn.classList.add('hidden');

    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());  // Dừng tất cả các track
      video.srcObject = null;  // Dừng phát video
    }

    startScanBtn.classList.add("hidden");
  });
});