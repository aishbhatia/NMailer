//First we call an instance of nodemailer, googleauthlibrary and googleapis to make use of them.
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
//Change the configExample file and call the file here to use this script.
const config = require('./config');

//We then make an project on the google developer console. We then make an Oauth2 consent screen, followed by an OAuth2 client ID.
//We then use that client ID to make an api and authorize the api on developers.google.com/oauthplayground
//We can retrieve our refresh token from the authorized api tokens.
const CLIENT_ID = config.clientID;
const CLIENT_SECRET = config.clientSecret;
const REDIRECT_URI = config.redirectURI;
const REFRESH_TOKEN = config.refreshToken;

    /*
    The createTransport() method from the Nodemailer library is used to create a transport object for sending emails.
    In this case, we're using the Gmail service to send emails.
    The transporter object is configured with the necessary SMTP credentials,
    including the Gmail account's email address (user) and password (pass).
    This allows Nodemailer to authenticate with Gmail's SMTP server and send emails on behalf of the specified account.
     */
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: config.email,
          pass: config.emailPassword,
        },
      });

    /* The authenticate() function creates an instance of OAuth2Client from the google-auth-library by taking clientID
    clientSecret and redirectURI. */
    async function authenticate() {
        const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
        // The below line checks if the access token is expired or about to expire,
        // by using the refresh token to obtain a new access token.
        if (oAuth2Client.isTokenExpiring()) {
          const token = await oAuth2Client.refreshAccessToken();
          oAuth2Client.setCredentials(token.res.data);
        }
        return oAuth2Client;
      }
   /*
   The unreadMails() function fetches the unread emails using the Gmail API.
   It uses the google.gmail() method to create a Gmail client with the specified version and authentication.
    */
    async function unreadMails(auth) {
        try {
            const gmail = google.gmail({ version: 'v1', auth });
            //This calls gmail.users.messages.list with query as 'is:unread' which retrieves the list of unread messages
            //in the form of id and threadID
            const response = await gmail.users.messages.list({
                userId: 'me',
                q: 'is:unread',
            });
            return response.data.messages;
        }
        catch (error){
            console.error('Error reading mails ', error)
        }
    }

    /*
    The reply() function handles replying to an email.
     */
   async function reply(auth, email) {
      try {
          //This modifies the threads by modifying their labelIDs to 'INBOX'
          const gmail = google.gmail({version: 'v1', auth});
          await gmail.users.threads.modify({
              userId: 'me',
              id: email.threadId,
              addLabelIds: ['INBOX'],
          });

          //This method then fetches the complete messages.
          const message = await gmail.users.messages.get({
              userId: 'me',
              id: email.id,
              format: 'full',
          });
          /*The below lines are used to retrieve the headers. Which is then used to retrieve the from(sender email address),
          subject(subject of the email), reference(reference of the entire email thread) and the inReplyTo(the email which
          is being replied to in the current iteration. This helps us to keep the replies in the single thread and in
          chronological order).
           */
          const headers = message.data.payload.headers;

          /*Here, the code uses the find() method on the headers array. It finds the first element that satisfies the
          given condition. Here it checks whether there is a header with the name 'From' in header list. '=>' The arrow
          acts as a condition (such that).*/
          const fromHeader = headers.find((header) => header.name === 'From');
          const from = fromHeader ? fromHeader.value : '';
          const subjectHeader = headers.find((header) => header.name === 'Subject');
          const subject = subjectHeader ? subjectHeader.value : '';
          const referencesHeader = headers.find((header) => header.name === 'References');
          const references = referencesHeader ? referencesHeader.value : '';
          const inReplyToHeader = headers.find((header) => header.name === 'In-Reply-To');
          const inReplyTo = inReplyToHeader ? inReplyToHeader.value : '';

          const mailOptions = {
              from: 'aishbirs@gmail.com',
              to: from,
              subject: 'Re: ' + subject,
              text: 'Thank you for sending me an email.',
              headers: {
                  'References': references,
                  'In-Reply-To': inReplyTo,
              },
          };
          await transporter.sendMail(mailOptions);
      }
      catch (error) {
        console.error('Error sending email:', error);
      }
   }

  /* Function to call all the above functions. In this we first initialize a variable auth in which we call authenticate function.
   After authentication the same authenticated user is used to retrieve unread emails.
   Then we loop in each email in the list of emails to retrieve the unread emails and then reply to those mails.
   */
  async function processEmails() {
    try {
      const auth = await authenticate();
      const emails = await unreadMails(auth);
      for (const email of emails) {
        // Check if the email has no prior replies
        if (!email.historyId) {
          await reply(auth, email);
        }
      }
    } catch (error) {
      console.error('Error processing emails:', error);
    }

    /* This puts a delay in the code with a random number between 45 to 120 which then delays the processEmails
    function. */
    const delay = Math.floor(Math.random() * (120 - 45 + 1) + 45);
    setTimeout(processEmails, delay * 1000);
  }
  
  // Calling the processing function.
  processEmails();

