require('dotenv').config();
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Initialize WhatsApp client with session persistence
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'payment-reminders' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Event: Display QR code for initial authentication
client.on('qr', (qr) => {
  console.log('\n📱 Scan this QR code with WhatsApp to authenticate:');
  qrcode.generate(qr, { small: true });
  console.log('\n👆 Open WhatsApp > Linked Devices > Link a Device\n');
});

// Event: Client is ready
client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
  console.log('⏰ Reminder scheduler is active.');
});

// Event: Authentication successful
client.on('authenticated', () => {
  console.log('🔐 Authentication successful!');
});

// Event: Handle errors
client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️  Client disconnected:', reason);
});

// =====================================================
// INVOICE DATA - Replace with your actual data source
// =====================================================
const invoices = [
  {
    name: 'Amit Kumar',
    phoneE164: '919876543210', // Format: country code + number (no + or spaces)
    amount: 2500,
    currency: '₹',
    dueDate: '2026-02-15',
    invoiceNo: 'INV-101'
  },
  {
    name: 'Priya Sharma',
    phoneE164: '919876543211',
    amount: 5000,
    currency: '₹',
    dueDate: '2026-02-14',
    invoiceNo: 'INV-102'
  }
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Convert E164 phone number to WhatsApp chat ID
function toChatId(phoneE164) {
  // phoneE164 should be digits only, e.g., '919876543210'
  return `${phoneE164}@c.us`;
}

// Check if invoice is due soon or overdue
function isDueSoonOrOverdue(invoice) {
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Send reminders if:
  // - 3 days before due date
  // - 1 day before due date
  // - On due date
  // - 1 day after due date (overdue)
  return diffDays <= 3 && diffDays >= -1;
}

// Create personalized reminder message
function createReminderMessage(invoice) {
  const today = new Date();
  const dueDate = new Date(invoice.dueDate);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  let urgency = '';
  if (diffDays < 0) {
    urgency = '⚠️ *OVERDUE* - ';
  } else if (diffDays === 0) {
    urgency = '🔔 *DUE TODAY* - ';
  } else if (diffDays === 1) {
    urgency = '⏰ *Due Tomorrow* - ';
  } else {
    urgency = `📅 Due in ${diffDays} days - `;
  }

  const message = `${urgency}Payment Reminder\n\n` +
    `Hi ${invoice.name},\n\n` +
    `This is a friendly reminder for:\n` +
    `📄 Invoice: *${invoice.invoiceNo}*\n` +
    `💰 Amount: *${invoice.currency}${invoice.amount}*\n` +
    `📆 Due Date: *${invoice.dueDate}*\n\n` +
    `Please process the payment at your earliest convenience. ` +
    `Reply to this message once payment is completed.\n\n` +
    `Thank you!`;

  return message;
}

// Send reminder via WhatsApp
async function sendReminder(invoice) {
  try {
    const chatId = toChatId(invoice.phoneE164);
    const message = createReminderMessage(invoice);
    
    await client.sendMessage(chatId, message);
    console.log(`✅ Reminder sent to ${invoice.name} (${invoice.invoiceNo})`);
    
    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.error(`❌ Failed to send to ${invoice.name}:`, error.message);
  }
}

// Process all due reminders
async function processDueReminders() {
  console.log('\n🔍 Checking for due payment reminders...');
  
  let count = 0;
  for (const invoice of invoices) {
    if (isDueSoonOrOverdue(invoice)) {
      await sendReminder(invoice);
      count++;
    }
  }
  
  if (count === 0) {
    console.log('✅ No reminders to send at this time.');
  } else {
    console.log(`\n📊 Total reminders sent: ${count}\n`);
  }
}

// =====================================================
// SCHEDULER - Run every day at 10:00 AM IST
// =====================================================
cron.schedule('0 10 * * *', async () => {
  console.log(`\n⏰ [${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Running scheduled reminder check...`);
  await processDueReminders();
}, {
  timezone: 'Asia/Kolkata'
});

// Optional: Send test reminder immediately on startup (comment out in production)
// client.on('ready', async () => {
//   console.log('\n🧪 Sending test reminders...');
//   await processDueReminders();
// });

// =====================================================
// START THE CLIENT
// =====================================================
console.log('🚀 Starting WhatsApp Payment Reminder Agent...');
client.initialize();
