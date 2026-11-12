# Hostinger par Deploy karna (PHP edition)

Ye guide `php-app/` folder ko Hostinger ke shared hosting (koi bhi plan jisme
PHP + MySQL ho — Premium, Business, Cloud) par live karne ke liye hai. Node.js
ki koi zaroorat nahi — ye plain PHP hai, isliye normal "Website" hosting
kaafi hai (Node.js app feature select mat karo).

---

## Step 1: MySQL Database banao

1. hPanel me jaake **Databases → MySQL Databases** par jao.
2. Naya database create karo — Hostinger khud ek naam suggest karega jaisa
   `u123456789_corium`. Same tarah username bhi milega
   (`u123456789_admin`). Password khud choose karo aur **safe jagah save
   karo** — baad me `.env` file me chahiye hoga.
3. Us user ko database se link karo (Hostinger usually automatically kar
   deta hai jab tum "Create Database" se banate ho).
4. Note kar lo:
   - **Database host** — usually `localhost` (kabhi kabhi ek specific
     hostname bhi hota hai, hPanel screen par likha milega)
   - **Database name**
   - **Database user**
   - **Database password**

## Step 2: Files upload karo

Do tareeke hain:

### Option A — Zip upload (simple)
1. Apne local machine par sirf `php-app/` folder ko zip karo (baaki repo,
   jaise Next.js wala hissa, upload karne ki zaroorat nahi).
2. hPanel → **File Manager** kholo, apne domain ke root folder me jao
   (usually `public_html`).
3. Zip upload karo aur **Extract** karo.

### Option B — Git se deploy (agar plan me available ho)
hPanel → **Git** (Advanced section) me repo connect karke `php-app/`
directory deploy kar sakte ho, agar Hostinger ka plan Git deployment support
karta hai.

**Important:** Extract karne ke baad folder structure aisa hona chahiye:
```
public_html/
  (ya jo bhi upload folder hai)
  php-app/
    public/
    src/
    database/
    .env.example
    ...
```

## Step 3: Document Root set karo (sabse zaroori step)

Website ka "document root" (jo publicly accessible hai) `php-app/public`
hona chahiye — poora `php-app/` folder nahi, sirf uske andar ka `public/`
subfolder. Ye isliye zaroori hai kyunki `src/`, `database/`, `.env` waghera
files kabhi bhi public internet se directly accessible nahi honi chahiye
(security ke liye).

1. hPanel → **Websites** → apni site select karo → **Manage**.
2. Settings me "Document Root" ya "Website Root" option dhundo (kabhi
   **Advanced → Domains** ke andar bhi hota hai).
3. Path ko change karke set karo: `public_html/php-app/public`
   (exact path tumhare upload location ke hisaab se thoda alag ho sakta
   hai — jo bhi folder me tumne extract kiya, uske andar `php-app/public`).
4. Save karo. Kuch hosting plans me ye option na mile — us case me ek
   alternative hai: `php-app/public` ke andar ki saari files upload karke
   directly `public_html` me daal do, aur `src/`, `database/` ko
   `public_html` ke **ek level upar** (outside web root) rakho. Agar tumhe
   confusion ho is step par, mujhe bata dena — main tumhare exact hPanel
   screenshots dekhkar guide kar sakta hoon.

## Step 4: `.env` file banao

`.env` file kabhi bhi git me commit nahi hoti (security), isliye ye khud
banani hogi seedhe server par.

1. File Manager me `php-app/` folder ke andar jao (public ke bahar,
   ek level upar — jahan `.env.example` file hai).
2. `.env.example` ko copy/rename karke `.env` banao, ya naya file create
   karo.
3. Isme ye values daalo (Step 1 se jo notes liye the):
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=u123456789_corium
   DB_USER=u123456789_admin
   DB_PASS=tumhara_database_password
   APP_URL=https://tumhara-domain.com
   APP_NAME=CORIUM
   SESSION_SECRET=koi-lambi-random-string-yaha-daalo
   ```
   `APP_URL` bina trailing slash ke, aur `https://` ke saath (agar SSL
   enabled hai, jo Hostinger free me deta hai).

## Step 5: Database schema aur demo data load karo

1. hPanel → **Databases → phpMyAdmin** kholo, apna database select karo.
2. **Import** tab me jao, aur `database/schema.sql` file upload karke
   import karo. Isse saari 18 tables ban jayengi.
3. Demo data (50 products, categories, orders, etc.) ke liye SSH access
   chahiye hoga:
   - hPanel → **Advanced → SSH Access** se enable karo (agar plan me
     available hai).
   - SSH se login karke: `cd public_html/php-app && php database/seed.php`
   - Agar SSH nahi mila plan me, koi baat nahi — bina demo data ke bhi site
     chalegi, bas products/categories khud admin panel se add karne honge.

## Step 6: Uploads folder writable banao

Admin panel se image upload karne ke liye:
1. File Manager me `php-app/public/uploads` folder banao (agar already
   nahi hai).
2. Us folder par right-click → **Permissions**, aur `755` ya `775` set
   karo.

## Step 7: Test karo

1. Apni domain browser me kholo — homepage load hona chahiye.
2. `/login` pe jaake admin se login karo:
   - Email: `admin@corium-leather.com`
   - Password: `Admin@12345`
   (Agar seed script chalaya tha step 5 me, ye login kaam karega — turant
   password change kar lena production ke liye!)
3. `/admin` panel check karo, ek product ya category add karke dekho.
4. Agar koi page 404 ya 500 error de raha hai, sabse pehle ye check karo:
   - Document root sahi hai (`php-app/public`, poora `php-app` nahi)?
   - `.env` file sahi jagah hai aur values correct hain?
   - `.htaccess` file `public/` folder me present hai (upload/extract me
     kabhi hidden files skip ho jaati hain — File Manager me "Show Hidden
     Files" option check karo)?

---

## Common problems

| Problem | Solution |
|---|---|
| Homepage khulti hai par sab links 404 dete hain | `.htaccess` missing ya document root galat hai |
| "Database connection failed" | `.env` ki DB values check karo, database host `localhost` hi hai na |
| Images upload nahi ho rahi admin se | `public/uploads` folder ki permissions check karo (755/775) |
| CSS load nahi ho rahi, site bina design ke dikh rahi hai | `public/assets/css/app.css` file upload hui ya nahi confirm karo |
| Clean URLs (`/shop` waghera) kaam nahi kar rahe | Apache `mod_rewrite` enabled hai ya nahi hosting provider se confirm karo (Hostinger shared hosting me by default on hota hai) |

Agar kisi step pe atko, exact error message ya screenshot share karna —
us hisaab se specific help kar dunga.
