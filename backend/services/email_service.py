import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Email notification service"""
    
    def __init__(self):
        self.smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', 587))
        self.smtp_user = os.environ.get('SMTP_USER', '')
        self.smtp_password = os.environ.get('SMTP_PASSWORD', '')
        self.from_email = os.environ.get('FROM_EMAIL', 'noreply@nugl.com')
    
    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Send email notification"""
        try:
            message = MIMEMultipart('alternative')
            message['From'] = self.from_email
            message['To'] = to_email
            message['Subject'] = subject
            
            html_part = MIMEText(html_content, 'html')
            message.attach(html_part)
            
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured. Email not sent.")
                return False
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    async def send_welcome_email(self, user_email: str, username: str):
        """Send welcome email to new users"""
        subject = "Welcome to NUGL - The Digital Greenhouse"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(to right, #14b8a6, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Welcome to NUGL!</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b;">Hi {username},</h2>
                    <p style="color: #475569; line-height: 1.6;">
                        Thank you for joining <strong>The Digital Greenhouse</strong> - where cannabis culture meets crypto innovation and AI intelligence!
                    </p>
                    <p style="color: #475569; line-height: 1.6;">
                        You now have access to:
                    </p>
                    <ul style="color: #475569; line-height: 1.8;">
                        <li>Real-time cannabis, crypto, and AI news</li>
                        <li>Global strain finder with dispensary links</li>
                        <li>NFT marketplace (Ethereum & Solana)</li>
                        <li>AI-powered cannabis expert chatbot</li>
                        <li>Crypto wallet integration</li>
                        <li>Affiliate earning opportunities</li>
                    </ul>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://nugl.com" style="background: #14b8a6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Platform</a>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
                        © 2025 NUGL. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """
        return await self.send_email(user_email, subject, html_content)
    
    async def send_price_alert(self, user_email: str, asset_name: str, current_price: float, target_price: float):
        """Send price alert notification"""
        subject = f"Price Alert: {asset_name} reached ${target_price}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #1e293b; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #14b8a6;">🔔 Price Alert Triggered!</h2>
                    <p style="color: #e2e8f0;">
                        <strong>{asset_name}</strong> has reached your target price:
                    </p>
                    <div style="background: #0f172a; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="color: #94a3b8; margin: 0;">Current Price</p>
                        <h1 style="color: #14b8a6; margin: 10px 0;">${current_price}</h1>
                        <p style="color: #94a3b8; margin: 0;">Target: ${target_price}</p>
                    </div>
                    <a href="https://nugl.com/portfolio" style="background: #14b8a6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View Portfolio</a>
                </div>
            </body>
        </html>
        """
        return await self.send_email(user_email, subject, html_content)
    
    async def send_newsletter(self, user_email: str, articles: list):
        """Send weekly newsletter"""
        subject = "NUGL Weekly: Top Cannabis, Crypto & AI News"
        
        articles_html = ""
        for article in articles[:5]:
            articles_html += f"""
            <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0;">{article['title']}</h3>
                <p style="color: #64748b; margin: 0;">{article['content'][:150]}...</p>
                <a href="{article.get('source_url', '#')}" style="color: #14b8a6; text-decoration: none; margin-top: 10px; display: inline-block;">Read more →</a>
            </div>
            """
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(to right, #14b8a6, #10b981); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📰 This Week at NUGL</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="color: #475569;">Here are the top stories from this week:</p>
                    {articles_html}
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://nugl.com/news" style="background: #14b8a6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View All News</a>
                    </div>
                </div>
            </body>
        </html>
        """
        return await self.send_email(user_email, subject, html_content)