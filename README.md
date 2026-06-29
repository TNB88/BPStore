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

Luu y: Mstore khong doc JSON cho danh sach chinh. No doc file text `ap/app-list`.

## Cau truc quan trong

- `ap/app-list`: danh sach app theo format Mstore.
- `ap/descriptions.txt`: mo ta hien trong trang chi tiet app.
- `apks/`: de file APK.
- `banners/`: de banner va hinh gioi thieu.
- `icons/`: de icon app.
- `_redirects`: route cua Cloudflare Pages de app goi dung duong dan Mstore.
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

## Them app moi

1. Copy APK vao `apks/`, vi du `apks/Phim4K.apk`.
2. Copy banner vao `banners/`, vi du `banners/phim4k-banner.jpg`.
3. Copy icon vao `icons/`, neu can.
4. Them app vao `ap/app-list` theo format Mstore.
5. Neu chi co 1 app mau nhu hien tai, `_redirects` dang map:

```text
/ap/apps /apks/Phim4K.apk 200
/ap/images/* /banners/phim4k-banner.jpg 200
/ap/descriptions /ap/descriptions.txt 200
```

6. Commit va push len GitHub. Cloudflare Pages se tu deploy len:

```text
https://bpstore.pages.dev/
```

## Da test

- App hien muc `Phim 4K`.
- Banner va icon hien dung.
- Trang chi tiet hien mo ta.
- Bam `Tai ve` da tai APK va mo duoc hop chon `Trinh cai dat goi`.

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
