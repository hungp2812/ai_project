async function fetchScanLogs() {
  try {
    const res = await fetch("/show_logs", {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to load logs");

    const logs = await res.json();
    renderScanList(logs);
  } catch (err) {
    console.error("Error fetching scan logs:", err);
    document.getElementById("scanList").innerHTML = "<p>No logs found.</p>";
  }
}

function renderScanList(logs) {
  const scanList = document.getElementById("scanList");
  const scanDetails = document.getElementById("scanDetails");
  scanList.innerHTML = "";

  logs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach((log, index) => {
      const entry = document.createElement("div");
      entry.className = "scan-entry";
      entry.innerHTML = `
        <div><strong>${log.model.toUpperCase()}</strong></div>
        <div>${new Date(log.created_at).toLocaleString()}</div>
      `;
      entry.onclick = () => showLogDetail(log);
      scanList.appendChild(entry);

      if (index === 0) showLogDetail(log);
    });
}

function showLogDetail(log) {
  const html = `
    <div class="result-images">
      <img src="${log.image || 'placeholder.png'}" alt="${log.model} analysis"/>
    </div>
    <div class="result-messages">
      <p><strong>Model:</strong> ${log.model.toUpperCase()}</p>
      <p><strong>Message:</strong> ${log.message}</p>
      <p><strong>Scanned at:</strong> ${new Date(log.created_at).toLocaleString()}</p>
    </div>
  `;
  document.getElementById("scanDetails").innerHTML = html;
}

window.addEventListener("DOMContentLoaded", fetchScanLogs);