import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


async def send_email(to_email: str, subject: str, html_body: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp.from_name} <{settings.smtp.from_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.smtp.host,
        port=settings.smtp.port,
        username=settings.smtp.user,
        password=settings.smtp.password,
        start_tls=True,
    )


async def send_otp_email(to_email: str, otp: str, user_name: str):
    subject = "RMS \u2014 Password Reset OTP"
    otp_digits = ""
    html_body = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#e8edf5;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8edf5;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- HEADER with wave -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 30%,#1d4ed8 65%,#0891b2 100%);padding:36px 32px 48px;text-align:center;position:relative;">
            <!-- Logo -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td style="background-color:#ffffff;border-radius:14px;padding:10px 24px;">
                  <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;letter-spacing:4px;">RMS</span>
                </td>
              </tr>
            </table>
            <br />
            <span style="color:rgba(255,255,255,0.85);font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;">REIMBURSEMENT MANAGEMENT SYSTEM</span>
          </td>
        </tr>

        <!-- LOCK ICON circle overlapping header -->
        <tr>
          <td align="center" style="padding-top:0;background-color:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="background-color:#ffffff;border-radius:50%;width:72px;height:72px;border:4px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.12);margin-top:-36px;display:block;">
                  <div style="background-color:#eff6ff;border-radius:50%;width:72px;height:72px;text-align:center;line-height:72px;font-size:32px;">&#128272;</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TITLE -->
        <tr>
          <td align="center" style="padding:20px 40px 4px;background-color:#ffffff;">
            <span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;">Password Reset Request</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 40px 8px;background-color:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="width:48px;height:3px;background-color:#1d4ed8;border-radius:2px;"></td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:8px 40px 28px;background-color:#ffffff;">
            <span style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:13px;">We received a request to reset your password.</span>
          </td>
        </tr>

        <!-- USER CARD -->
        <tr>
          <td style="padding:0 32px 24px;background-color:#ffffff;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;background-color:#f8fafc;">
              <tr>
                <td style="padding:20px 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top" style="padding-right:14px;">
                        <div style="background-color:#dbeafe;border-radius:50%;width:44px;height:44px;text-align:center;line-height:44px;font-size:20px;">&#128100;</div>
                      </td>
                      <td valign="middle">
                        <span style="color:#1e293b;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;display:block;">Hello, <span style="color:#1d4ed8;">{user_name}</span></span>
                        <span style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;display:block;margin-top:4px;">Use the OTP below to reset your RMS account password. This code is valid for <strong style="color:#1d4ed8;">10 minutes</strong> only.</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- OTP BOX -->
        <tr>
          <td style="padding:0 32px 24px;background-color:#ffffff;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #bfdbfe;border-radius:16px;background-color:#f0f7ff;">
              <tr>
                <td align="center" style="padding:28px 20px 20px;">
                  <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;display:block;margin-bottom:18px;">YOUR ONE-TIME PASSWORD</span>
                  <span style="color:#1d4ed8;font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:800;letter-spacing:10px;display:block;">{otp}</span>
                  <br />
                  <span style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:12px;">&#9719; Expires in <strong style="color:#1d4ed8;">10 minutes</strong></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- STEPS -->
        <tr>
          <td style="padding:0 32px 24px;background-color:#ffffff;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;background-color:#f8fafc;">
              <tr>
                <td style="padding:20px 24px;">
                  <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:14px;">HOW TO RESET YOUR PASSWORD:</span>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="32" valign="top">
                        <div style="background-color:#1d4ed8;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;"><span style="color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;">1</span></div>
                      </td>
                      <td valign="middle" style="padding-left:4px;padding-bottom:10px;">
                        <span style="color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Go back to the RMS login page</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="32" valign="top">
                        <div style="background-color:#1d4ed8;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;"><span style="color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;">2</span></div>
                      </td>
                      <td valign="middle" style="padding-left:4px;padding-bottom:10px;">
                        <span style="color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Enter the OTP: <strong style="color:#1d4ed8;">{otp}</strong></span>
                      </td>
                    </tr>
                    <tr>
                      <td width="32" valign="top">
                        <div style="background-color:#1d4ed8;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;"><span style="color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;">3</span></div>
                      </td>
                      <td valign="middle" style="padding-left:4px;">
                        <span style="color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Set your new secure password</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WARNING -->
        <tr>
          <td style="padding:0 32px 32px;background-color:#ffffff;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #fde68a;border-radius:14px;background-color:#fffbeb;">
              <tr>
                <td style="padding:16px 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top" style="padding-right:12px;">
                        <div style="background-color:#f59e0b;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-size:14px;">&#128737;</div>
                      </td>
                      <td valign="middle">
                        <span style="color:#78350f;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;display:block;">If you did not request a password reset, please ignore this email.</span>
                        <span style="color:#78350f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;">Your account remains secure.</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="background-color:#f1f5f9;border-top:1px solid #e2e8f0;padding:24px 32px;border-radius:0 0 20px 20px;">
            <span style="color:#475569;font-family:Arial,Helvetica,sans-serif;font-size:11px;display:block;margin-bottom:6px;">&#128737; This is an automated message from RMS System</span>
            <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;display:block;">&copy; 2026 Reimbursement Management System.</span>
            <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;display:block;">All rights reserved.</span>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>"""
    await send_email(to_email, subject, html_body)