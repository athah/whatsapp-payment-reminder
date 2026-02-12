# 📱 WhatsApp Payment Reminder Agent

Automated WhatsApp Web agent that sends scheduled payment reminders to clients using `whatsapp-web.js`. This is a low-code solution for automating payment follow-ups via WhatsApp.

## ⚠️ Important Disclaimer

This project uses **unofficial** WhatsApp Web automation through `whatsapp-web.js`. It is:
- **NOT officially supported** by WhatsApp/Meta
- Potentially against WhatsApp Terms of Service
- May result in temporary or permanent number restrictions/bans
- Best suited for **low-volume, personal/internal use**

For production systems with high volume, use the **official WhatsApp Business API** instead.

## ✨ Features

- ✅ **Session Persistence**: QR code authentication required only once
- 📅 **Scheduled Reminders**: Automatic daily checks at 10:00 AM IST
- 🎯 **Smart Timing**: Sends reminders 3 days before, 1 day before, on due date, and 1 day after
- 💬 **Personalized Messages**: Dynamic messages with invoice details and urgency indicators
- ⏱️ **Rate Limiting**: 2-second delays between messages to avoid detection
- 🔔 **Rich Formatting**: Uses WhatsApp markdown for better readability

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **WhatsApp Account** with active number
- A phone that can scan QR codes

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/athah/whatsapp-payment-reminder.git
   cd whatsapp-payment-reminder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you need a different timezone.

4. **Update invoice data**
   
   Open `index.js` and modify the `invoices` array (line 45) with your client data:
   ```javascript
   const invoices = [
     {
       name: 'Client Name',
       phoneE164: '919876543210', // Country code + number (no +)
       amount: 5000,
       currency: '₹',
       dueDate: '2026-03-15', // YYYY-MM-DD
       invoiceNo: 'INV-001'
     }
   ];
   ```

5. **Run the agent**
   ```bash
   npm start
   ```

6. **Scan QR Code**
   
   A QR code will appear in your terminal. Scan it with:
   - Open WhatsApp on your phone
   - Go to **Settings** → **Linked Devices**
   - Tap **Link a Device**
   - Scan the QR code

7. **Keep it running**
   
   The agent must stay running to send scheduled reminders. Use tools like:
   - `pm2` for production servers
   - `screen` or `tmux` for remote servers
   - Deploy to cloud platforms (Heroku, Railway, Render)

## 📋 How It Works

1. **Authentication**: Uses `LocalAuth` to save WhatsApp session locally (`.wwebjs_auth` folder)
2. **Scheduler**: Runs a cron job daily at 10:00 AM IST
3. **Logic**: Checks each invoice's due date and sends reminders if within threshold
4. **Sending**: Messages are sent via WhatsApp Web protocol with delays between each

### Reminder Schedule

| Days to Due Date | Reminder Sent? | Message Prefix |
|------------------|----------------|----------------|
| 3 days before    | ✅ Yes         | "📅 Due in 3 days" |
| 2 days before    | ✅ Yes         | "📅 Due in 2 days" |
| 1 day before     | ✅ Yes         | "⏰ Due Tomorrow" |
| Due date (0)     | ✅ Yes         | "🔔 DUE TODAY" |
| 1 day overdue    | ✅ Yes         | "⚠️ OVERDUE" |
| 2+ days overdue  | ❌ No          | — |

## 🔧 Configuration

### Environment Variables

Edit `.env` file:
```env
TZ=Asia/Kolkata  # Your timezone
```

### Change Schedule Time

Edit the cron pattern in `index.js` (line 157):
```javascript
cron.schedule('0 10 * * *', async () => {  // 10:00 AM daily
  // Change to '0 14 * * *' for 2:00 PM
  // Change to '30 9 * * *' for 9:30 AM
});
```

[Cron pattern reference](https://crontab.guru/)

### Customize Message Template

Edit the `createReminderMessage()` function in `index.js` (line 88).

## 📊 Production Deployment

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start index.js --name whatsapp-reminder
pm2 save
pm2 startup  # Enable auto-restart on reboot
```

**Useful PM2 commands:**
```bash
pm2 status              # Check status
pm2 logs whatsapp-reminder  # View logs
pm2 restart whatsapp-reminder
pm2 stop whatsapp-reminder
```

### Deploy to Cloud

**Heroku / Railway / Render:**
- Add Node.js buildpack
- Set environment variables
- Note: Session may reset on dyno restarts (re-scan QR)

**VPS (DigitalOcean, AWS, etc.):**
- Use PM2 for process management
- Session persists across restarts

## 🗄️ Data Integration

Currently, invoice data is hardcoded in `index.js`. For dynamic data:

### Option 1: Google Sheets (via API)
```bash
npm install googleapis
```
Fetch rows from a Google Sheet on each run.

### Option 2: Database
```bash
npm install mysql2  # or pg, mongodb
```
Query invoices from your database.

### Option 3: External API
Fetch from your CRM/accounting software API.

## 🐛 Troubleshooting

### QR Code Not Appearing
- Check terminal supports UTF-8
- Try running in a different terminal emulator

### "Authentication Failed"
- Delete `.wwebjs_auth` folder and re-scan QR
- Ensure phone has stable internet

### Messages Not Sending
- Check console for error logs
- Verify phone numbers are in E164 format (`919876543210`)
- Ensure WhatsApp Web session is active

### Session Disconnects Frequently
- WhatsApp may be detecting automation
- Reduce message frequency
- Add more delay between messages

### Number Gets Banned
- You sent too many messages too quickly
- Use official WhatsApp Business API for high volume

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## ⚡ Roadmap

- [ ] Web dashboard for managing invoices
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Multi-language support
- [ ] Webhook for payment confirmations
- [ ] Email fallback if WhatsApp fails
- [ ] Analytics and reporting

## 📚 Resources

- [whatsapp-web.js Documentation](https://wwebjs.dev/)
- [node-cron Documentation](https://github.com/node-cron/node-cron)
- [WhatsApp Business API](https://business.whatsapp.com/products/business-platform) (Official)

---

**Made with ❤️ for automating payment reminders**
