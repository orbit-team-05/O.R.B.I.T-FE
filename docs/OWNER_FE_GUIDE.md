# ORBIT Owner FE Guide

## Mục tiêu

Khi code màn Owner, phải đồng bộ với Admin đã làm:

- React + Vite + TailwindCSS
- react-router-dom
- axios qua `httpClient`
- chia theo pattern: `service -> hook -> components -> page -> route`
- không dùng data fake nếu backend đã có API
- dùng `ToastProvider` cho thông báo
- dùng `ConfirmDialog` cho xác nhận
- page chưa làm thì dùng `ComingSoonPage`
- không dùng `window.confirm`
- không để loading toàn trang sau lần load đầu tiên

## Cấu trúc thư mục chuẩn

Ví dụ màn Owner Seasons:

```text
src/features/owner/seasons/
├── services/
│   └── ownerSeasonApi.js
├── hooks/
│   └── useOwnerSeasons.js
└── components/
    ├── OwnerSeasonStats.jsx
    ├── OwnerSeasonTable.jsx
    └── OwnerSeasonDrawer.jsx

src/pages/owner/seasons/
└── OwnerSeasonsPage.jsx
``` 