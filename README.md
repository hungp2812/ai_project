# SkinSight

_Ứng dụng phân tích làn da_

<div align="center">

[![image](https://img.shields.io/badge/user%20story-docs-blue)](https://docs.google.com/document/d/1mo_M7fOjziYH-977mjpAKFkQWEb9PR8xqTluGkaoTtY/edit?usp=sharing)
[![image](https://img.shields.io/badge/use%20case-docs-orange)](https://docs.google.com/document/d/1mo_M7fOjziYH-977mjpAKFkQWEb9PR8xqTluGkaoTtY/edit?usp=sharing)

</div>

## Table of Contents

- [About](#about)
- [Planning and Designing](#planning-and-designing)
- [Stream](#stream)
- [Run the app](#run-the-app)
- [Contributions](#contributions)

## About

SkinSight là một sản phẩm của nhóm 5 sinh viên thuộc UET-VNU, sử dụng công cụ AI để phân tích làn da với những thông số cụ thể. Người dùng khi sử dụng ứng dụng này có thể biết được tình trạng da mặt như độ mụn, nám đen, nếp nhăn, độ lão hoá

Thứ giúp cho Skinsight khác biệt so với những sản phẩm cùng chức năng là giao diện được thiết kế khoa học, tối giản, đồng thời sử dụng một mô hình học máy cho phép ứng dụng thực hiện phân tích một cách nhanh chóng và toàn diện, một số tính năng tiêu biểu như:

-  Khả năng chạy song song trên 3 image mô hình khác nhau để cho ra kết quả nhanh, chính xác với từng loại
-  Hệ thống được tích hợp với camera của người dùng, giúp việc chụp ảnh trở nên nhanh chóng
-  Tính năng chọn trong kho ảnh nếu không thể truy cập camera
-  Hỗ trợ tạo ra 1 log chi tiết về tình trạng làn da
-  Hỗ trợ tiếng Việt cho toàn bộ người dùng
-  Hệ thống cơ sở dữ liệu bảo mật

Để có thể chạy ứng dụng, người dùng chỉ cần nhập dòng lệnh này trong Docker:

```bash
docker compose up -d
```

Nếu port của bạn là 5000, thì bạn có thể truy cập ứng dụng qua <http://localhost:5000>

## Designing

Sau đây là một số thiết kế biểu đồ để hỗ trợ nắm bắt rõ hơn về ứng dụng, bao gồm:

- **Sequence Diagram** để khai quát toàn bộ quá trình khởi động ứng dụng cho đến hết ca làm việc, cho cả người dùng lẫn quản trị viên:

<!-- Screenshots -->
<p align="center">
  <img src="svg/sequence_user.svg" style="margin:10px;">
</p>

<!-- Screenshots -->
<p align="center">
  <img src="svg/sequence_admin.svg" width="50%" style="margin:10px;">
</p>

- **Class Diagram** để khai quát hệ thống các lớp, hàm được sử dụng, các attribute và method của mỗi lớp:

<!-- Screenshots -->
<p align="center">
  <img src="svg/class_diagram.svg" width="50%" style="margin:10px;">
</p>

- **ERD Diagram** để khái quát mối quan hệ giữa các Table trong Database
<!-- Screenshots -->
<p align="center">
  <img src="svg/erd_diagram.svg" width="60%" style="margin:10px;">
</p>

## Stream

## Run the app

## Contributions
