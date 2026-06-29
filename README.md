# BPStore

Kho APK rieng cho app BPStore kieu Mstore.

## Link dang dung

App BPStore da duoc patch base URL:

```text
https://bpstore.pages.dev/ap/
```

Khi mo app, APK goi:

```text
https://bpstore.pages.dev/ap/app-list
```

Luu y: Mstore khong doc JSON cho danh sach chinh. App goi `ap/app-list`, con Cloudflare Pages Functions se sinh danh sach nay tu `ap/catalog.json`.

## Cau truc quan trong

- `functions/`: API thong minh cho Mstore, tu tra dung app-list, APK, hinh va mo ta theo app.
- `ap/catalog.json`: noi quan ly danh sach app moi.
- `ap/app-list`: fallback tinh neu Worker chua chay.
- `ap/descriptions.txt`: fallback mo ta cu.
- `apks/`: de file APK.
- `banners/`: de banner va hinh gioi thieu.
- `icons/`: de icon app.
- `_redirects`: route fallback cu.
- `_headers`: header de app doc feed on dinh, quan trong nhat la `banner: 0`.

## Format app-list

Moi dong la mot muc. Trong mot muc, moi app cach nhau bang `!@#`.

```text
Ten muc!@#Ten app__Version__C:\Users\Administrator\Documents\Mstore\Ten muc\Ten app.apk
```

Vi du dang dung:

```text
Phim 4K!@#Phim4K__9.5.7__C:\Users\Administrator\Documents\Mstore\Phim 4K\Phim4K.apk
```

Nen de `Ten muc` khong dau de tranh loi ma hoa chu tren app.

## Them app moi bang catalog

1. Copy APK vao `apks/`, vi du `apks/Phim4K.apk`.
2. Copy banner vao `banners/`, vi du `banners/phim4k-banner.jpg`.
3. Copy icon vao `icons/`, vi du `icons/phim4k.png`.
4. Sua `ap/catalog.json`, them app vao dung muc:

```json
{
  "name": "TenApp",
  "version": "1.0",
  "apk": "TenApp.apk",
  "banner": "tenapp-banner.jpg",
  "icon": "tenapp.png",
  "description": "Mo ta ngan gon hien trong BPStore.",
  "screenshots": [
    "tenapp-banner.jpg"
  ]
}
```

5. Commit va push len GitHub. Cloudflare Pages se tu deploy len:

```text
https://bpstore.pages.dev/
```

Sau khi deploy, kiem tra Worker co chay khong bang endpoint:

```text
https://bpstore.pages.dev/ap/app-list
```

Neu header co `x-bpstore-worker: 1` la dang chay ban thong minh.

## Da test

- App hien muc `Phim 4K`.
- Banner va icon hien dung.
- Trang chi tiet hien mo ta.
- Bam `Tai ve` da tai APK va mo duoc hop chon `Trinh cai dat goi`.
- Worker local da test dung `/ap/app-list`, `/ap/apps`, `/ap/images/*`, `/ap/descriptions`.

## Ghi chu ky thuat

URL goc trong Mstore la:

```text
http://tungbui.ddns.net:2001/
```

URL moi duoc patch vao `libapp.so` la:

```text
https://bpstore.pages.dev/ap/
```

Hai URL deu dai 29 ky tu nen patch truc tiep trong binary khong can chen byte rong.
