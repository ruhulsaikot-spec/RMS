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

async def send_claim_submitted_email(
    to_email: str,
    approver_name: str,
    applicant_name: str,
    application_no: str,
    claim_type: str,
    amount: float,
    department: str = "",
    designation: str = "",
    claim_date: str = "",
    remarks: str = "",
    expense_items: list = None,
    application_id: str = "",
    email_type: str = "submitted",
):
    if email_type == "backed":
        subject = f"RMS \u2014 Claim Returned to Your Stage [{application_no}]"
        email_title = "Claim Returned to Your Stage"
        email_subtitle = "A claim has been sent back to your stage for re-review."
    elif email_type == "next_stage":
        subject = f"RMS \u2014 Claim Awaiting Your Approval [{application_no}]"
        email_title = "Claim Awaiting Your Approval"
        email_subtitle = "A reimbursement claim has been forwarded to you for approval."
    else:
        subject = f"RMS \u2014 New Claim for Approval [{application_no}]"
        email_title = "New Claim for Approval"
        email_subtitle = "A reimbursement claim has been submitted and is awaiting your review."

    # Build expense items rows
    expense_rows = ""
    if expense_items:
        for item in expense_items:
            expense_rows += f"""
                      <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('date','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('claim_type','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;">{item.get('purpose','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('mode','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('project','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('from_location','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('to_location','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1d4ed8;font-weight:700;text-align:right;white-space:nowrap;">&#2547; {float(item.get('amount',0)):,.0f}</td>
                      </tr>"""
    else:
        expense_rows = f"""
                      <tr>
                        <td colspan="7" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;">{claim_type}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1d4ed8;font-weight:700;text-align:right;">&#2547; {amount:,.0f}</td>
                      </tr>"""

    remarks_section = ""
    if remarks:
        remarks_section = f"""
              <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:12px;background-color:#f8fafc;">
                  <tr><td style="padding:16px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="padding-right:12px;">
                          <div style="background-color:#dbeafe;border-radius:50%;width:32px;height:32px;text-align:center;line-height:32px;font-size:16px;">&#128172;</div>
                        </td>
                        <td valign="middle">
                          <span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;display:block;margin-bottom:6px;">Employee Remarks</span>
                          <span style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">{remarks}</span>
                        </td>
                      </tr>
                    </table>
                  </td></tr>
                </table>
              </td></tr>"""

    html_body = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#e8edf5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8edf5;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 30%,#1d4ed8 65%,#0891b2 100%);padding:32px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
          <td style="background-color:#ffffff;border-radius:12px;padding:8px 20px;">
            <span style="color:#1d4ed8;font-size:20px;font-weight:800;letter-spacing:4px;">RMS</span>
          </td>
        </tr></table>
        <br /><span style="color:rgba(255,255,255,0.80);font-size:11px;letter-spacing:2px;text-transform:uppercase;">REIMBURSEMENT MANAGEMENT SYSTEM</span>
      </td></tr>

      <!-- ICON -->
      <tr><td align="center" style="padding:28px 40px 8px;background-color:#ffffff;">
        <div style="background-color:#dbeafe;border-radius:50%;width:68px;height:68px;text-align:center;line-height:68px;font-size:32px;display:inline-block;">&#128196;</div>
      </td></tr>

      <!-- TITLE -->
      <tr><td align="center" style="padding:12px 40px 4px;background-color:#ffffff;">
        <span style="color:#0f172a;font-size:24px;font-weight:800;">{email_title}</span>
      </td></tr>
      <tr><td align="center" style="padding:0 40px 4px;background-color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="width:48px;height:3px;background-color:#1d4ed8;border-radius:2px;"></td>
        </tr></table>
      </td></tr>
      <tr><td align="center" style="padding:8px 40px 20px;background-color:#ffffff;">
        <span style="color:#64748b;font-size:13px;line-height:20px;">{email_subtitle}</span>
      </td></tr>

      <!-- GREETING LEFT ALIGNED -->
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <span style="color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Hello, <strong style="color:#1d4ed8;">{approver_name}</strong></span>
      </td></tr>

      <!-- EMPLOYEE INFO CARD -->
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;background-color:#f8fafc;">
          <tr>
            <td style="padding:14px 16px;background-color:#f1f5f9;border-bottom:1px solid #e2e8f0;border-radius:14px 14px 0 0;">
              <span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">&#128100; Employee Information</span>
            </td>
          </tr>
          <!-- Row 1: Claim Number | Employee Name | Department -->
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Claim Number</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;">{application_no}</span>
                  </td>
                  <td width="33%" style="padding-right:8px;border-left:1px solid #e2e8f0;padding-left:12px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Employee Name</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;">{applicant_name}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Department</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;">{department}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Row 2: Designation | Application Date | Status -->
          <tr>
            <td style="padding:12px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Designation</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;">{designation}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Application Date</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;">{claim_date}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Status</span>
                    <span style="background-color:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;border:1px solid #bbf7d0;">Submitted</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- EXPENSE DETAILS - wider table with scroll hint -->
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:14px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:10px;">
                    <div style="background-color:#dbeafe;border-radius:6px;width:28px;height:28px;text-align:center;line-height:28px;font-size:14px;display:inline-block;">&#128203;</div>
                  </td>
                  <td><span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;">Expense Details</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0;overflow-x:auto;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="min-width:600px;">
                <tr style="background-color:#f1f5f9;">
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Date</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Claim Type</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">Purpose</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Mode</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Project</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">From</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">To</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;text-align:right;white-space:nowrap;">Amount</td>
                </tr>
                {expense_rows}
                <tr style="background-color:#eff6ff;border-top:2px solid #bfdbfe;">
                  <td colspan="7" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1d4ed8;font-weight:700;text-align:right;">Total Requested</td>
                  <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1d4ed8;font-weight:800;text-align:right;white-space:nowrap;">&#2547; {amount:,.0f}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      {remarks_section}

      <!-- VIEW CLAIM BUTTON -->
      <tr><td align="center" style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="background-color:#1d4ed8;border-radius:10px;padding:0;">
              <a href="http://localhost:3000/approvals/{application_id}" target="_blank" style="display:inline-block;padding:12px 32px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                &#128269; View Claim Application
              </a>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- NOTICE -->
      <tr><td style="padding:0 32px 28px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #fde68a;border-radius:12px;background-color:#fffbeb;">
          <tr><td style="padding:14px 18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="top" style="padding-right:12px;">
                  <div style="background-color:#f59e0b;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-size:14px;">&#9888;</div>
                </td>
                <td valign="middle">
                  <span style="color:#78350f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;display:block;">This is an automated email from RMS.</span>
                  <span style="color:#92400e;font-family:Arial,Helvetica,sans-serif;font-size:12px;display:block;">Please do not reply to this email.</span>
                  <span style="color:#92400e;font-family:Arial,Helvetica,sans-serif;font-size:12px;display:block;">If you have any questions, please contact our support team.</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background-color:#0f172a;border-radius:0 0 20px 20px;padding:24px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" width="50">
              <div style="background-color:#1e3a8a;border-radius:50%;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;">&#127911;</div>
            </td>
            <td valign="middle" style="padding-left:12px;">
              <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;display:block;">Need help?</span>
              <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;">support@company.com &nbsp;|&nbsp; +880 1234 567890</span>
            </td>
            <td valign="middle" align="right">
              <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;display:block;">&copy; 2026 RMS</span>
              <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;">All rights reserved.</span>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>"""
    await send_email(to_email, subject, html_body)

async def send_claim_status_email(
    to_email: str,
    applicant_name: str,
    application_no: str,
    claim_type: str,
    amount: float,
    status: str,
    remarks: str = "",
    department: str = "",
    designation: str = "",
    claim_date: str = "",
    expense_items: list = None,
    application_id: str = "",
):
    status_config = {
        "VERIFIED": {
            "icon": "&#10003;",
            "icon_bg": "#dbeafe",
            "badge_color": "#1e40af",
            "badge_bg": "#dbeafe",
            "badge_border": "#bfdbfe",
            "title": "Amount Verified",
            "subtitle": "Your reimbursement claim amount has been verified and is being processed.",
            "subject": f"RMS \u2014 Your Claim Amount Has Been Verified [{application_no}]",
            "btn_color": "#1d4ed8",
        },
        "APPROVED": {
            "icon": "&#10003;",
            "icon_bg": "#dcfce7",
            "badge_color": "#166534",
            "badge_bg": "#dcfce7",
            "badge_border": "#bbf7d0",
            "title": "Claim Approved",
            "subtitle": "Your reimbursement claim has been approved.",
            "subject": f"RMS \u2014 Your Claim Has Been Approved [{application_no}]",
            "btn_color": "#16a34a",
        },
        "REJECTED": {
            "icon": "&#10007;",
            "icon_bg": "#fee2e2",
            "badge_color": "#991b1b",
            "badge_bg": "#fee2e2",
            "badge_border": "#fecaca",
            "title": "Claim Rejected",
            "subtitle": "Unfortunately, your reimbursement claim has been rejected.",
            "subject": f"RMS \u2014 Your Claim Has Been Rejected [{application_no}]",
            "btn_color": "#dc2626",
        },
        "RETURNED": {
            "icon": "&#8629;",
            "icon_bg": "#fef9c3",
            "badge_color": "#854d0e",
            "badge_bg": "#fef9c3",
            "badge_border": "#fde68a",
            "title": "Claim Returned for Revision",
            "subtitle": "Your reimbursement claim has been returned. Please review and resubmit.",
            "subject": f"RMS \u2014 Your Claim Has Been Returned [{application_no}]",
            "btn_color": "#d97706",
        },
        "PAID": {
            "icon": "&#2547;",
            "icon_bg": "#dbeafe",
            "badge_color": "#1e40af",
            "badge_bg": "#dbeafe",
            "badge_border": "#bfdbfe",
            "title": "Payment Processed",
            "subtitle": "Your reimbursement has been successfully processed and paid.",
            "subject": f"RMS \u2014 Your Claim Payment Has Been Processed [{application_no}]",
            "btn_color": "#1d4ed8",
        },
    }

    cfg = status_config.get(status, status_config["APPROVED"])

    # Build expense rows
    expense_rows = ""
    if expense_items:
        for item in expense_items:
            expense_rows += f"""
                      <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('date','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('claim_type','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;">{item.get('purpose','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('mode','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('project','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('from_location','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;white-space:nowrap;">{item.get('to_location','')}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1d4ed8;font-weight:700;text-align:right;white-space:nowrap;">&#2547; {float(item.get('amount',0)):,.0f}</td>
                      </tr>"""
    else:
        expense_rows = f"""
                      <tr>
                        <td colspan="7" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#334155;">{claim_type}</td>
                        <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1d4ed8;font-weight:700;text-align:right;">&#2547; {amount:,.0f}</td>
                      </tr>"""

    remarks_section = ""
    if remarks:
        remarks_section = f"""
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:12px;background-color:#f8fafc;">
          <tr><td style="padding:16px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="top" style="padding-right:12px;">
                  <div style="background-color:#fef9c3;border-radius:50%;width:32px;height:32px;text-align:center;line-height:32px;font-size:16px;">&#128172;</div>
                </td>
                <td valign="middle">
                  <span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;display:block;margin-bottom:6px;">Remarks</span>
                  <span style="color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">{remarks}</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>"""

    html_body = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#e8edf5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8edf5;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 30%,#1d4ed8 65%,#0891b2 100%);padding:32px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
          <td style="background-color:#ffffff;border-radius:12px;padding:8px 20px;">
            <span style="color:#1d4ed8;font-size:20px;font-weight:800;letter-spacing:4px;">RMS</span>
          </td>
        </tr></table>
        <br /><span style="color:rgba(255,255,255,0.80);font-size:11px;letter-spacing:2px;text-transform:uppercase;">REIMBURSEMENT MANAGEMENT SYSTEM</span>
      </td></tr>

      <!-- STATUS ICON -->
      <tr><td align="center" style="padding:28px 40px 8px;background-color:#ffffff;">
        <div style="background-color:{cfg['icon_bg']};border-radius:50%;width:68px;height:68px;text-align:center;line-height:68px;font-size:32px;font-weight:700;color:{cfg['badge_color']};display:inline-block;">{cfg['icon']}</div>
      </td></tr>

      <!-- TITLE -->
      <tr><td align="center" style="padding:12px 40px 4px;background-color:#ffffff;">
        <span style="color:#0f172a;font-size:24px;font-weight:800;">{cfg['title']}</span>
      </td></tr>
      <tr><td align="center" style="padding:0 40px 4px;background-color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="width:48px;height:3px;background-color:#1d4ed8;border-radius:2px;"></td>
        </tr></table>
      </td></tr>
      <tr><td align="center" style="padding:8px 40px 20px;background-color:#ffffff;">
        <span style="color:#64748b;font-size:13px;line-height:20px;">{cfg['subtitle']}</span>
      </td></tr>

      <!-- GREETING -->
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <span style="color:#334155;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Hello, <strong style="color:#1d4ed8;">{applicant_name}</strong></span>
      </td></tr>

      <!-- EMPLOYEE INFO -->
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;background-color:#f8fafc;">
          <tr>
            <td style="padding:14px 16px;background-color:#f1f5f9;border-bottom:1px solid #e2e8f0;border-radius:14px 14px 0 0;">
              <span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">&#128100; Employee Information</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Claim Number</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;">{application_no}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Employee Name</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;">{applicant_name}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Department</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;">{department}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Designation</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;">{designation}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;padding-right:8px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Application Date</span>
                    <span style="color:#1d4ed8;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;">{claim_date}</span>
                  </td>
                  <td width="33%" style="border-left:1px solid #e2e8f0;padding-left:12px;">
                    <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Status</span>
                    <span style="background-color:{cfg['badge_bg']};color:{cfg['badge_color']};font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;border:1px solid {cfg['badge_border']};">{status}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- EXPENSE DETAILS -->
      <tr><td style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:14px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:10px;">
                    <div style="background-color:#dbeafe;border-radius:6px;width:28px;height:28px;text-align:center;line-height:28px;font-size:14px;display:inline-block;">&#128203;</div>
                  </td>
                  <td><span style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;">Expense Details</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0;overflow-x:auto;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="min-width:600px;">
                <tr style="background-color:#f1f5f9;">
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Date</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Claim Type</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">Purpose</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Mode</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">Project</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">From</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;white-space:nowrap;">To</td>
                  <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;text-align:right;white-space:nowrap;">Amount</td>
                </tr>
                {expense_rows}
                <tr style="background-color:#eff6ff;border-top:2px solid #bfdbfe;">
                  <td colspan="7" style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1d4ed8;font-weight:700;text-align:right;">Total Amount</td>
                  <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1d4ed8;font-weight:800;text-align:right;white-space:nowrap;">&#2547; {amount:,.0f}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      {remarks_section}

      <!-- VIEW CLAIM BUTTON -->
      <tr><td align="center" style="padding:0 32px 20px;background-color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="background-color:{cfg['btn_color']};border-radius:10px;padding:0;">
              <a href="http://localhost:3000/claims/{application_id}" target="_blank" style="display:inline-block;padding:12px 32px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">
                &#128269; View Claim Details
              </a>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- NOTICE -->
      <tr><td style="padding:0 32px 28px;background-color:#ffffff;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #fde68a;border-radius:12px;background-color:#fffbeb;">
          <tr><td style="padding:14px 18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="top" style="padding-right:12px;">
                  <div style="background-color:#f59e0b;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;font-size:14px;">&#9888;</div>
                </td>
                <td valign="middle">
                  <span style="color:#78350f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;display:block;">This is an automated email from RMS.</span>
                  <span style="color:#92400e;font-family:Arial,Helvetica,sans-serif;font-size:12px;display:block;">Please do not reply to this email.</span>
                  <span style="color:#92400e;font-family:Arial,Helvetica,sans-serif;font-size:12px;display:block;">If you have any questions, please contact our support team.</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background-color:#0f172a;border-radius:0 0 20px 20px;padding:24px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" width="50">
              <div style="background-color:#1e3a8a;border-radius:50%;width:40px;height:40px;text-align:center;line-height:40px;font-size:18px;">&#127911;</div>
            </td>
            <td valign="middle" style="padding-left:12px;">
              <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;display:block;">Need help?</span>
              <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;">support@company.com &nbsp;|&nbsp; +880 1234 567890</span>
            </td>
            <td valign="middle" align="right">
              <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;display:block;">&copy; 2026 RMS</span>
              <span style="color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;">All rights reserved.</span>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>"""
    await send_email(to_email, cfg["subject"], html_body)