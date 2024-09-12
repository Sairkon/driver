import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import TelegramBot from 'telegram-bot-api';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';


const app = express();
const port = 3000;
const prisma = new PrismaClient();


const BOT_TOKEN = '6620967790:AAHT2TKICP-O1Y_spYDVOR8UYkfSA53DQ-I';
const CHAT_ID = '613432487';
const bot = new TelegramBot({ token: BOT_TOKEN });


const ACCESS_TOKEN = 'your-secure-token';


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, '../client')));

function isValidPhoneNumber(phoneNumber) {
  const phoneRegex = /^\+1\d{10}$/; 
  return phoneRegex.test(phoneNumber);
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 4,
  message: 'Too many requests from this IP, please try again later.'
}); 

app.use('/submit_form', limiter);
app.use('/emp_form', limiter);

async function isDuplicateSubmission( phoneNumber, email) {
  const existingApplication = await prisma.application.findFirst({
    where: { 
      phone: phoneNumber,
      email: email
    }
  });
  return existingApplication !== null;
}
async function isDuplicateSubmissionCompany(phoneNumber) {
  const existingApplication = await prisma.companyApplication.findFirst({
    where: { 
      phoneNumber: phoneNumber
    }
  });
  return existingApplication !== null;
}

app.post('/submit_form', async (req, res) => {
  const { fullName, phoneNumber, email, role } = req.body;
  
  if (!fullName || !phoneNumber || !email || !role) {
    return res.status(400).send('One or more required fields are empty.');
  }

  const isDuplicate = await isDuplicateSubmission(phoneNumber, email);
  if (isDuplicate) {
    return res.status(400).send('A similar application already exists.');
  }

  try {
    await prisma.application.create({
      data: {
        fullName,
        phone: phoneNumber,
        email,
        role
      }
    });

    const message = `New driver application!\nName: ${fullName}\nPhone: ${phoneNumber}\nEmail: ${email}\nRole: ${role}`;
    await bot.sendMessage({ chat_id: CHAT_ID, text: message });

    res.json({ success: 'Thank you for submitting.<br>We will contact you as soon as possible.' });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('An error occurred while processing your data.');
  }
});

app.post('/emp_form', async (req, res) => {
  const { Name, phoneNumber, companyName, roles } = req.body;

  
  if (!Name || !phoneNumber || !roles) {
    return res.status(400).send('One or more required fields are empty.');
  }

  const isDuplicate = await isDuplicateSubmissionCompany(phoneNumber);
  if (isDuplicate) {
    return res.status(400).send('A similar application already exists.');
  }

  try {
    await prisma.companyApplication.create({
      data: {
        name:Name,
        phoneNumber,
        companyName: companyName || "Not specified",
        roles: roles.join(', ')
      }
    });
    const message = `New company application!\nName: ${Name}\nPhone: ${phoneNumber}\nCompany: ${companyName || 'not specified'}\nLooking for: ${roles.join(', ')}`;
    await bot.sendMessage({ chat_id: CHAT_ID, text: message });

    res.send({ success: 'Thank you for submitting.<br>We will contact you as soon as possible.' });
  }catch(error){
    console.error('Error processing application:', error);
    res.status(500).send('An error occurred while processing your data.');
  }

});

app.get('/export/excel', async (req, res) => {
    const token = req.query.token;
  
    if (token !== ACCESS_TOKEN) {
      return res.status(403).send('Access denied: Invalid token.');
    }
  
    try {
      const applications = await prisma.application.findMany();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Applications');
  
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'fullName', width: 30 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 30 },
        { header: 'Created At', key: 'createdAt', width: 20 }
      ];
  
      applications.forEach(app => {
        worksheet.addRow(app);
      });
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=applications.xlsx');
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).send('An error occurred while exporting data.');
    }
});
  


app.get('/', (req, res) => {
  const filePath = join(__dirname, '../client/index.html');
  res.sendFile(filePath);
});

app.get('/employee-form', (req, res) => {
  const filePath = join(__dirname, '../client/employee-form.html');
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


