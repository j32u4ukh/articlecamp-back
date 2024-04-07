# API v2

## 表格結構

### users 用戶
* number id: 用戶 ID
* string name: 用戶名稱
* string email: 用戶信箱
* string password: 用戶密碼
* array categories: 用戶文章前三主要分類(每次新增或更新文章時，同步更新此欄位)

### articls 文章
* number id: 文章 ID
* number userId: 作者 ID
* string title: 標題
* string content: 內文
* number createAt: 生成時間戳(UTC+0)
* number updateAt: 更新時間戳(UTC+0)

### messages 留言
* number id: 留言 ID
* number userId: 作者用戶 ID
* string message: 留言內文
* number createAt: 生成時間戳(UTC+0)

### follows 追隨關係
* number id: 追隨關係 ID
* number userId: 用戶 ID
* number followId: 被追隨的用戶 ID

## API 方法與 url

* POST /v2/register
    * 註冊帳號，讀取名稱、信箱、密碼
    * 檢查信箱使否已存在，存在則拒絕註冊，不存在則將用戶數據寫入檔案。
    * Request 數據格式：
    ```
    {
        name: "Author Name",
        email: "This is title",
        password: "This is content",
    }
    ```
    * Response 數據格式：
    ```
    {
        code: 20000,
    }
    ```

* POST /v2/login
    * 檢查信箱與密碼是否正確，正確則要求前端跳轉到文章列表頁，錯誤則拒絕登入。
    * 登入成功則返回用戶 id，並要求跳轉到 index.html
    * Request 數據格式：
    ```
    {
        email: "This is title",
        password: "This is content",
    }
    ```
    * Response 數據格式：
    ```
    {
        token: xxx,
    }


### Users

* GET /v2/users
    * 取得用戶列表，優先回傳已追蹤用戶，再回傳未追蹤用戶。
    * 返回的用戶列表不應包含當前用戶
    * query 參數: 
        * offset(可選): 數據筆數偏移量，預設為 0。
        * size(可選): 返回數據筆數，預設為 10。
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
        * status: 1: 追蹤, 0: 未追蹤
    ```
    {
        "total": 6,
        "offset": 0,
        "size": 6,
        "datas": [
            {
                "id": 1,
                "name": "Henry Lee",
                "image": "icons8-h-100.png",
                "updatedAt": "2024-04-04T13:34:16.000Z",
                "status": 1
            },
            {
                "id": 3,
                "name": "ShangRuey",
                "image": "icons8-s-100.png",
                "updatedAt": "2024-04-04T08:01:37.000Z",
                "status": 1
            },
            {
                "id": 4,
                "name": "Louis",
                "image": "icons8-l-100.png",
                "updatedAt": "2024-04-04T08:01:37.000Z",
                "status": 0
            },
            {
                "id": 5,
                "name": "Peggy",
                "image": "icons8-p-100.png",
                "updatedAt": "2024-04-04T08:01:37.000Z",
                "status": 0
            },
            {
                "id": 6,
                "name": "King",
                "image": null,
                "updatedAt": "2024-04-04T13:30:33.000Z",
                "status": 0
            },
            {
                "id": 7,
                "name": "King2",
                "image": null,
                "updatedAt": "2024-04-04T10:27:39.000Z",
                "status": 0
            }
        ]
    }
    ```

* POST /v2/users
    * 更新追隨狀態(ON/OFF)
    * Request 數據格式：
    ```
    {
        // 追蹤對象的 ID
        userId: 20,
        follow: true,
    }
    ```
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {
        code: 20000,
    }
    ```

* GET /v2/users/images/:userId/:fileName
    * 供 `<img src="/v2/images/:userId/:fileName">` 使用，前端無需自行發送請求或是處理回應

* PATCH /v2/users/profile
    * 更新用戶圖片
    * Request 數據格式：[bytes array]
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：     
    ```
    {
        code: 20000,
    }
    ```

* GET /v2/users/profile
    * 取得用戶資訊，包含用戶 ID、頭像圖片(圖片的 url)、用戶名稱、信箱。
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {
        id: 3,
        img: 圖片的 url,
        name: xxx,
        email: xxx@example.com
    }
    ```

### Articles

* GET /v2/articles
    * 返回文章列表
    * query 參數: 
        * offset(可選): 數據筆數偏移量，預設為 0。
        * size(可選): 返回數據筆數，預設為 10。
        * keyword(可選): 根據關鍵字來過濾文章列表 ex: /articles?keyword=xxx
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
        - total: 數據總數量
        - offset: 實際偏移筆數
        - size: 實際數據筆數
    ```
    {
        "total": 5,
        "offset": 0,
        "size": 3,
        "articles": [
            {
                "id": 1,
                "author": "Henry",
                "title": "CSS 筆記",
                "category": 1,
                "content": "aspect-ratio 設置元素的寬高...",
                "updateAt": 1709990534
            },
            {
                "id": 2,
                "author": "Henry",
                "title": "CSS 筆記",
                "category": 1,
                "content": "aspect-ratio 設置元素的寬高...",
                "updateAt": 1709990534
            },
            {
                "id": 3,
                "author": "Henry",
                "title": "CSS 筆記",
                "category": 1,
                "content": "aspect-ratio 設置元素的寬高...",
                "updateAt": 1709990534
            }
        ]
    }
    ```

* POST /v2/articles
    * 新增文章
    * Request 數據格式：
    ```
    {
        "title": "title36",
        "category": 4,
        "content": "This is content 08:26"
    }
    ```
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {        
        "id": 10,
        "title": "title36",
        "category": 4,
        "content": "This is content 08:26",
        "updateAt": 1711248223
    }
    ```

* GET /v2/articles/categories
    * 返回文章分類列表
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    [
       {
        code: 0,
        category: aaa,
       },
       {
        code: 1,
        category: bbb,
       }    
    ]
    ```

* GET /v2/articles/:id
    * 根據 id 返回單篇文章
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {
        user_id: 7,
        name: xxx,
        img: 圖片的 url,
        title: "This is title",
        content: "This is content",
        category: 2,
        messages: [
            {
                name: xxx,
                img: 圖片的 url,
                message: xxx,
                createAt: 12321,
            },
            {
                name: aaa,
                img: 圖片的 url,
                message: hello,
                createAt: 12327,
            },
        ]
    }
    ```

* PUT /v2/articles/:id
    * 根據 id 更新單篇文章
    * 可以部份更新
    * Request 數據格式：
    ```
    {
        content: "This is new content",
    }
    ```
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {
        id: 4,
        author: "Author Name",
        title: "This is title",
        content: "This is new content",
        updateAt: 1705840000,
    }
    ```

* GET /v2/articles/:id/messages
    * 返回文章留言列表
    * query 參數: 
        * offset(可選): 數據筆數偏移量，預設為 0。
        * size(可選): 返回數據筆數，預設為 10。
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {
        "total": 2,
        "offset": 0,
        "size": 10,
        "datas": [
            {
                "id": 1,
                "articleId": 1,
                "content": "This is message content",
                "createAt": 1705819929
            },
            {
                "id": 2,
                "articleId": 1,
                "content": "This is message content",
                "createAt": 1705819929
            }
        ]
    }
    ```

* POST /v2/articles/:id/messages
    * 新增文章留言
    * Request 數據格式：
    ```
    {
        user_id: 4,
        article_id: 3,
        content: "This is message",
    }
    ```
    * Request header: 使用登入時給的 token 作為辨識用戶的代碼
    ```
    Authorization = Bearer {{token}}
    ```
    * Response 數據格式：
    ```
    {
        id: 3,
        user_id: 4,
        article_id: 3,
        content: "This is message",
        updateAt: 1705840000,
    }
    ```