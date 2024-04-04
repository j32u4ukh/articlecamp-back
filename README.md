# articlecamp-back
articlecamp 的後端

> 前端倉庫在 [這裡](https://github.com/j32u4ukh/articlecamp-front)。

## 本地建置與初始化

### 1. 取得專案(首次執行才需要)

透過 HTTPS 取得專案

```
$ git clone https://github.com/j32u4ukh/articlecamp-back.git
```

### 2. 安裝依賴套件(首次執行才需要)

確保當前路徑為專案資料夾下，指令將安裝 package-lock.json 內的套件

```
npm install
```

### 3. 設置環境變數(以 Linux 環境為例)

如果您只想臨時設置環境變數，可以在 shell 中執行以下命令：

```
export VARIABLE_NAME=value
```

在/etc/environment中設置：

您也可以將環境變數添加到/etc/environment文件中，這樣設置的環境變數將對所有用戶和進程都可見。

請注意，這些設置不支持 shell 腳本語法，僅支持 key=value 格式。

使用文本編輯器（如 nano 或 vim）打開 /etc/environment 文件，然後添加類似如下的行：

```
VARIABLE_NAME=value
```

保存文件並退出編輯器。這些更改將在下次系統啟動後生效。

完成設置後，您可以通過在命令行中輸入 echo $VARIABLE_NAME 來驗證環境變數是否已設置成功。

### 4. 設置 .env

複製一份 .env.example，命名為 .env，填入自己的參數

```
SESSION_SECRET=XXX
```

### 5. 生成資料庫表格(首次執行才需要)

須確保資料庫 articlecamp 存在

```
npx sequelize db:migrate
```

### 6. 寫入資料庫初始數據(首次執行才需要)

```
npx sequelize db:seed:all
```

### 7. 專案啟動

```
npm run dev
```