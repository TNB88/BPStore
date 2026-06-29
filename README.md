# BPStore

Kho APK rieng cho app store cua Binh Pro.

## Cau truc

- `apps.json`: danh sach app chinh.
- `repo.json`: ban sao/alias de app store cu co the doc.
- `apks/`: de file APK.
- `icons/`: de icon app.
- `banners/`: de banner/hinh gioi thieu.
- `worker.js`: Cloudflare Worker mau, dung khi can proxy API store.

## Them app moi

1. Copy APK vao `apks/`.
2. Copy icon vao `icons/`.
3. Sua `apps.json` va tang `versionCode` neu la ban cap nhat.
4. Copy noi dung `apps.json` sang `repo.json`.
5. Commit va push len GitHub.

## Link raw mau

```text
https://raw.githubusercontent.com/TNB88/BPStore/refs/heads/main/apps.json
https://raw.githubusercontent.com/TNB88/BPStore/refs/heads/main/repo.json
https://raw.githubusercontent.com/TNB88/BPStore/refs/heads/main/apks/TenApp.apk
```

## Ghi chu

APK store hien tai dang hardcode base URL cu:

```text
http://tungbui.ddns.net:2001/
```

URL cu dai 29 ky tu. Neu va truc tiep trong `libapp.so`, URL moi nen bang hoac ngan hon 29 ky tu. Goi y:

```text
https://bpstore.pages.dev/
```
