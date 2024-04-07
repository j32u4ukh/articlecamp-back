## 依賴 npm 套件

### 資料庫相關
```
mysql2@3.2.0
sequelize@6.30.0
sequelize-cli@6.6.0
```

### 登入驗證相關

```
bcryptjs@2.4.3 // 加密密碼
passport@0.6.0
passport-facebook@3.0.0
passport-local@1.0.0
```

## sequelize-cli

### sequelize-cli 初始設置

在 Sequelize CLI 裡，已經把初始化時需要的設定寫成 sequelize init 腳本了，我們可以直接執行指令。這裡因為指令集安裝在工具目錄下，需要先使用 npx 指令來找到路徑，再呼叫 sequelize init：

```
npx sequelize init
```

指令執行後，請仔細看一下系統訊息，它就是自動幫你開了一些空的資料夾和檔案。

### 建立表格

這個指令會同時生成 migrations 和 models 當中的檔案，新建表格時可以使用這個。

```
npx sequelize model:generate --name article --attributes userId:integer,title:string,category:integer,content:string

npx sequelize model:generate --name category --attributes name:string

npx sequelize model:generate --name follow --attributes userId:integer,followTo:integer

npx sequelize model:generate --name message --attributes articleId:integer,userId:integer,content:string

npx sequelize model:generate --name user --attributes name:string,email:string,password:string,image:string
```

### Migration

migration:generate 是生成 migration 檔案的指令，不僅限於生成表格時使用

```
npx sequelize migration:generate --name migrationName
```

* up：

```
npx sequelize db:migrate
```

* down：

```
npx sequelize db:migrate:undo
```

### Seed

建立 Seed 檔案: `npx sequelize seed:generate --name initial-data`

執行 Seeder: `npx sequelize db:seed:all`

撤銷 Seeder: `npx sequelize db:seed:undo`