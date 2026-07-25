<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f4f7f0;padding:40px 0;">
    <div style="max-width:420px;margin:auto;background:#fff;border-radius:16px;border:1px solid #c8dba8;padding:40px;text-align:center;">
        <div style="margin-bottom:16px;">
            <span style="font-size:22px;font-weight:700;color:#1a4a1a;">BSAB<span style="color:#3a8a3a;">Shop</span></span>
        </div>
        <h2 style="color:#1a4a1a;font-size:18px;margin-bottom:8px;">Password Reset OTP</h2>
        <p style="color:#4a7a4a;font-size:14px;margin-bottom:24px;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#2d6a2d;background:#f4faea;border:1px solid #b8d890;border-radius:10px;padding:16px 24px;display:inline-block;margin-bottom:24px;">
            {{ $otp }}
        </div>
        <p style="color:#6a8a6a;font-size:12px;">If you didn't request this, please ignore this email.</p>
    </div>
</body>
</html>
