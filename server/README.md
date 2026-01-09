# TrackNGuide QR Email Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your Gmail credentials (use an App Password for Gmail accounts with 2FA).
2. Run `npm install` in the `server` folder.
3. Start the server with `npm start`.

## API

### POST /send-student-qr
Send a JSON body:
```
{
  "name": "Student Name",
  "email": "student@email.com",
  "course": "BSIT",
  "year": "1"
}
```

If successful, the student will receive an email with their unique QR code.
