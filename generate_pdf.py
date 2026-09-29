import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_filename = r"d:\Projects\skillsphere\SETUP_AND_RUN_GUIDE.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        alignment=0,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'CodeCustom',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e1b4b'),
        backColor=colors.HexColor('#f1f5f9'),
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8
    )

    story = []

    # Title Banner
    story.append(Paragraph("SkillSphere - Setup & Run Guide", title_style))
    story.append(Paragraph("COMPLETE STEP-BY-STEP PROCESS TO INSTALL & RUN THE MERN STACK APPLICATION", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceAfter=15))

    # 1. System Requirements
    story.append(Paragraph("1. System Requirements & Prerequisites", h1_style))
    story.append(Paragraph("Before running SkillSphere, ensure the following software tools are installed on your machine:", body_style))
    
    req_data = [
        [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Required Version</b>", body_style), Paragraph("<b>Description / Download</b>", body_style)],
        [Paragraph("Node.js", body_style), Paragraph("v18.x or higher", body_style), Paragraph("JavaScript Runtime (nodejs.org)", body_style)],
        [Paragraph("MongoDB", body_style), Paragraph("v6.0 or higher / Atlas", body_style), Paragraph("Database Service (mongodb.com)", body_style)],
        [Paragraph("NPM", body_style), Paragraph("v9.x or higher", body_style), Paragraph("Node Package Manager (Bundled with Node)", body_style)]
    ]
    t = Table(req_data, colWidths=[100, 120, 310])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e0e7ff')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # 2. Directory Structure Overview
    story.append(Paragraph("2. Repository Architecture", h1_style))
    story.append(Paragraph("The application is structured into two clean directories:", body_style))
    story.append(Paragraph("• <b>server/</b>: Express.js Backend REST API, Mongoose Schemas, Socket.io Gateway<br/>• <b>client/</b>: React.js Frontend Single Page Application (Vite)", body_style))
    story.append(Spacer(1, 10))

    # 3. Environment Variables
    story.append(Paragraph("3. Environment Configuration (.env)", h1_style))
    story.append(Paragraph("Create or inspect the file <code>server/.env</code> with the following variables:", body_style))
    story.append(Paragraph("PORT=5000<br/>MONGO_URI=mongodb://localhost:27017/skillsphere<br/>JWT_SECRET=skillsphere_super_secret_jwt_key_2026<br/>CLIENT_URL=http://localhost:5173<br/>NODE_ENV=development", code_style))
    story.append(Spacer(1, 10))

    # 4. Step-by-Step Server Launch
    story.append(Paragraph("4. Step 1: Launch the Express Backend Server", h1_style))
    story.append(Paragraph("Open a terminal or command prompt in the project root directory and execute:", body_style))
    story.append(Paragraph("cd server<br/>npm install<br/>npm run dev", code_style))
    story.append(Paragraph("<b>Expected Output:</b><br/><code>MongoDB Connected: localhost</code><br/><code>🚀 SkillSphere Server listening on http://localhost:5000</code>", body_style))
    story.append(Spacer(1, 10))

    # 5. Step-by-Step Client Launch
    story.append(Paragraph("5. Step 2: Launch the React Frontend Client", h1_style))
    story.append(Paragraph("Open a second terminal window or command prompt and execute:", body_style))
    story.append(Paragraph("cd client<br/>npm install<br/>npm run dev", code_style))
    story.append(Paragraph("<b>Expected Output:</b><br/><code>VITE v8.2.1 ready in 500 ms</code><br/><code>➜ Local: http://localhost:5173/</code>", body_style))
    story.append(Spacer(1, 10))

    # 6. Verification & Usage
    story.append(Paragraph("6. Accessing & Testing the Application", h1_style))
    story.append(Paragraph("• Open <b>http://localhost:5173/</b> in your Web Browser.<br/>• Click <b>Get Started</b> to register a new account.<br/>• Complete the 3-step onboarding profile.<br/>• Browse match recommendations on the <b>Matches</b> page.<br/>• Send swap proposals and test live messaging via <b>Chat</b>.", body_style))
    story.append(Spacer(1, 10))

    # 7. Troubleshooting
    story.append(Paragraph("7. Troubleshooting Common Issues", h1_style))
    story.append(Paragraph("<b>Issue: Error: listen EADDRINUSE :::5000</b><br/>• Cause: Another process is using port 5000.<br/>• Fix: The server automatically falls back to port 5001, or you can kill the process using port 5000.<br/><br/><b>Issue: MongoDB Connection Error</b><br/>• Cause: Local MongoDB service is not started.<br/>• Fix: Start MongoDB service (<code>net start MongoDB</code> on Windows) or update <code>MONGO_URI</code> in <code>server/.env</code> to a free MongoDB Atlas connection string.", body_style))

    doc.build(story)
    print("PDF generated successfully at:", pdf_filename)

if __name__ == "__main__":
    generate_pdf()
