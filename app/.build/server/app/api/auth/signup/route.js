"use strict";(()=>{var e={};e.id=654,e.ids=[654],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},51267:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>E,patchFetch:()=>P,requestAsyncStorage:()=>w,routeModule:()=>f,serverHooks:()=>x,staticGenerationAsyncStorage:()=>A});var r={};i.r(r),i.d(r,{POST:()=>y,dynamic:()=>g});var s=i(79182),a=i(72007),n=i(56719),o=i(93442),l=i(83178),c=i(3390),d=i.n(c),h=i(18449);class p{static{this.FROM_EMAIL=process.env.FROM_EMAIL||"noreply@naggery.app"}static{this.APP_NAME="Naggery"}static{this.BASE_URL=process.env.NEXTAUTH_URL||"http://localhost:3000"}static async sendVerificationEmail(e,t,i="User"){let r=`${this.BASE_URL}/verify-email?token=${t}`;this.getEmailVerificationTemplate(i,r);try{return!0}catch(e){return console.error("Email sending failed:",e),!1}}static async sendEmailChangeVerification(e,t,i="User"){let r=`${this.BASE_URL}/verify-email-change?token=${t}`;return this.getEmailChangeTemplate(i,r,e),!0}static async sendPasswordResetEmail(e,t,i="User"){let r=`${this.BASE_URL}/reset-password?token=${t}`;return this.getPasswordResetTemplate(i,r),!0}static getEmailVerificationTemplate(e,t){let i=`Verify your ${this.APP_NAME} account`,r=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${i}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${this.APP_NAME}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${this.APP_NAME}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${e},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for signing up for ${this.APP_NAME}. To complete your registration and verify your email address, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${t}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${t}" style="color: #667eea;">${t}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>\xa9 2025 ${this.APP_NAME}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;return{subject:i,html:r,text:`
      Welcome to ${this.APP_NAME}!
      
      Hi ${e},
      
      Thank you for signing up for ${this.APP_NAME}. To complete your registration and verify your email address, please visit:
      
      ${t}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't create this account, you can safely ignore this email.
      
      \xa9 2025 ${this.APP_NAME}. All rights reserved.
    `}}static getEmailChangeTemplate(e,t,i){let r=`Verify your new email address for ${this.APP_NAME}`,s=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${r}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${this.APP_NAME}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your New Email Address</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${e},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              You requested to change your email address to <strong>${i}</strong>. To complete this change, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${t}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Verify New Email
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${t}" style="color: #667eea;">${t}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't request this email change, please ignore this email and contact support immediately.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>\xa9 2025 ${this.APP_NAME}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;return{subject:r,html:s,text:`
      Verify Your New Email Address
      
      Hi ${e},
      
      You requested to change your email address to ${i}. To complete this change, please visit:
      
      ${t}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't request this email change, please ignore this email and contact support immediately.
      
      \xa9 2025 ${this.APP_NAME}. All rights reserved.
    `}}static getPasswordResetTemplate(e,t){let i=`Reset your ${this.APP_NAME} password`,r=`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${i}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${this.APP_NAME}</h1>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hi ${e},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset the password for your ${this.APP_NAME} account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${t}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${t}" style="color: #667eea;">${t}</a>
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>\xa9 2025 ${this.APP_NAME}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;return{subject:i,html:r,text:`
      Reset Your Password
      
      Hi ${e},
      
      We received a request to reset the password for your ${this.APP_NAME} account. Visit this link to reset your password:
      
      ${t}
      
      This link will expire in 24 hours for security reasons.
      
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      
      \xa9 2025 ${this.APP_NAME}. All rights reserved.
    `}}}var u=i(61901),m=i(35229);let g="force-dynamic";async function y(e){try{let{name:t,email:i,password:r,phone:s,gender:a,termsAccepted:n}=await e.json();if(!t||!i||!r||!s||!a)return o.NextResponse.json({error:"Name, email, password, phone number, and gender are required"},{status:400});if(!n)return o.NextResponse.json({error:"You must accept the Terms and Conditions to create an account"},{status:400});if(!["MALE","FEMALE","OTHER","PREFER_NOT_TO_SAY"].includes(a))return o.NextResponse.json({error:"Invalid gender selection"},{status:400});if(!u.$.isValidEmail(i))return o.NextResponse.json({error:"Invalid email format"},{status:400});let c=u.$.formatPhone(s);if(!u.$.isValidPhone(c))return o.NextResponse.json({error:"Invalid phone number format. Please include country code (e.g., +1234567890)"},{status:400});let g=u.$.isPasswordStrong(r);if(!g.isStrong)return o.NextResponse.json({error:"Password requirements not met",details:g.errors},{status:400});let y=e.headers.get("x-forwarded-for")||"unknown",f=await m.p.checkLoginAttempts(y);if(!f.allowed)return o.NextResponse.json({error:f.message},{status:429});if(await l._.user.findUnique({where:{email:i}}))return o.NextResponse.json({error:"User with this email already exists"},{status:400});if(await l._.user.findUnique({where:{phone:c}}))return o.NextResponse.json({error:"User with this phone number already exists"},{status:400});let w=await d().hash(r,12),A=await l._.user.create({data:{name:t,email:i,password:w,phone:c,gender:a,termsAccepted:!0,termsAcceptedAt:new Date,isActive:!1},select:{id:!0,name:!0,email:!0,phone:!0,gender:!0,termsAccepted:!0,termsAcceptedAt:!0,isActive:!0,createdAt:!0}}),{token:x}=await h.g.createVerificationRequest(A.id,"EMAIL_VERIFICATION");return await p.sendVerificationEmail(A.email,x,A.name||"User")||console.error("Failed to send verification email"),o.NextResponse.json({message:"Account created successfully! Please check your email to verify your account before logging in.",user:{id:A.id,name:A.name,email:A.email,phone:A.phone,isActive:A.isActive,createdAt:A.createdAt},nextStep:"email_verification"},{status:201})}catch(e){return console.error("Signup error:",e),o.NextResponse.json({error:"Internal server error"},{status:500})}}let f=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/auth/signup/route",pathname:"/api/auth/signup",filename:"route",bundlePath:"app/api/auth/signup/route"},resolvedPagePath:"/home/ubuntu/naggery_app/app/app/api/auth/signup/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:w,staticGenerationAsyncStorage:A,serverHooks:x}=f,E="/api/auth/signup/route";function P(){return(0,n.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:A})}},83178:(e,t,i)=>{i.d(t,{_:()=>s});var r=i(53524);let s=globalThis.prisma??new r.PrismaClient},61901:(e,t,i)=>{i.d(t,{$:()=>o});var r=i(84770),s=i.n(r),a=i(80238),n=i.n(a);class o{static{this.ENCRYPTION_KEY=process.env.ENCRYPTION_KEY||"default-key-change-in-production"}static{this.ALGORITHM="aes-256-gcm"}static generateRandomString(e=32){return s().randomBytes(e).toString("hex")}static hashPassword(e){let t=s().randomBytes(16).toString("hex"),i=s().pbkdf2Sync(e,t,1e4,64,"sha512").toString("hex");return`${t}:${i}`}static verifyPassword(e,t){let[i,r]=t.split(":");return r===s().pbkdf2Sync(e,i,1e4,64,"sha512").toString("hex")}static encryptData(e){try{return n().AES.encrypt(e,this.ENCRYPTION_KEY).toString()}catch(e){throw console.error("Encryption error:",e),Error("Failed to encrypt data")}}static decryptData(e){try{return n().AES.decrypt(e,this.ENCRYPTION_KEY).toString(n().enc.Utf8)}catch(e){throw console.error("Decryption error:",e),Error("Failed to decrypt data")}}static generateSecureToken(e=64){return s().randomBytes(e).toString("base64url")}static createSecureHash(e){return s().createHash("sha256").update(e).digest("hex")}static isValidEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}static isValidPhone(e){return/^\+[1-9]\d{1,14}$/.test(e)}static sanitizePhone(e){return e.replace(/[^\d+]/g,"")}static formatPhone(e){let t=this.sanitizePhone(e);return t.startsWith("+")?t:`+1${t}`}static isPasswordStrong(e){let t=[];return e.length<8&&t.push("Password must be at least 8 characters long"),/[A-Z]/.test(e)||t.push("Password must contain at least one uppercase letter"),/[a-z]/.test(e)||t.push("Password must contain at least one lowercase letter"),/\d/.test(e)||t.push("Password must contain at least one number"),/[!@#$%^&*(),.?":{}|<>]/.test(e)||t.push("Password must contain at least one special character"),{isStrong:0===t.length,errors:t}}static encryptApiKey(e){if(!e||""===e.trim())throw Error("API key cannot be empty");return this.encryptData(e.trim())}static decryptApiKey(e){if(!e||""===e.trim())throw Error("Encrypted API key cannot be empty");return this.decryptData(e.trim())}static validateApiKeyFormat(e,t){if(!e||""===e.trim())return{isValid:!1,error:"API key cannot be empty"};let i=e.trim();switch(t){case"OPENAI":if(!i.startsWith("sk-"))return{isValid:!1,error:'OpenAI API keys must start with "sk-"'};if(i.length<20)return{isValid:!1,error:"OpenAI API key appears to be too short"};break;case"CLAUDE":if(!i.startsWith("sk-ant-"))return{isValid:!1,error:'Claude API keys must start with "sk-ant-"'};if(i.length<20)return{isValid:!1,error:"Claude API key appears to be too short"};break;default:return{isValid:!1,error:"Unsupported API provider"}}return{isValid:!0}}static maskApiKey(e){if(!e||e.length<8)return"****";let t=e.substring(0,4),i=e.substring(e.length-4),r="*".repeat(Math.max(4,e.length-8));return`${t}${r}${i}`}}},35229:(e,t,i)=>{i.d(t,{p:()=>a});var r=i(39103),s=i.n(r);class a{constructor(){this.defaultOptions={windowMs:9e5,maxAttempts:5,message:"Too many attempts, please try again later"},this.cache=new(s())({stdTTL:this.defaultOptions.windowMs/1e3,checkperiod:60})}async checkRateLimit(e,t={}){let i={...this.defaultOptions,...t},r=`rate_limit:${e}`,s=Date.now();i.windowMs;let a=this.cache.get(r)||{count:0,resetTime:s+i.windowMs};s>a.resetTime&&(a={count:0,resetTime:s+i.windowMs}),a.count++;let n=Math.ceil((a.resetTime-s)/1e3);this.cache.set(r,a,n);let o=a.count<=i.maxAttempts;return{allowed:o,remaining:Math.max(0,i.maxAttempts-a.count),resetTime:a.resetTime,message:o?void 0:i.message}}async incrementAttempt(e){await this.checkRateLimit(e)}async resetRateLimit(e){let t=`rate_limit:${e}`;this.cache.del(t)}static async checkLoginAttempts(e){return new a().checkRateLimit(`login:${e}`,{windowMs:9e5,maxAttempts:5,message:"Too many login attempts. Please try again in 15 minutes."})}static async checkVerificationAttempts(e){return new a().checkRateLimit(`verification:${e}`,{windowMs:3e5,maxAttempts:3,message:"Too many verification attempts. Please wait 5 minutes."})}static async check2FAAttempts(e){return new a().checkRateLimit(`2fa:${e}`,{windowMs:6e5,maxAttempts:5,message:"Too many 2FA attempts. Please wait 10 minutes."})}static async checkSMSAttempts(e){return new a().checkRateLimit(`sms:${e}`,{windowMs:36e5,maxAttempts:3,message:"Too many SMS requests. Please wait 1 hour."})}}},18449:(e,t,i)=>{i.d(t,{g:()=>n});var r=i(84770),s=i.n(r),a=i(83178);class n{static{this.CODE_LENGTH=6}static{this.TOKEN_LENGTH=32}static{this.EMAIL_EXPIRY=864e5}static{this.SMS_EXPIRY=6e5}static{this.MAX_ATTEMPTS=5}static generateVerificationCode(){return Math.floor(1e5+9e5*Math.random()).toString()}static generateSecureToken(){return s().randomBytes(this.TOKEN_LENGTH).toString("hex")}static async createVerificationRequest(e,t,i,r){let s=this.generateSecureToken(),n=this.generateVerificationCode(),o="EMAIL_VERIFICATION"===t||"EMAIL_CHANGE"===t?this.EMAIL_EXPIRY:this.SMS_EXPIRY;await a._.verificationRequest.deleteMany({where:{userId:e,type:t,expires:{lt:new Date}}});let l=await a._.verificationRequest.create({data:{userId:e,type:t,token:s,code:"SMS_VERIFICATION"===t?n:void 0,expires:new Date(Date.now()+o)}});return{token:s,code:"SMS_VERIFICATION"===t?n:void 0,expires:l.expires}}static async verifyCode(e,t){let i=await a._.verificationRequest.findUnique({where:{token:e}});return!(!i||i.expires<new Date)&&!i.verified&&!(i.attempts>=this.MAX_ATTEMPTS)&&(await a._.verificationRequest.update({where:{id:i.id},data:{attempts:i.attempts+1}}),i.code===t&&(await a._.verificationRequest.update({where:{id:i.id},data:{verified:!0}}),!0))}static async verifyEmailToken(e){let t=await a._.verificationRequest.findUnique({where:{token:e}});return!(!t||t.expires<new Date)&&!t.verified&&("EMAIL_VERIFICATION"===t.type||"EMAIL_CHANGE"===t.type)&&(await a._.verificationRequest.update({where:{id:t.id},data:{verified:!0}}),!0)}static async getVerificationRequest(e){return a._.verificationRequest.findUnique({where:{token:e},include:{user:!0}})}static async cleanupExpiredRequests(){await a._.verificationRequest.deleteMany({where:{expires:{lt:new Date}}})}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),r=t.X(0,[372,657,296,390,238],()=>i(51267));module.exports=r})();